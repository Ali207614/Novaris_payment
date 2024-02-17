const jiraController = require("../controllers/jiraController")
const { infoMenu, infoAllMenu, infoAllSubMenu } = require("../helpers")

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

const adminMenusInfo = () => {
    let menu = infoAllMenu()
    let subMenu = infoAllSubMenu()
    let str = `${menu.length ? 'Menular\n\n' : 'Menular mavjud emas'}`
    for (let i = 0; i < menu.length; i++) {
        str += `${menu[i].name}\n`
        let filterData = subMenu.filter(item => item.menuId == menu[i].id)
        if (filterData?.length) {
            for (let j = 0; j < filterData.length; j++) {
                str += ` -${filterData[j].name} ${filterData[j].status ? '✅' : '❌'}\n`
            }
        }
        str += '\n'
    }
    return str
}


module.exports = {
    dataConfirmText,
    ticketAddText,
    adminMenusInfo
}