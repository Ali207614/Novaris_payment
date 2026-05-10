const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
let dbService = require('../services/dbService')
const moment = require('moment');
const { PARTNERSEARCH, GETPURCHASEORDER, ACCOUNTS, accountBuilderFn, CURRENTRATE, accountBuilderFnNo, ACCOUNTSNO, CASHFLOW, GETJOURNALENTRIES, DATABASE } = require("../repositories/dataRepositories");
const { saveSession, getSession } = require("../helpers");
const loggerService = require("../services/loggerService");

class b1Controller {
    async auth() {
        let obj = {
            "CompanyDB": "NOVARIS_SAP",
            "UserName": "Fin7",
            "Password": "1234"
        }
        const axios = Axios.create({
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
            loggerService.logSystemAction('sap_sync', 'SAP_AUTH_SUCCESS');
            return { status: true };
        }).catch(err => {
            const errorMessage = get(err, 'response.data.error.message.value') || err.message;
            loggerService.logError(err, { source: 'sap_sync', action: 'SAP_AUTH_FAILURE' });
            return { status: false, message: errorMessage }
        });
    }
    async getEmpInfo(phone = '') {
        const axios = Axios.create({
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
                    const errorMessage = get(err, 'response.data.error.message.value') || err.message;
                    loggerService.logError(err, { source: 'sap_sync', action: 'SAP_GET_EMP_INFO_ERROR', metadata: { phone } });
                    return { status: false, message: errorMessage };
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
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_PARTNER_ERROR', metadata: { name, groupList } });
            throw new Error(e)
        }
    }
    async getCustomer(name = "") {
        try {
            const query = `
                SELECT T0."CardCode", T0."CardName", T0."GroupCode", T0."CardType", T0."Phone1", T0."Phone2"
                FROM "${DATABASE}"."OCRD" T0
                WHERE LOWER(T0."CardName") LIKE ?
                    AND T0."CardType" = 'C'
            `;
            let data = await dbService.executeParam(query, [`%${name}%`])
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_CUSTOMER_ERROR', metadata: { name } });
            throw new Error(e)
        }
    }
    async getJournalEntries(docNum = 0) {
        try {
            let data = await dbService.executeParam(GETJOURNALENTRIES, [docNum])
            return data?.sort((a, b) => b.TransId - a.TransId)
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_JOURNAL_ENTRIES_ERROR', metadata: { docNum } });
            throw new Error(e)
        }
    }
    async cashFlow(name = "") {
        try {
            let data = await dbService.executeParam(CASHFLOW, [name])
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_CASH_FLOW_ERROR', metadata: { name } });
            throw new Error(e)
        }
    }
    async cashFlowList(list = []) {
        try {
            if (!Array.isArray(list) || list.length === 0) {
                return []; 
            }

            const placeholders = list.map(() => '?').join(', ');
            const query = `
                SELECT * 
                FROM "${DATABASE}"."OCFW" T0 
                WHERE T0."CFWName" IN (${placeholders})
            `;
            const data = await dbService.executeParam(query, list);

            return data;
        } catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_CASH_FLOW_LIST_ERROR', metadata: { list } });
            throw new Error(e.message || e);
        }
    }

