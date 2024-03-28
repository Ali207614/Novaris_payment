
const moment = require('moment')
let db = 'TEST311223'

function accountBuilderFn(arr) {
    return `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" in (${arr.map(item => `'${item}'`)})  and T0.\"FrozenFor\" = 'N' `
}
function accountBuilderFnNo(arr) {
    return `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" in (${arr.map(item => `'${item}'`)})  and T0.\"FrozenFor\" = 'N'`
}
module.exports = {
    GETJOURNALENTRIES: `SELECT T0.\"TransId\" FROM  \"${db}\".\"OJDT\" T0 WHERE T0.\"TransType\" in (46,24) and  T0.\"BaseRef\" = ?`,
    GETPURCHASEORDER: `SELECT T1."LineNum", T1.\"LineNum\" ,T1.\"ItemCode\"  ,T1.\"Quantity\"  ,T1.\"Price\" , T1.\"Currency\",  T1.\"Rate\",  T0.\"DocNum\", T0.\"DocEntry\", T0.\"DocType\", T0.\"CANCELED\", T0.\"DocStatus\", T0.\"CardCode\", T0.\"CardName\", T0.\"NumAtCard\" FROM  \"${db}\".\"OPOR\"  T0 INNER JOIN \"${db}\".\"POR1\" T1 ON T0.\"DocEntry\" = T1.\"DocEntry\" WHERE T0.\"DocStatus\" = 'O' and T0.\"CardCode\" = ?`,
    CASHFLOW: `SELECT *  FROM \"${db}\".\"OCFW\" T0 where T0.\"CFWName\" = ?`,
    CURRENTRATE: `SELECT T0.\"RateDate\", T0.\"Currency\", T0.\"Rate\" FROM \"${db}\".\"ORTT\" T0 WHERE T0.\"Currency\" = ? and TO_CHAR(T0.\"RateDate\" ,'DD.MM.YY') = ?`,
    PARTNERSEARCH: ` SELECT T0.\"CardCode\", T0.\"CardName\", T0.\"GroupCode\", T0.\"CardType\", T0.\"Phone1\", T0.\"Phone2\" FROM \"${db}\".\"OCRD\" T0 where LOWER(T0.\"CardName\") Like ? `,
    ACCOUNTS: `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" like ?  and T0.\"FrozenFor\" = 'N' and  T0.\"CurrTotal\" > 0`,
    ACCOUNTSNO: `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" like ?  and T0.\"FrozenFor\" = 'N'`,
    accountBuilderFn,
    accountBuilderFnNo
}


// SELECT T0."RateDate", T0."Currency", T0."Rate" FROM ORTT T0 WHERE T0."RateDate" = CURRENT_DATE and T0."Currency" = 'USD'

