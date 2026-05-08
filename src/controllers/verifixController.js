const axios = require('axios');
const { get } = require('lodash');
const config = require('../verifixConfig');

class verifixController {
    constructor() {
        this.token = null;
        this.expiresAt = 0;
    }

    async auth() {
        try {
            const body = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: config.verifix.clientId,
                client_secret: config.verifix.clientSecret
            });

            const response = await axios.post(`${config.verifix.baseUrl}/security/oauth/token`, body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'project_code': config.verifix.projectCode,
                    'filial_id': config.verifix.filialId
                }
            });

            if (response.data && response.data.access_token) {
                this.token = response.data.access_token;
                // Subtract 60 seconds as a buffer
                this.expiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
                return { status: true };
            }
            return { status: false, message: 'No token received' };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.error_description', err.message) };
        }
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
                'project_code': config.verifix.projectCode,
                'filial_id': config.verifix.filialId
            }
        });
    }

    async getEmpInfo(phone = '') {
        try {
            const instance = await this._getAxiosInstance();
            // Verifix API expects phone number or part of info in dynamic fields, but search via API
            // is not fully documented for partial phone search. We will fetch list of employees and filter,
            // or if there is a search endpoint, use it. But based on docs, we use list endpoint.
            // As phone might not be filterable natively in list, we pull all active or search if supported.
            // Given the doc says `statuses` such as `A`, we'll pull A and filter manually or if Verifix supports phone filter,
            // unfortunately the doc only mentions employee_ids, npins, statuses as filters.

            // To prevent massive payloads, we assume phone can be part of dynamic fields or we just fetch and filter.
            // Since we need to replace SAP exactly: SAP returned { LastName, FirstName, JobTitle, MobilePhone, SalesPersonCode }

            const response = await instance.post('/b/vhr/api/v1/core/employee$list', {
                statuses: ['A']
            });

            const employees = get(response, 'data.data', []);
            const matchedEmployee = employees.find(emp => {
                const empPhone = String(get(emp, 'phone_number', '')).replace(/\\D/g, '');
                return empPhone.includes(phone) || phone.includes(empPhone);
            });

            if (matchedEmployee) {
                // Map to SAP response structure to avoid changing the whole bot logic
                const sapFormat = {
                    EmployeeID: matchedEmployee.employee_id,
                    LastName: matchedEmployee.last_name || '',
                    FirstName: matchedEmployee.first_name || '',
                    JobTitle: '', // We could fetch job list if needed, but keeping it empty for now or mapping it
                    MobilePhone: matchedEmployee.phone_number,
                    SalesPersonCode: -1
                };
                return { status: true, data: { value: [sapFormat] } };
            }

            return { status: true, data: { value: [] } };
        } catch (err) {
            return { status: false, message: get(err, 'response.data.message', err.message) };
        }
    }
}

module.exports = new verifixController();