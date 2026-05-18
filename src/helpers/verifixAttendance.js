const moment = require("moment");
const { get } = require("lodash");
const config = require("../verifixConfig");

const DATE_PATTERN = /(?:\b(\d{4})[\s.,:\/-]+(\d{1,2})[\s.,:\/-]+(\d{1,2})\b|\b(\d{1,2})[\s.,:\/-]+(\d{1,2})[\s.,:\/-]+(\d{2,4})\b)/g;
const ARRIVAL_PATTERN = /Kelish[^\S\r\n]*\(?[^\S\r\n]*vaqt[^\S\r\n]*\)?[^\S\r\n]*:?[^\S\r\n]*([^\r\n]*)/iu;
const EXIT_PATTERN = /Ketish[^\S\r\n]*\(?[^\S\r\n]*vaqt[^\S\r\n]*\)?[^\S\r\n]*:?[^\S\r\n]*([^\r\n]*)/iu;
const TIME_PATTERN = /(\d{1,2})\s*[:.;]\s*(\d{2})|\b(\d{1,2})\b/u;

const isVerifixAttendanceRequest = (request = {}) => {
    return Number(get(request, "menu")) === 11 ||
        String(get(request, "menuName", "")).toLowerCase().includes("verifix") ||
        String(get(request, "comment", "")).toLowerCase().includes("#verifix");
};

const normalizeDateParts = (year, month, day) => {
    const normalizedYear = String(year).length === 2 ? 2000 + Number(year) : Number(year);
    const parsed = moment.utc({
        year: normalizedYear,
        month: Number(month) - 1,
        date: Number(day)
    });

    if (!parsed.isValid() || parsed.year() !== normalizedYear || parsed.month() !== Number(month) - 1 || parsed.date() !== Number(day)) {
        return "";
    }

    return parsed.format("YYYY-MM-DD");
};

const normalizeDateMatch = (match) => {
    if (match[1]) {
        return normalizeDateParts(match[1], match[2], match[3]);
    }

    return normalizeDateParts(match[6], match[5], match[4]);
};

const normalizeTime = (value = "") => {
    const text = String(value || "").trim();
    if (!text) return "";

    const match = text.match(TIME_PATTERN);
    if (!match) return "";

    const hour = Number(match[1] || match[3]);
    const minute = Number(match[2] || 0);

    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return "";
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
};

const extractTime = (text = "", pattern) => {
    const match = String(text || "").match(pattern);
    return normalizeTime(match?.[1] || "");
};

const extractDateMatches = (text = "") => {
    const matches = [];
    DATE_PATTERN.lastIndex = 0;

    let match;
    while ((match = DATE_PATTERN.exec(String(text || "")))) {
        const date = normalizeDateMatch(match);
        if (date) {
            matches.push({ date, index: match.index });
        }
    }

    return matches;
};

const extractVerifixAttendanceCorrections = (comment = "") => {
    const text = String(comment || "");
    const dateMatches = extractDateMatches(text);
    const byDate = new Map();
    const segments = dateMatches.map((current, index) => {
        const next = dateMatches[index + 1];
        const segment = text.slice(current.index, next ? next.index : text.length);

        return {
            date: current.date,
            arrivalTime: extractTime(segment, ARRIVAL_PATTERN),
            exitTime: extractTime(segment, EXIT_PATTERN)
        };
    });
    const sharedTimes = segments.length > 1 &&
        segments.slice(0, -1).every(item => !item.arrivalTime && !item.exitTime)
        ? segments[segments.length - 1]
        : null;

    for (const current of segments) {
        const arrivalTime = current.arrivalTime || get(sharedTimes, "arrivalTime", "");
        const exitTime = current.exitTime || get(sharedTimes, "exitTime", "");

        if (!arrivalTime && !exitTime) continue;

        const existing = byDate.get(current.date) || { date: current.date };
        byDate.set(current.date, {
            date: current.date,
            arrivalTime: existing.arrivalTime || arrivalTime || "",
            exitTime: existing.exitTime || exitTime || ""
        });
    }

    return [...byDate.values()];
};

const buildTrackDatetime = (date, time) => `${date} ${time}`;

