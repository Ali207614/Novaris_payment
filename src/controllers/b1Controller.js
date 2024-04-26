const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
let dbService = require('../services/dbService')
const moment = require('moment');
const { PARTNERSEARCH, GETPURCHASEORDER, ACCOUNTS, accountBuilderFn, CURRENTRATE, accountBuilderFnNo, ACCOUNTSNO, CASHFLOW, GETJOURNALENTRIES } = require("../repositories/dataRepositories");
const { saveSession, getSession } = require("../helpers");

class b1Controller {

    async auth() {
        let obj = {
            "CompanyDB": "TEST311223",
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
        return axios.post("/Login", obj).then(({ headers, data }) => {
            saveSession({
                'Cookie': get(headers, 'set-cookie', ''),
                'SessionId': get(data, 'SessionId', '')
            })
            return { status: true };
        }).catch(err => {
            return { status: false, message: get(err, 'response.data.error.message.value') }
        });
    }

    async getEmpInfo(phone = '') {
        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                'Cookie': get(getSession(), 'Cookie[0]', '') + get(getSession(), 'Cookie[1]', ''),
                'SessionId': get(getSession(), 'SessionId', '')
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
                        return await this.getEmpInfo(phone)
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }

    async getPartner(name = "", groupList) {
        try {
            let sql = PARTNERSEARCH + ` and T0.\"GroupCode\" in  (${groupList.map(item => `'${item}'`)})`
            let data = await dbService.executeParam(sql, [`%${name}%`])
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }
    async getJournalEntries(docNum = 0) {
        try {
            let data = await dbService.executeParam(GETJOURNALENTRIES, [docNum])
            return data?.sort((a, b) => b.TransId - a.TransId)
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

    async getPurchaseOrder({ cardCode }) {
        try {
            let data = await dbService.executeParam(GETPURCHASEORDER, [cardCode])
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

    async getAccount(arr, isPay = false) {
        try {
            let accountQuery = accountBuilderFn(arr)
            if (isPay) {
                accountQuery += ` and  T0.\"CurrTotal\" > 0`
            }
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

    async getCurrentRate(cur = 'UZS', date = '') {
        try {
            let data = await dbService.executeParam(CURRENTRATE, [cur, moment(date).format('DD.MM.YY')])
            return data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async executePayments({ list = {}, cred = {} }) {

        if (get(list, 'purchase')) {
            return await this.purchaseDownPayments({ list })
        }
        let DocType = {
            'account': 'rAccount',
            'customer': 'rCustomer',
            'supplier': 'rSupplier'
        }
        let body = {
            "DocType": DocType[get(cred, 'b1.type', (get(list, 'vendorId', '') ? (get(cred, 'b1.supplier') ? 'supplier' : 'customer') : 'account'))],
            "DocDate": get(list, 'startDate', '').replace(/[.]/g, '-'),
            "TaxDate": get(list, 'endDate', '').replace(/[.]/g, '-'),
            "CardCode": get(list, 'accountCodeOther', '') || get(list, 'vendorId'),
            "CashAccount": get(list, 'accountCode'),
            "DocCurrency": get(list, 'currency'),
            "CashSum": Number(get(list, 'summa', 0)),
            "PaymentAccounts": []
        }
        if (get(list, "currency", '') != 'USD') {
            body.DocRate = Number(get(list, 'currencyRate'))
        }

        if (get(list, 'currency'))
            if (body.DocType != 'rSupplier' && !get(list, 'vendorId')) {
                body.PaymentAccounts = [{ "ProfitCenter2": get(list, 'point', ''), "AccountCode": get(list, 'accountCodeOther'), 'SumPaid': Number(get(list, 'summa', 0)) }]
            }
        let notDDS = ['5011', '5012', '5044', '5051', '5071', '3120', '5010', '5043', '5062', '5070', '5611']

        if (get(cred, 'b1.cashFlow', false) && !notDDS.includes(get(list, 'DDS', get(list, 'dds', '')).toString())) {
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

        console.log(body, ' bu body')

        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                'Cookie': get(getSession(), 'Cookie[0]', '') + get(getSession(), 'Cookie[1]', ''),
                'SessionId': get(getSession(), 'SessionId', '')
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .post(get(list, 'payment') ? `IncomingPayments` : `VendorPayments`, body)
            .then(async ({ data }) => {
                if (body.DocType != 'rAccount') {
                    await this.PatchJournalEntries(get(data, 'DocNum'), get(list, 'point', ''))
                }
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.executePayments({ list, cred })
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }


    async purchaseDownPayments({ list = {} }) {
        let DocumentLines = get(list, 'purchaseOrders', []).filter(item => item.DocEntry == get(list, 'purchaseEntry')).map(item => {
            return { BaseLine: item.LineNum, BaseEntry: item.DocEntry, BaseType: 22 }
        })
        let body = {
            "CardCode": get(list, 'vendorId'),
            "DocCurrency": get(list, 'currency', 'CNY'),
            "DocTotalFc": Number(get(list, 'summa', 0)),
            "ControlAccount": get(list, 'accountCode'),
            "DocRate": Number(get(list, 'currencyRate', 7.120)),
            "DownPaymentAmountFC": Number(get(list, 'summa', 0)),
            "DocObjectCode": "oPurchaseDownPayments",
            "DownPaymentType": "dptRequest",
            "DocDate": get(list, 'startDate', '').replace(/[.]/g, '-'),
            "DocDueDate": get(list, 'endDate', '').replace(/[.]/g, '-'),
            DocumentLines
        }
        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                'Cookie': get(getSession(), 'Cookie[0]', '') + get(getSession(), 'Cookie[1]', ''),
                'SessionId': get(getSession(), 'SessionId', '')
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .post(`PurchaseDownPayments`, body)
            .then(async ({ data }) => {
                return await this.DownPayments({ list, data })
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.purchaseDownPayments({ list })
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }
    async PatchJournalEntries(docNum = 1, point = '') {
        if (!point) {
            return
        }
        let journalEntry = await this.getJournalEntries(docNum)
        if (!get(journalEntry, '[0].TransId')) {
            return
        }

        let body = {
            "JournalEntryLines": [
                {
                    "Line_ID": 1,
                    "CostingCode2": point
                }
            ]
        }


        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                'Cookie': get(getSession(), 'Cookie[0]', '') + get(getSession(), 'Cookie[1]', ''),
                'SessionId': get(getSession(), 'SessionId', '')
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .patch(`JournalEntries(${get(journalEntry, '[0].TransId')})`, body)
            .then(async ({ data }) => {
                return { status: true }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.PatchJournalEntries(docNum, point)
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }

    async DownPayments({ list = {}, data = {} }) {
        let body = {
            "CardCode": get(list, 'vendorId'),
            "DocType": "rSupplier",
            "DocCurrency": get(list, 'currency', 'CNY'),
            "CashAccount": get(list, 'accountCode'),
            "CashSum": Number(get(list, 'summa')),
            "DocRate": Number(get(list, 'currencyRate', 7.12)),
            "DocDate": get(list, 'startDate', '').replace(/[.]/g, '-'),
            "TaxDate": get(list, 'endDate', '').replace(/[.]/g, '-'),
            "PaymentInvoices": [
                {
                    "AppliedFC": Number(get(list, 'summa', 0)),
                    "InvoiceType": "it_PurchaseDownPayment",
                    "DocEntry": get(data, 'DocEntry'),
                }
            ]
        }
        const axios = Axios.create({
            baseURL: "https://66.45.245.130:50000/b1s/v1/",
            timeout: 30000,
            headers: {
                'Cookie': get(getSession(), 'Cookie[0]', '') + get(getSession(), 'Cookie[1]', ''),
                'SessionId': get(getSession(), 'SessionId', '')
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return axios
            .post(`VendorPayments`, body)
            .then(({ data }) => {
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.DownPayments({ list, data })
                    }
                    return { status: false, message: token.message }
                } else {
                    return { status: false, message: get(err, 'response.data.error.message.value') };
                }
            });
    }

}

module.exports = new b1Controller();


