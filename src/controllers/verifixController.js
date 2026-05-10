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
                const botUserFormat = {
                    EmployeeID: matchedEmployee.employee_id,
                    LastName: matchedEmployee.last_name || '',
                    FirstName: matchedEmployee.first_name || '',
                    JobTitle: matchedEmployee.job_name || matchedEmployee.job_title || '',
                    MobilePhone: matchedEmployee.phone_number,
                    SalesPersonCode: -1
                };
                return { status: true, data: { value: [botUserFormat] } };
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

    _employeePhoneValues(employee = {}) {
        const dynamicFields = Array.isArray(employee.dynamic_fields) ? employee.dynamic_fields : [];
        const dynamicPhones = dynamicFields.flatMap(field => [
            get(field, 'value'),
            get(field, 'field_value'),
            get(field, 'text')
        ]);

        return [
            get(employee, 'phone_number'),
            get(employee, 'main_phone'),
            get(employee, 'mobile_phone'),
            get(employee, 'phone'),
            ...dynamicPhones
        ].filter(Boolean);
    }

    async _findEmployeeByPhone(instance, phone) {
        let cursor = null;
        const visitedCursors = new Set();

        do {
            const headers = { limit: 100 };

            if (cursor) {
                if (visitedCursors.has(cursor)) {
                    return null;
                }
                visitedCursors.add(cursor);
                headers.cursor = cursor;
            }

            const response = await instance.post('/b/vhr/api/v1/core/employee$list', {}, { headers });

            const employees = get(response, 'data.data', []);
            const matchedEmployee = employees.find(emp =>
                this._isActiveEmployee(emp) &&
                this._employeePhoneValues(emp).some(value => this._isSamePhone(value, phone))
            );

            if (matchedEmployee) {
                return matchedEmployee;
            }

            cursor = this._normalizeCursor(get(response, 'data.meta.next_cursor'));
        } while (cursor);

        return null;
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

    async createTrack(data) {
        /**
         * data: {
         *   employee_id: number,
         *   track_type: 'I' (Input/Arrival) | 'O' (Output/Exit) | 'C' (Check/Presence),
         *   track_datetime: 'YYYY-MM-DD HH:mm:ss',
         *   location_id: number (optional),
         *   mark_type: 'M' (Mobile) | 'R' (FaceID) etc.
         * }
         */
        try {
            const instance = await this._getAxiosInstance();
            const response = await instance.post('/b/vhr/api/v1/core/track$create', data);
            return { status: true, data: response.data };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }
}

module.exports = new verifixController();
