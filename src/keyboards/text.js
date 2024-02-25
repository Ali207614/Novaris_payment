const { get } = require("lodash")
const { bot } = require("../config")
const { SubMenu } = require("../credentials")
const { infoMenu, infoAllMenu, infoAllSubMenu, infoUser, updateUser, infoData, updateData } = require("../helpers")
const { dataConfirmBtnEmp } = require("./inline_keyboards")
const moment = require('moment')
const dataConfirmText = (list = [], firstText = 'Tasdiqlaysizmi ? ', chat_id = '') => {
    let user = infoUser().find(item => item.chat_id == chat_id)
    let newErrStr = ''
    let notConfirmMessage = 'Bekor qilinganlik sababi : '
    let empName = ``
    if (get(list, '[0].message', '') && get(list, '[0].name', '') === 'ID') {
        let userData = infoData().find(item => item.ID == get(list, '[0].message', ''))
        let empData = infoUser().find(item => item.chat_id == get(userData, 'chat_id'))
        empName = `${get(empData, 'LastName')} ${get(empData, 'FirstName')}`
        newErrStr = get(userData, 'SapJiraMessage', '')
        notConfirmMessage += get(userData, 'notConfirmMessage', '')
    }
    if (get(user, 'waitingUpdateStatus')) {
        confirmativeUpdateMessage({ user, list, chat_id })
        updateData(user.currentDataId, {
            stateTime: {
                update: new Date()
            }
        })
        return "O'zgartirildi ✅"
    }
    let result = `${firstText}\n\n`
    if (empName) {
        result += `Xodim : ${empName}\n`
    }
    for (let i = 0; i < list.length; i++) {
        result += `${list[i].name} : ${list[i].message}\n`
    }
    if (notConfirmMessage != 'Bekor qilinganlik sababi : ') {
        result += `\n\n----------------------\n${notConfirmMessage}`
    }
    if (newErrStr) {
        result += `\n\n----------------------\n${newErrStr}`
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

const confirmativeUpdateMessage = async ({ user, list, chat_id }) => {
    let actData = infoData().find(item => item.id == user.currentDataId)
    let updateList = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu)
    let info = updateList.infoFn({ chat_id })
    for (let i = 0; i < get(actData, 'confirmativeSendlist', []).length; i++) {
        moment.locale('uz');
        let list = actData.confirmativeSendlist[i]
        let btnConfirmative = await dataConfirmBtnEmp(list.chatId, [{ name: 'Tasdiqlash', id: `1#${actData.id}`, }, { name: 'Bekor qilish', id: `2#${actData.id}` }], 2, 'confirmConfirmative')
        bot.editMessageText(`O'zgartirildi ${moment().format('LT')} 🕰\n\n` + dataConfirmText(info, "Kutilayotgan So'rovlar ?", chat_id), {
            chat_id: list.chatId,
            message_id: list.messageId,
            ...btnConfirmative
        })
    }
}


module.exports = {
    dataConfirmText,
    ticketAddText,
    adminMenusInfo
}