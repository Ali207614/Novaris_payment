const { get } = require("lodash")
const { bot } = require("../config")
const { SubMenu, Menu } = require("../credentials")
const { infoMenu, infoAllMenu, infoAllSubMenu, infoUser, updateUser, infoData, updateData, infoPermisson } = require("../helpers")
const { dataConfirmBtnEmp } = require("./inline_keyboards")
const moment = require('moment')
const dataConfirmText = (list = [], firstText = 'Tasdiqlaysizmi ? ', chat_id = '') => {
    let user = infoUser().find(item => item.chat_id == chat_id)
    let newErrStr = ''
    let notConfirmMessage = 'Bekor qilinganlik sababi : '
    let empName = ``
    let executor = {};
    let confirmative = {};
    if (get(list, '[0].message', '') && get(list, '[0].name', '') === 'ID') {
        let userData = infoData().find(item => item.ID == get(list, '[0].message', ''))
        let empData = infoUser().find(item => item.chat_id == get(userData, 'chat_id'))
        empName = `${get(empData, 'LastName')} ${get(empData, 'FirstName')}`
        executor = get(userData, 'executer', {})
        confirmative = get(userData, 'confirmative', {})
        newErrStr = get(userData, 'SapJiraMessage', '')
        notConfirmMessage += get(userData, 'notConfirmMessage', '')
    }
    if (get(user, 'waitingUpdateStatus')) {
        confirmativeUpdateMessage({ user, list, chat_id })
        updateUser(chat_id, { waitingUpdateStatus: false, extraWaiting: true })
        updateData(user.currentDataId, {
            stateTime: {
                update: new Date()
            }
        })
        return "O'zgartirildi ✅"
    }
    let result = `${firstText}\n\n`


    let sort = ['ID', 'SubMenu', 'Ticket raqami', 'SAP Document', "To'lov sanasi", "Hisobot To'lov sanasi", "Hisob (qayerdan)", 'Yetkazib beruvchi', "Hisob (qayerga)", 'Zakupka', "Statya DDS", "To'lov Usuli", "Summa", "Valyuta kursi", "Hisob Nuqtasi", "Izoh"]

    list = list.filter(item => !['Hujjat turi', 'Menu', 'Valyuta'].includes(item.name)).map(item => {
        let findIndex = sort.findIndex(el => el.trim().toLowerCase() == get(item, 'name', '').trim().toLowerCase())
        if (findIndex == -1) {
            return item
        }
        return { ...item, sort: findIndex }
    }).sort((a, b) => a.sort - b.sort)


    for (let i = 0; i < list.length; i++) {
        result += `${list[i].name} : ${list[i].message}\n`
    }
    if (empName) {
        result += `Xodim : ${empName}\n`
    }
    if (get(confirmative, 'chat_id')) {
        let confirmUser = infoUser().find(item => item.chat_id == get(confirmative, 'chat_id'))
        result += `Tasdiqlovchi : ${get(confirmUser, 'LastName')} ${get(confirmUser, 'FirstName')} ${get(confirmative, 'status') ? '✅' : '❌'}\n`
    }
    if (get(executor, 'chat_id')) {
        let executUser = infoUser().find(item => item.chat_id == get(executor, 'chat_id'))
        result += `Bajaruvchi : ${get(executUser, 'LastName')} ${get(executUser, 'FirstName')} ${get(executor, 'status') ? '✅' : '❌'}\n`
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
        let list = actData.confirmativeSendlist[i]
        let btnConfirmative = await dataConfirmBtnEmp(list.chatId, [{ name: 'Tasdiqlash', id: `1#${actData.id}`, }, { name: 'Bekor qilish', id: `2#${actData.id}` }], 2, 'confirmConfirmative')
        bot.editMessageText(`O'zgartirildi ${moment().format('lll')} 🕰\n\n` + dataConfirmText(info, "Kutilayotgan So'rovlar ?", chat_id), {
            chat_id: list.chatId,
            message_id: list.messageId,
            ...btnConfirmative
        })
    }
}

const userInfoText = ({ user = {}, chat_id = 0 }) => {
    let obj = {
        '1': { name: "Xodim", key: 'permissonMenuEmp' },
        '2': { name: "Tasdiqlovchi", key: 'permissonMenuAffirmative' },
        '3': { name: "Bajaruvchi", key: 'permissonMenuExecutor' }
    }
    let text = ``
    if (get(user, 'LastName', '')) {
        text += `ID: ${get(user, 'EmployeeID', 1)}\n`
        text += `${get(user, 'LastName', '')} ${get(user, 'FirstName')}\n`
    }
    let infoPermissonData = infoPermisson().find(item => get(item, 'chat_id') == chat_id)
    if (infoPermissonData) {
        get(infoPermissonData, 'roles', []).sort((a, b) => a - b).forEach(element => {
            text += `\n${get(obj, `[${element}].name`, '')}\n\n`
            let menu = Menu().filter(item => Object.keys(get(infoPermissonData, `${[obj[element].key]}`, {})).includes(get(item, 'id', 0).toString())).reduce((a, b) => {
                let subMenu = SubMenu()[get(b, 'id', 1)].reduce((x, y) => {
                    return x + `   --- ${get(y, 'name', '')}  ${(get(infoPermissonData, `${[obj[element].key]}.${get(b, 'id')}`, []).includes(get(y, 'id', 0).toString()) ? '✅' : '❌')}\n`
                }, '')
                return a + `---${get(b, 'name', '')}\n${subMenu}`
            }, '')
            text += `${Object.keys(get(infoPermissonData, `${[obj[element].key]}`, {})).length ? menu : ''}`
        });
    }
    return text
}


module.exports = {
    dataConfirmText,
    ticketAddText,
    adminMenusInfo,
    userInfoText
}