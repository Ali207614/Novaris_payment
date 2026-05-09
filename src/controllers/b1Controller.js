const loggerService = require("../services/loggerService");

class b1Controller {
    async auth() {
        console.log("Mocked b1Controller.auth called");
        return { status: true };
    }

    async getEmpInfo(phone = '') {
        console.log("Mocked b1Controller.getEmpInfo called for phone:", phone);
        // Return a mock successful response or neutral response as needed
        return { status: false, message: "SAP is temporarily disabled" };
    }

    async getPartner(name = "", groupList) {
        console.log("Mocked b1Controller.getPartner called");
        return [];
    }

    async getCustomer(name = "") {
        console.log("Mocked b1Controller.getCustomer called");
        return [];
    }

    async getJournalEntries(docNum = 0) {
        console.log("Mocked b1Controller.getJournalEntries called");
        return [];
    }

    async cashFlow(name = "") {
        console.log("Mocked b1Controller.cashFlow called");
        return [];
    }

    async cashFlowList(list = []) {
        console.log("Mocked b1Controller.cashFlowList called");
        return [];
    }

    async getAccount43() {
        console.log("Mocked b1Controller.getAccount43 called");
        return [];
    }

    async getPurchaseOrder({ cardCode }) {
        console.log("Mocked b1Controller.getPurchaseOrder called");
        return [];
    }

    async getAccount15({ status = false }) {
        console.log("Mocked b1Controller.getAccount15 called");
        return [];
    }

    async getAccount(arr, isPay = false) {
        console.log("Mocked b1Controller.getAccount called");
        return [];
    }

    async getAccountNo(arr) {
        console.log("Mocked b1Controller.getAccountNo called");
        return [];
    }

    async getCurrentRate(cur = 'UZS', date = '') {
        console.log("Mocked b1Controller.getCurrentRate called");
        return [];
    }

    async executePayments({ list = {}, cred = {}, dataInfo = '' }) {
        console.log("Mocked b1Controller.executePayments called");
        return { status: true, message: "SAP is temporarily disabled, but simulating success" };
    }

    async purchaseDownPayments({ list = {}, dataInfo = '' }) {
        console.log("Mocked b1Controller.purchaseDownPayments called");
        return { status: true, message: "SAP is temporarily disabled, but simulating success" };
    }

    async PatchJournalEntries(docNum = 1, point = '') {
        console.log("Mocked b1Controller.PatchJournalEntries called");
        return { status: true };
    }

    async DownPayments({ list = {}, data = {}, dataInfo = '' }) {
        console.log("Mocked b1Controller.DownPayments called");
        return { status: true };
    }
}

module.exports = new b1Controller();