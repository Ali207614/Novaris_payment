const jiraController = require("../controllers/jiraController")

const dataConfirmText = (list = [], firstText = 'Tasdiqlaysizmi ? ') => {
    let result = `${firstText}\n\n`
    for (let i = 0; i < list.length; i++) {
        result += `${list[i].name} : ${list[i].message}\n`
    }
    return result
}

const ticketAddText = (obj) => {
    let keyList = [{ key: 'date', textT: `Sana qo'shildi `, textF: `Sana qo'shilmad` }, { key: 'comment', textT: `Kommentariya qo'shildi`, textF: `Kommentariya qo'shilmadi` }, { key: 'transition', textT: `Status o'zgartirildi`, textF: `Status o'zgartirilmadi` }]
    let text = ``
    for (let i = 0; i < keyList.length; i++) {
        if (obj[keyList[i].key]) {
            text += `${obj[keyList[i].key] == 1 ? `${keyList[i].textT} ✅` : `${keyList[i].textF} ❌ ${obj[keyList[i].key + 'Error']}`}\n`
        }
    }
    return text
}



module.exports = {
    dataConfirmText,
    ticketAddText,
}