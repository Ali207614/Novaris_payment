const test = require('node:test');
const assert = require('node:assert/strict');
const {
    extractVerifixAttendanceCorrections,
    hasExistingTrack,
    normalizeTime,
    syncVerifixAttendanceForRequest,
    calculateFactValue
} = require('../src/helpers/verifixAttendance');

// Mock config for tests
const config = require('../src/verifixConfig');
config.verifix.factValueUnit = 'seconds';
config.verifix.timeKinds = { present: 81, late: 82, earlyLeave: 83, absence: 84 };

test('Verifix attendance parser accepts common date and time formats', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025
Kelish(vaqt): 8:00
Ketish(vaqt): 18.30

Sana: 30.06.25
Kelish(vaqt): 07;00

Sana: 2025.07.03
Ketish(vaqt): 19:15
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '08:00:00', exitTime: '18:30:00' },
        { date: '2025-06-30', arrivalTime: '07:00:00', exitTime: '' },
        { date: '2025-07-03', arrivalTime: '', exitTime: '19:15:00' }
    ]);
});

test('Verifix attendance parser applies one time pair to multiple dates', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025, 2025.07.03
Kelish(vaqt): 8.00
Ketish(vaqt): 17:45
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '08:00:00', exitTime: '17:45:00' },
        { date: '2025-07-03', arrivalTime: '08:00:00', exitTime: '17:45:00' }
    ]);
});

test('Verifix attendance parser accepts blank arrival or exit values', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025
Kelish(vaqt):
Ketish(vaqt): 18:00
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '', exitTime: '18:00:00' }
    ]);
    assert.equal(normalizeTime(''), '');
});

test('existing Verifix tracks are detected by employee, type and datetime', () => {
    assert.equal(
        hasExistingTrack(
            [{ employee_id: 77, track_type: 'I', track_datetime: '2025-07-01T08:00:00+05:00' }],
            77,
            'I',
            '2025-07-01 08:00:00'
        ),
        true
    );
});

test('Verifix attendance sync applies timesheet correction facts', async () => {
    const applied = [];
    const verifixController = {
        async searchLastTrack(employeeId, trackDate) {
            return { status: true, data: { staff_id: "staff-123" } };
        },
        async exportTimesheet(periodBeginDate, periodEndDate, employeeIds) {
            return {
                status: true,
                data: [
                    {
                        timesheet_date: "01.07.2025",
                        input_time: "",
                        output_time: ""
                    }
                ]
            };
        },
        async applyVerifixAttendanceCorrection(payload) {
            applied.push(payload);
            return { status: true };
        }
    };

    const result = await syncVerifixAttendanceForRequest({
        request: {
            menu: 11,
            comment: 'Sana: 01.07.2025\nKelish(vaqt): 8:00\nKetish(vaqt): 18:00'
        },
        requester: { EmployeeID: 77 },
        verifixController
    });

    assert.equal(result.status, true);
    assert.equal(result.created, 1);
    assert.deepEqual(applied, [
        {
            staff_id: "staff-123",
            registration_period: "01.07.2025",
            timesheets: [
                {
                    timesheet_date: "01.07.2025",
                    input_time: "01.07.2025 08:00:00",
                    output_time: "01.07.2025 18:00:00",
                    fact_items: [
                        { time_kind_id: 81, fact_value: 36000 },
                        { time_kind_id: 82, fact_value: 0 },
                        { time_kind_id: 83, fact_value: 0 },
                        { time_kind_id: 84, fact_value: 0 }
                    ]
                }
            ]
        }
    ]);
});

test('Verifix attendance sync fails without a parseable correction', async () => {
    let applyCalled = false;
    const result = await syncVerifixAttendanceForRequest({
        request: { menu: 11, comment: 'Sana yoq' },
        requester: { EmployeeID: 77 },
        verifixController: {
            async searchLastTrack() {
                return { status: true, data: { staff_id: "123" } };
            },
            async applyVerifixAttendanceCorrection() {
                applyCalled = true;
                return { status: true };
            }
        }
    });

    assert.equal(result.status, false);
    assert.equal(applyCalled, false);
});

test('calculateFactValue returns correct seconds', () => {
    config.verifix.factValueUnit = 'seconds';
    const seconds = calculateFactValue("01.07.2025 09:00:00", "01.07.2025 18:00:00");
    assert.equal(seconds, 9 * 3600); // 32400
});

test('calculateFactValue returns correct minutes', () => {
    config.verifix.factValueUnit = 'minutes';
    const minutes = calculateFactValue("01.07.2025 09:00:00", "01.07.2025 18:00:00");
    assert.equal(minutes, 9 * 60); // 540
    // Reset config for other tests
    config.verifix.factValueUnit = 'seconds';
});