    async getAccount43() {
        try {
            const { accounts43 } = require("../credentials");
            let accountQuery = accountBuilderFn(accounts43())
            let data = await dbService.execute(accountQuery)
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_ACCOUNT_43_ERROR' });
            throw new Error(e)
        }
    }
    async getPurchaseOrder({ cardCode }) {
        try {
            let data = await dbService.executeParam(GETPURCHASEORDER, [cardCode])
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_PURCHASE_ORDER_ERROR', metadata: { cardCode } });
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
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_ACCOUNT_15_ERROR', metadata: { status } });
            throw new Error(e)
        }
    }
    async getAccount(arr, isPay = false) {
        try {
            let accountQuery = accountBuilderFn(arr)
            let data = await dbService.execute(accountQuery)
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_ACCOUNT_ERROR', metadata: { arr, isPay } });
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
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_ACCOUNT_NO_ERROR', metadata: { arr } });
            throw new Error(e)
        }
    }
    async getCurrentRate(cur = 'UZS', date = '') {
        try {
            let data = await dbService.executeParam(CURRENTRATE, [cur, moment(date).format('DD.MM.YY')])
            return data
        }
        catch (e) {
            loggerService.logError(e, { source: 'sap_sync', action: 'SAP_GET_CURRENT_RATE_ERROR', metadata: { cur, date } });
            throw new Error(e)
        }
    }
    async executePayments({ list = {}, cred = {}, dataInfo = '' }) {

        if (get(list, 'purchase')) {
            return await this.purchaseDownPayments({ list, dataInfo })
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
            "JournalRemarks": `${get(list, 'ID', "")}`,
            "PaymentAccounts": [],
            "U_izoh": dataInfo
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

        const axios = Axios.create({
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
                loggerService.logSystemAction('sap_sync', 'SAP_EXECUTE_PAYMENTS_SUCCESS', { docNum: data.DocNum });
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.executePayments({ list, cred, dataInfo })
                    }
                    return { status: false, message: token.message }
                } else {
                    const errorMessage = get(err, 'response.data.error.message.value') || err.message;
                    loggerService.logError(err, { source: 'sap_sync', action: 'SAP_EXECUTE_PAYMENTS_ERROR', metadata: { body } });
                    return { status: false, message: errorMessage };
                }
            });
    }
    async purchaseDownPayments({ list = {}, dataInfo = '' }) {
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
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
                return await this.DownPayments({ list, data, dataInfo })
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.purchaseDownPayments({ list, dataInfo })
                    }
                    return { status: false, message: token.message }
                } else {
                    const errorMessage = get(err, 'response.data.error.message.value') || err.message;
                    loggerService.logError(err, { source: 'sap_sync', action: 'SAP_PURCHASE_DOWN_PAYMENTS_ERROR', metadata: { body } });
                    return { status: false, message: errorMessage };
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
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
                    const errorMessage = get(err, 'response.data.error.message.value') || err.message;
                    loggerService.logError(err, { source: 'sap_sync', action: 'SAP_PATCH_JOURNAL_ENTRIES_ERROR', metadata: { docNum, point } });
                    return { status: false, message: errorMessage };
                }
            });
    }
    async DownPayments({ list = {}, data = {}, dataInfo = '' }) {
        let body = {
            "CardCode": get(list, 'vendorId'),
            "DocType": "rSupplier",
            "DocCurrency": get(list, 'currency', 'CNY'),
            "CashAccount": get(list, 'accountCode'),
            "CashSum": Number(get(list, 'summa')),
            "DocRate": Number(get(list, 'currencyRate', 7.12)),
            "DocDate": get(list, 'startDate', '').replace(/[.]/g, '-'),
            "TaxDate": get(list, 'endDate', '').replace(/[.]/g, '-'),
            "JournalRemarks": `${get(list, 'ID', "")}`,
            "U_izoh": dataInfo,
            "PaymentInvoices": [
                {
                    "AppliedFC": Number(get(list, 'summa', 0)),
                    "InvoiceType": "it_PurchaseDownPayment",
                    "DocEntry": get(data, 'DocEntry'),
                }
            ]
        }
        const axios = Axios.create({
            baseURL: "https://192.168.1.3:50000/b1s/v1/",
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
                loggerService.logSystemAction('sap_sync', 'SAP_DOWN_PAYMENTS_SUCCESS', { docEntry: data.DocEntry });
                return { status: true, data }
            })
            .catch(async (err) => {
                if (get(err, 'response.status') == 401) {
                    let token = await this.auth()
                    if (token.status) {
                        return await this.DownPayments({ list, data, dataInfo })
                    }
                    return { status: false, message: token.message }
                } else {
                    const errorMessage = get(err, 'response.data.error.message.value') || err.message;
                    loggerService.logError(err, { source: 'sap_sync', action: 'SAP_DOWN_PAYMENTS_ERROR', metadata: { body } });
                    return { status: false, message: errorMessage };
                }
            });
    }
}

module.exports = new b1Controller();
