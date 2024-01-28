const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
let dbService = require('../services/dbService')
const moment = require('moment');
const { PARTNERSEARCH, ACCOUNTS, accountBuilderFn, CURRENTRATE, accountBuilderFnNo, ACCOUNTSNO, CASHFLOW } = require("../repositories/dataRepositories");

class b1Controller {
    constructor() {
        this.token;
    }

    async auth() {
        let obj = {
            "CompanyDB": "TEST0105",
            "UserName": "manager",
            "Password": "w2e3r4Q!"
        }
        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
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
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
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

    async cashFlow(name = "") {
        try {
            let data = await dbService.executeParam(CASHFLOW, [name])
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

    async getAccount15({ status = false }) {
        try {
            let account = status ? '5530' : `15%`
            let data = await dbService.executeParam(ACCOUNTSNO, [account])
            return data.filter(item => item.AcctCode != 15)
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

    async getCurrentRate(cur = 'UZS') {
        try {
            let data = await dbService.executeParam(CURRENTRATE, [cur])
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async executePayments({ list = {}, cred = {} }) {
        let DocType = {
            'account': 'rAccount',
            'customer': 'rCustomer',
            'supplier': 'rSupplier'
        }
        let body = {
            "DocType": DocType[get(cred, 'b1.type', (get(list, 'vendorId') ? 'rCustomer' : 'rAccount'))],
            "CardCode": get(list, 'accountCodeOther', get(list, 'vendorId')),
            "CashAccount": get(list, 'accountCode'),
            "DocCurrency": get(list, 'currency'),
            "DocRate": Number(get(list, 'currencyRate')),
            "CashSum": Number(get(list, 'summa', 0)),
        }
        if (body.DocType != 'rSupplier') {
            body.PaymentAccounts = [{ "AccountCode": get(list, 'accountCodeOther'), 'SumPaid': Number(get(list, 'summa', 0)) }]
        }
        if (get(cred, 'b1.cashFlow', false)) {
            let cashflow = await this.cashFlow(get(list, 'DDS', get(list, 'dds')))
            if (cashflow.length) {
                body.CashFlowAssignments = [
                    {
                        "CashFlowLineItemID": get(cashflow[0], 'CFWId'),
                        "PaymentMeans": "pmtCash",
                    }
                ]
            }
        }

        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                Cookie: `B1SESSION=${this.token}; ROUTEID=.node2`,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .post(get(list, 'payment') ? `IncomingPayments` : `VendorPayments`, body)
            .then(({ data }) => {
                console.log(data.DocEntry)
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        this.token = token.data
                        return await this.executePayments({ list, cred })
                    }
                    return { status: false, message: token.message }
                } else {
                    console.log('errr')
                    console.log(get(err, 'response.data.error.message.value'))
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }

}

module.exports = new b1Controller();


