const { get } = require("lodash")
const { infoUser, updateUser } = require("../helpers")
const { mainMenuByRoles } = require("./keyboards")

const dataConfirmBtnEmp = async (chat_id = '', list = [], count = 1, cbName, pagination = { prev: 0, next: 10 }, keyboardList = []) => {
    let user = infoUser().find(item => item.chat_id == chat_id)
    if (get(user, 'waitingUpdateStatus')) {
        updateUser(chat_id, { waitingUpdateStatus: false, back: [] })
        return mainMenuByRoles({ chat_id })
    }
    let arr = []
    let result = list
    let next = get(pagination, 'next', 0)
    let prev = get(pagination, 'prev', 10)
    let nextCount;
    if (result.length > 10) {
        nextCount = list.slice(prev, +next + 1).length - list.slice(prev, next).length
        list = list.slice(prev, next)
    }
    for (let i = 0; i < list.length; i += count) {
        let el = list
        arr.push(el.slice(i, i + count).map(itemData => {
            return { text: itemData.name, callback_data: `${cbName}#${itemData.id}` }
        }))
    }

    let objCb = {
        'point': 'paginationPoint',
        'partnerSearch': 'pagination',
        'accountOneStep': 'paginationOneSetp',
        'othersAccount': 'paginationAccount',
        'accountType': 'paginationAccountType',
        'adminUsers': 'paginationAdminUsers',
        'newSubMenu': 'paginationNewSubMenu',
        'updateMenus': 'paginationUpdateMenus',
        "selectMenus": 'paginationSelectMenus',
        "purchase": 'paginationPurchase'
    }

    if (result.length > 10) {
        let paginationBtn = [
            prev == 0 ? undefined : { text: '⬅️Prev', callback_data: `${objCb[cbName]}#prev#${prev}` },
            nextCount != 0 ? { text: 'Next➡️', callback_data: `${objCb[cbName]}#next#${next}` } : undefined
        ]

        arr.push(paginationBtn.filter(item => item))
    }
    let keyboard = {
        reply_markup: {
            inline_keyboard: arr,
            resize_keyboard: true,
        },
    };
    return keyboard
}



module.exports = {
    dataConfirmBtnEmp
}