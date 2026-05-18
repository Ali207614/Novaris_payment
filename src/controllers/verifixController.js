const axios = require('axios');
const { get } = require('lodash');
const config = require('../verifixConfig');
const loggerService = require('../services/loggerService');

class verifixController {
    constructor() {
        this.token = null;
        this.expiresAt = 0;
    }

    async auth() {
        try {
            const body = {
                grant_type: 'client_credentials',
                client_id: config.verifix.clientId,
                client_secret: config.verifix.clientSecret
            };

            const response = await axios.post(`${config.verifix.baseUrl}/security/oauth/token`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this._getTenantHeaders()
                }
            });

            if (response.data && response.data.access_token) {
                this.token = response.data.access_token;
                // Subtract 60 seconds as a buffer
                this.expiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
                await loggerService.logSystemAction('verifix_sync', 'VERIFIX_AUTH_SUCCESS');
                return { status: true };
            }
            await loggerService.logError(new Error('No token received'), {
                source: 'verifix_sync',
                action: 'VERIFIX_AUTH_FAILURE'
            });
            return { status: false, message: 'No token received' };
        } catch (err) {
            await loggerService.logError(err, {
                source: 'verifix_sync',
                action: 'VERIFIX_AUTH_FAILURE'
            });
            return { status: false, message: get(err, 'response.data.error_description', err.message) };
        }
    }

    _getTenantHeaders() {
        const headers = {};

        if (config.verifix.projectCode) {
            headers.project_code = config.verifix.projectCode;
        }

        if (config.verifix.filialId) {
            headers.filial_id = config.verifix.filialId;
        }

        return headers;
    }

    async _getAxiosInstance() {
        if (!this.token || Date.now() > this.expiresAt) {
            const authResult = await this.auth();
            if (!authResult.status) {
                throw new Error(`Verifix Auth failed: ${authResult.message}`);
            }
        }
        return axios.create({
            baseURL: config.verifix.baseUrl,
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                ...this._getTenantHeaders()
            }
        });
    }

    async getEmpInfo(phone = '') {
        try {
            const normalizedPhone = this._normalizePhone(phone);
            if (!normalizedPhone) {
                return { status: true, data: { value: [] } };
            }

            const instance = await this._getAxiosInstance();
            const matchedEmployee = await this._findEmployeeByPhone(instance, normalizedPhone);

            if (matchedEmployee) {
                return { status: true, data: { value: [this._formatEmployee(matchedEmployee)] } };
            }

            return { status: true, data: { value: [] } };
        } catch (err) {
            await loggerService.logError(err, {
                source: 'verifix_sync',
                action: 'VERIFIX_GET_EMP_INFO_ERROR',
                entity: { type: 'user_auth' }
            });
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async lookupEmployeeByPhone(phone = '') {
        try {
            const normalizedPhone = this._normalizePhone(phone);

            if (!normalizedPhone || normalizedPhone.length < 7) {
                return { status: false, message: "Telefon raqam noto'g'ri" };
            }

            const instance = await this._getAxiosInstance();
            const matchedEmployee = await this._findEmployeeByPhone(instance, normalizedPhone);

            if (!matchedEmployee) {
                return { status: true, data: null };
            }

            return { status: true, data: this._formatEmployee(matchedEmployee) };
        } catch (err) {
            await loggerService.logError(err, {
                source: 'verifix_sync',
                action: 'VERIFIX_EMPLOYEE_PHONE_LOOKUP_ERROR',
                entity: { type: 'employee' },
                metadata: { phoneLast4: this._normalizePhone(phone).slice(-4) }
            });
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    _formatEmployee(employee = {}) {
        const { primary, fallback } = this.getVerifixEmployeeSignInPhones(employee);
        return {
            EmployeeID: get(employee, 'employee_id'),
            LastName: get(employee, 'last_name', ''),
            FirstName: get(employee, 'first_name', ''),
            MiddleName: get(employee, 'middle_name', ''),
            JobTitle: get(employee, 'job_name') || get(employee, 'job_title', ''),
            MobilePhone: get(primary, '[0]', '') || get(fallback, '[0]', ''),
            DivisionName: get(employee, 'division_name') || get(employee, 'division', ''),
            LocationName: get(employee, 'location_name') || get(employee, 'location', ''),
            State: get(employee, 'state', ''),
            SalesPersonCode: -1
        };
    }

    _normalizePhone(phone = '') {
        return String(phone).replace(/\D/g, '');
    }

    _isSamePhone(left = '', right = '') {
        const normalizedLeft = this._normalizePhone(left);
        const normalizedRight = this._normalizePhone(right);

        if (!normalizedLeft || !normalizedRight) {
            return false;
        }

        return normalizedLeft === normalizedRight ||
            normalizedLeft.endsWith(normalizedRight) ||
            normalizedRight.endsWith(normalizedLeft);
    }

    getVerifixEmployeeSignInPhones(employee = {}) {
        const dynamicFields = [
            ...(Array.isArray(employee.fields) ? employee.fields : []),
            ...(Array.isArray(employee.dynamic_fields) ? employee.dynamic_fields : []),
            ...(Array.isArray(employee.dynamicFields) ? employee.dynamicFields : []),
            ...(Array.isArray(employee.additionalFields) ? employee.additionalFields : []),
            ...(Array.isArray(employee.additional_fields) ? employee.additional_fields : [])
        ];
        const adExtraNumFields = dynamicFields
            .filter(field => this._isAdExtraNumField(field))
            .flatMap(field => [
                get(field, 'value'),
                get(field, 'field_value'),
                get(field, 'text')
            ]);

        const primary = [
            get(employee, 'ad_Extra_Num'),
            get(employee, 'ad_extra_num'),
            this._getAdExtraNumFromObject(get(employee, 'dynamicFields')),
            this._getAdExtraNumFromObject(Array.isArray(employee.dynamic_fields) ? null : get(employee, 'dynamic_fields')),
            this._getAdExtraNumFromObject(Array.isArray(employee.additionalFields) ? null : get(employee, 'additionalFields')),
            this._getAdExtraNumFromObject(Array.isArray(employee.additional_fields) ? null : get(employee, 'additional_fields')),
            ...adExtraNumFields
        ].flatMap(value => Array.isArray(value) ? value : [value]).filter(Boolean);

        const fallback = [
            get(employee, 'phone_number')
        ].filter(Boolean);

        return { primary, fallback };
    }

    _isAdExtraNumField(field = {}) {
        const adExtraNumFieldCodes = new Set(['ad_extra_num']);

        return [
            get(field, 'code'),
            get(field, 'name'),
            get(field, 'field_name'),
            get(field, 'label')
        ].some(value => adExtraNumFieldCodes.has(this._normalizeFieldCode(value)));
    }

    _getAdExtraNumFromObject(value = {}) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }

        const matchedEntry = Object.entries(value).find(([key]) =>
            ['ad_extra_num'].includes(this._normalizeFieldCode(key))
        );

        return matchedEntry ? matchedEntry[1] : null;
    }

    _normalizeFieldCode(value = '') {
        return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    }

    async _findEmployeeByPhone(instance, phone) {
        let cursor = null;
        let fallbackEmployee = null;
        const visitedCursors = new Set();

        do {
            const headers = { limit: 500 };

            if (cursor) {
                if (visitedCursors.has(cursor)) {
                    return null;
                }
                visitedCursors.add(cursor);
                headers.cursor = cursor;
            }

            const response = await instance.post('/b/vhr/api/v1/core/employee$list', {}, { headers });

            const employees = get(response, 'data.data', []);
            
            const matchedEmployeeByAdExtraNum = employees.find(emp => {
                if (!this._isActiveEmployee(emp)) return false;
                const { primary } = this.getVerifixEmployeeSignInPhones(emp);
                return primary.some(value => this._isSamePhone(value, phone));
            });

            if (matchedEmployeeByAdExtraNum) {
                return matchedEmployeeByAdExtraNum;
            }

            if (!fallbackEmployee) {
                fallbackEmployee = employees.find(emp => {
                    if (!this._isActiveEmployee(emp)) return false;
                    const { fallback } = this.getVerifixEmployeeSignInPhones(emp);
                    return fallback.some(value => this._isSamePhone(value, phone));
                }) || null;
            }

            cursor = this._normalizeCursor(get(response, 'data.meta.next_cursor'));
        } while (cursor);

        return fallbackEmployee;
    }

    _isActiveEmployee(employee = {}) {
        const state = get(employee, 'state');

        return !state || state === 'A';
    }

    _normalizeCursor(cursor) {
        if (cursor === undefined || cursor === null) {
            return null;
        }

        const normalizedCursor = String(cursor).trim();

        if (!normalizedCursor || normalizedCursor === '-1') {
            return null;
        }

        return normalizedCursor;
    }

    async getJobs(jobIds = []) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/job$list', {
                job_ids: jobIds
            });
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async getDivisions(divisionIds = []) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/division$list', {
                division_ids: divisionIds
            });
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async getLocations(locationIds = []) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/location$list', {
                location_ids: locationIds
            });
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async searchLastTrack(employeeId, trackDate) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/track$search_last_track', {
                employee_id: employeeId,
                track_date: trackDate
            });
            return { status: true, data: response.data };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async exportTimesheet(periodBeginDate, periodEndDate, employeeIds = []) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/timesheet$export', {
                period_begin_date: periodBeginDate,
                period_end_date: periodEndDate,
                employee_ids: employeeIds,
                division_ids: []
            });
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async listTimeKinds() {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/time_kind$list', {});
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async applyVerifixAttendanceCorrection(data) {
        /**
         * data: {
         *   staff_id: string,
         *   registration_period: string (dd.mm.yyyy),
         *   timesheets: [
         *     {
         *       timesheet_date: string (dd.mm.yyyy),
         *       input_time: string (dd.mm.yyyy HH:mm:ss),
         *       output_time: string (dd.mm.yyyy HH:mm:ss),
         *       fact_items: [ { time_kind_id: number, fact_value: number } ]
         *     }
         *   ]
         * }
         */
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/timesheet$save_facts', data);
            
            await loggerService.logSystemAction('verifix_sync', 'VERIFIX_ATTENDANCE_CORRECTION_SUCCESS', {
                type: 'timesheet_correction'
            }, { metadata: { staff_id: data.staff_id } });

            return { status: true, data: response.data };
        } catch (err) {
            await loggerService.logError(err, {
                source: 'verifix_sync',
                action: 'VERIFIX_ATTENDANCE_CORRECTION_ERROR'
            });
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    /**
     * @deprecated Use `applyVerifixAttendanceCorrection` instead. `track$create` is not a public API endpoint.
     */
    async createTrack(data) {
        await loggerService.logError(new Error('Deprecated createTrack called'), {
            source: 'verifix_sync',
            action: 'VERIFIX_DEPRECATED_TRACK_CREATE'
        });
        console.warn('DEPRECATED: createTrack is no longer supported by Verifix Public API. Use applyVerifixAttendanceCorrection.');
        return { status: false, message: 'createTrack is deprecated. Please use applyVerifixAttendanceCorrection.' };
    }

    async listTracks(filters = {}) {
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/track$list', filters);
            return { status: true, data: get(response, 'data.data', []) };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }

    async deleteEmployee(employeeId) {
        const normalizedEmployeeId = Number(String(employeeId || '').trim());

        if (!Number.isInteger(normalizedEmployeeId) || normalizedEmployeeId <= 0) {
            return { status: false, message: "Employee ID noto'g'ri" };
        }

        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/employee$delete', {
                employee_id: normalizedEmployeeId
            });

            await loggerService.logSystemAction('verifix_sync', 'VERIFIX_EMPLOYEE_DELETE_SUCCESS', {
                type: 'employee'
            }, {
                metadata: { employeeId: normalizedEmployeeId }
            });

            return {
                status: true,
                data: response.data,
                statusCode: response.status
            };
        } catch (err) {
            await loggerService.logError(err, {
                source: 'verifix_sync',
                action: 'VERIFIX_EMPLOYEE_DELETE_ERROR',
                entity: { type: 'employee' },
                metadata: { employeeId: normalizedEmployeeId }
            });

            return {
                status: false,
                message: get(err, 'response.data.message', get(err, 'response.data.error_description', err.message))
            };
        }
    }
}

module.exports = new verifixController();
