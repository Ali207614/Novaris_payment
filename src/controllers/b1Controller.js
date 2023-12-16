const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
let dbService = require('../services/dbService')
const moment = require('moment');
const { PARTNERSEARCH, ACCOUNTS, accountBuilderFn, CURRENTRATE, accountBuilderFnNo } = require("../repositories/dataRepositories");

class b1Controller {
    constructor() {
        this.token;
    }

    async auth() {
        let obj = {
            "CompanyDB": "NOVARIS_SAP",
            "UserName": "manager",
            "Password": "w2e3r4Q!"
        }
        const axios = Axios.create({
            baseURL: "https://212.129.21.11:50000/b1s/v1/",
            timeout: 30000,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios.post("/Login", obj).then(({ data }) => {
            return { status: true, data: data.SessionId };
        }).catch(err => {
            return { status: false, message: get(err, 'response.data.error.message.value') }
        });
    }

    async getEmpInfo(phone = '') {
        const axios = Axios.create({
            baseURL: "https://212.129.21.11:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                Cookie: `B1SESSION=${this.token}; ROUTEID=.node2`,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .get(`EmployeesInfo?$select=EmployeeID,LastName,FirstName,JobTitle,MobilePhone,SalesPersonCode&$filter=MobilePhone eq '${phone}'`,)
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        this.token = token.data
                        return await this.getEmpInfo(phone)
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }

    async getPartner(name = "") {
        try {
            let data = await dbService.executeParam(PARTNERSEARCH, [`%${name}%`])
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async getAccount43() {
        try {
            const { accounts43 } = require("../credentials");
            let accountQuery = accountBuilderFn(accounts43)
            let data = await dbService.execute(accountQuery)
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }
    async getAccount(arr) {
        try {
            let accountQuery = accountBuilderFn(arr)
            let data = await dbService.execute(accountQuery)
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }
    async getAccountNo(arr) {
        try {
            let accountQuery = accountBuilderFnNo(arr)
            let data = await dbService.execute(accountQuery)
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }
    async getCurrentRate(cur = 'USD') {
        try {
            let data = await dbService.executeParam(CURRENTRATE, [cur])
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }

}

module.exports = new b1Controller();


