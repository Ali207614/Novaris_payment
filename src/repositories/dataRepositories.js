
const moment = require('moment')
let db = 'NOVARIS_SAP'

function accountBuilderFn(arr) {
    return `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" in (${arr.map(item => `'${item}'`)})  and T0.\"FrozenFor\" = 'N' and  T0.\"CurrTotal\" > 0`
}
function accountBuilderFnNo(arr) {
    return `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" in (${arr.map(item => `'${item}'`)})  and T0.\"FrozenFor\" = 'N'`
}
module.exports = {
    CURRENTRATE: `SELECT T0.\"RateDate\", T0.\"Currency\", T0.\"Rate\" FROM \"${db}\".\"ORTT\" T0 WHERE T0.\"RateDate\" = CURRENT_DATE and T0.\"Currency\" = ?`,
    PARTNERSEARCH: ` SELECT T0.\"CardCode\", T0.\"CardName\", T0.\"GroupCode\", T0.\"CardType\", T0.\"Phone1\", T0.\"Phone2\" FROM \"${db}\".\"OCRD\" T0 where LOWER(T0.\"CardName\") Like ?`,
    ACCOUNTS: `SELECT T0.\"AcctCode\", T0.\"AcctName\", T0.\"CurrTotal\", T0.\"SysTotal\", T0.\"FcTotal\", T0.\"FrozenFor\" FROM \"${db}\".\"OACT\" T0 WHERE T0.\"AcctCode\" like ?  and T0.\"FrozenFor\" = 'N' and  T0.\"CurrTotal\" > 0`,
    accountBuilderFn,
    accountBuilderFnNo
}




