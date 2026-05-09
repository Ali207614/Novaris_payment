const { get } = require('lodash');

class financialDbController {
    async getAccount(arr, isPay = false) {
        // Mock returning dummy accounts for array of account codes
        return arr.map(code => ({
            AcctCode: code,
            AcctName: `Mocked Account ${code}`,
            CurrTotal: 1000,
            SysTotal: 1000,
            FcTotal: 1000,
            FrozenFor: 'N'
        }));
    }

    async getAccountNo(arr) {
        return this.getAccount(arr);
    }

    async getCurrentRate(cur = 'UZS', date = '') {
        // Mock returning a current rate
        return [{
            RateDate: new Date().toISOString(),
            Currency: cur,
            Rate: cur === 'UZS' ? 1 : 12500
        }];
    }

    async executePayments({ list = {}, cred = {}, dataInfo = '' }) {
        if (get(list, 'purchase')) {
            return await this.purchaseDownPayments({ list, dataInfo });
        }
        // Mock successful execution
        return { status: true, data: { DocNum: Math.floor(Math.random() * 10000) } };
    }

    async purchaseDownPayments({ list = {}, dataInfo = '' }) {
        // Mock returning DownPayments success
        return await this.DownPayments({ list, data: { DocEntry: Math.floor(Math.random() * 10000) }, dataInfo });
    }

    async DownPayments({ list = {}, data = {}, dataInfo = '' }) {
        return { status: true, data: { DocNum: Math.floor(Math.random() * 10000) } };
    }

    async PatchJournalEntries(docNum = 1, point = '') {
        return { status: true };
    }

    async cashFlow(name = "") {
        return [{
            CFWId: Math.floor(Math.random() * 1000),
            CFWName: name || 'Mocked CashFlow'
        }];
    }

    async cashFlowList(list = []) {
        if (!Array.isArray(list) || list.length === 0) {
            return [];
        }
        return list.map(name => ({
            CFWId: Math.floor(Math.random() * 1000),
            CFWName: name
        }));
    }

    async getAccount43() {
        const { accounts43 } = require("../credentials");
        let codes = accounts43() || [];
        return this.getAccount(codes);
    }

    async getPurchaseOrder({ cardCode }) {
        return [{
            LineNum: 1,
            ItemCode: 'ITEM001',
            Quantity: 10,
            Price: 100,
            Currency: 'UZS',
            Rate: 1,
            DocNum: Math.floor(Math.random() * 10000),
            DocEntry: Math.floor(Math.random() * 10000),
            DocType: 'I',
            CANCELED: 'N',
            DocStatus: 'O',
            CardCode: cardCode,
            CardName: 'Mocked Vendor',
            NumAtCard: 'PO12345'
        }];
    }

    async getAccount15({ status = false }) {
        return [{
            AcctCode: '1510',
            AcctName: 'Mocked Account 15',
            CurrTotal: 1000,
            SysTotal: 1000,
            FcTotal: 1000,
            FrozenFor: 'N'
        }];
    }

    async getPartner(name = "", groupList) {
        return [{
            CardCode: `C${Math.floor(Math.random() * 1000)}`,
            CardName: `Mocked Partner ${name}`,
            GroupCode: groupList[0] || '101',
            CardType: 'C',
            Phone1: '998901234567',
            Phone2: ''
        }];
    }

    async getCustomer(name = "") {
        return [{
            CardCode: `C${Math.floor(Math.random() * 1000)}`,
            CardName: `Mocked Customer ${name}`,
            GroupCode: '100',
            CardType: 'C',
            Phone1: '998901234567',
            Phone2: ''
        }];
    }
}

module.exports = new financialDbController();