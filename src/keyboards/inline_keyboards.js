const { get } = require("lodash")
const { infoUser, updateUser, updateData } = require("../helpers")
const { mainMenuByRoles } = require("./keyboards")

const dataConfirmBtnEmp = async (chat_id = '', list = [], count = 1, cbName, pagination = { prev: 0, next: 10 }, keyboardList = []) => {

    let user = infoUser().find(item => item.chat_id == chat_id)
    if (get(user, 'extraWaiting') || get(user, 'waitingUpdateStatus')) {
        let curruntUser = infoUser().find(item => item.chat_id == chat_id)
        if (get(curruntUser, 'extraWaiting')) {
            updateUser(chat_id, { extraWaiting: false })
            return mainMenuByRoles({ chat_id })
        }

    }

    let arr = []
    let result = list
    let next = get(pagination, 'next', 0)
    let prev = get(pagination, 'prev', 10)
    let nextCount;
    if (result.length > 10) {
        nextCount = list.slice(prev, +next + 1).length - list.slice(prev, next).length
        list = list.slice(prev, next)
        if (user) {
            updateUser(chat_id, { pagination: { next, prev } })
        }
    }
    for (let i = 0; i < list.length; i += count) {
        let el = list
        arr.push(el.slice(i, i + count).map(itemData => {
            return { text: itemData.name, callback_data: `${cbName}#${itemData.id}` }
        }))
    }

    let objCb = {
        'point': 'paginationPoint',
        'account': 'paginationAccounts',
        'partnerSearch': 'pagination',
        'accountOneStep': 'paginationOneSetp',
        'othersAccount': 'paginationAccount',
        'accountType': 'paginationAccountType',
        'adminUsers': 'paginationAdminUsers',
        'newSubMenu': 'paginationNewSubMenu',
        'updateMenus': 'paginationUpdateMenus',
        "selectMenus": 'paginationSelectMenus',
        "purchase": 'paginationPurchase',
        "selectGroup": "paginationSelectGroup",
        "empMenu": 'paginationEmpMenu',
        "subMenu": 'paginationSubMenu',
        "accountMenu": 'paginationAccountMenu',
        "selectAccountMenu": 'paginationSelectAccountMenu',
        "menuGroup": "paginationMenuGroup",
        "subMenuGroup": "paginationSubMenuGroup",
    }
    let backCb = {
        'accountListMenu': {
            text: 'Menuga qaytish',
            cb: 'backCategory'
        },
        'selectAccountMenu': {
            text: 'Schetga qaytish',
            cb: 'backAccountMenu'
        },
        'accountListAdminGroup': {
            text: 'Schetga qaytish',
            cb: 'backAccountListAdmin'
        },
        'accountListCurrency': {
            text: 'Gruppani qaytish',
            cb: 'backAccountListGroup'
        }
    }
    if (result.length > 10) {
        let paginationBtn = [
            prev == 0 ? undefined : { text: '⬅️Prev', callback_data: `${objCb[cbName]}#prev#${prev}` },
            nextCount != 0 ? { text: 'Next➡️', callback_data: `${objCb[cbName]}#next#${next}` } : undefined
        ]

        arr.push(paginationBtn.filter(item => item))
    }

    if (backCb[cbName]) {
        arr.push([
            {
                text: '⬅️⬅️' + backCb[cbName].text,
                callback_data: backCb[cbName].cb
            }
        ])
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