const normalizeTrackDatetime = (value = "") => {
    const parsed = moment(String(value || "").replace("T", " "), ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm", moment.ISO_8601], true);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : String(value || "").slice(0, 19).replace("T", " ");
};

const hasExistingTrack = (tracks = [], employeeId, trackType, trackDatetime) => {
    const targetDatetime = normalizeTrackDatetime(trackDatetime);

    return tracks.some((track) =>
        String(get(track, "employee_id")) === String(employeeId) &&
        String(get(track, "track_type")) === String(trackType) &&
        normalizeTrackDatetime(get(track, "track_datetime")) === targetDatetime
    );
};

const calculateFactValue = (inputTime, outputTime) => {
    if (!inputTime || !outputTime) return 0;
    const start = moment(inputTime, "DD.MM.YYYY HH:mm:ss");
    const end = moment(outputTime, "DD.MM.YYYY HH:mm:ss");
    if (!start.isValid() || !end.isValid()) return 0;
    
    let durationSeconds = end.diff(start, 'seconds');
    if (durationSeconds < 0) durationSeconds = 0;

    const unit = config.verifix.factValueUnit || 'seconds';
    if (unit === 'minutes') {
        return Math.floor(durationSeconds / 60);
    }
    return durationSeconds;
};

const syncVerifixAttendanceForRequest = async ({ request, requester, verifixController }) => {
    if (!isVerifixAttendanceRequest(request)) {
        return { status: true, skipped: true, reason: "not_verifix_request" };
    }

    const employeeId = Number(get(requester, "EmployeeID"));
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
        return { status: false, message: "So'rov yuborgan xodim uchun Employee ID topilmadi." };
    }

    const corrections = extractVerifixAttendanceCorrections(get(request, "comment", ""));
    if (!corrections.length) {
        return { status: false, message: "Verifix uchun Sana va Kelish/Ketish vaqti topilmadi." };
    }

    let created = 0;
    let skipped = 0;

    const firstDateVerifix = moment(corrections[0].date, "YYYY-MM-DD").format("DD.MM.YYYY");
    const lastTrackResult = await verifixController.searchLastTrack(employeeId, firstDateVerifix);
    const staffId = get(lastTrackResult, "data.staff_id");
    
    if (!staffId) {
        return { status: false, message: "Xodimning staff_id raqami topilmadi. Avvalgi Verifix ma'lumotlari yo'q." };
    }

    for (const correction of corrections) {
        const verifixDate = moment(correction.date, "YYYY-MM-DD").format("DD.MM.YYYY");
        
        const exportResult = await verifixController.exportTimesheet(verifixDate, verifixDate, [employeeId]);
        if (!exportResult.status) {
            return { status: false, message: exportResult.message || "Verifix timesheet export xatolik yuz berdi." };
        }
        
        const currentTimesheet = get(exportResult, "data[0]", {});
        
        let inputTime = currentTimesheet.input_time || "";
        let outputTime = currentTimesheet.output_time || "";
        
        if (correction.arrivalTime) {
            inputTime = `${verifixDate} ${correction.arrivalTime}`;
        }
        if (correction.exitTime) {
            outputTime = `${verifixDate} ${correction.exitTime}`;
        }
        
        if (!inputTime && !outputTime) {
            skipped += 1;
            continue;
        }

        const factValue = calculateFactValue(inputTime, outputTime);
        const { timeKinds } = config.verifix;

        const factItems = [
            { time_kind_id: timeKinds.present, fact_value: factValue },
            { time_kind_id: timeKinds.late, fact_value: 0 },
            { time_kind_id: timeKinds.earlyLeave, fact_value: 0 },
            { time_kind_id: timeKinds.absence, fact_value: 0 }
        ];

        const payload = {
            staff_id: staffId,
            registration_period: moment(correction.date, "YYYY-MM-DD").startOf('month').format("DD.MM.YYYY"),
            timesheets: [
                {
                    timesheet_date: verifixDate,
                    input_time: inputTime,
                    output_time: outputTime,
                    fact_items: factItems
                }
            ]
        };

        const applyResult = await verifixController.applyVerifixAttendanceCorrection(payload);
        if (!applyResult.status) {
            return { status: false, message: applyResult.message || "Verifix attendance correction xatolik yuz berdi." };
        }

        created += 1;
    }

    return { status: true, skipped: false, created, duplicateSkipped: skipped, corrections };
};

module.exports = {
    extractVerifixAttendanceCorrections,
    hasExistingTrack,
    isVerifixAttendanceRequest,
    normalizeTime,
    syncVerifixAttendanceForRequest,
    calculateFactValue
};
