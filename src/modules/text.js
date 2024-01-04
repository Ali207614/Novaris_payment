const { get } = require("lodash");
const { SubMenu, accounts, accounts50 } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { empKeyboard, empMenuKeyboard } = require("../keyboards/keyboards");
const ShortUniqueId = require('short-unique-id');
const { randomUUID } = new ShortUniqueId({ length: 10 });
const { dataConfirmText } = require("../keyboards/text");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const b1Controller = require("../controllers/b1Controller");
let executeBtn = {
    "Orqaga": {
        selfExecuteFn: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateStep(chat_id, get(user, `back[${user.back.length - 1}].step`, 1))
            if (user?.update) {
                updateUser(chat_id, { update: false })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return true
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                return get(user, `back[${user.back.length - 1}].text`)
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let btnBack = get(user, `back[${user.back.length - 1}].btn`)
                updateUser(chat_id, { back: user.back.filter((item, i) => i != user.back.length - 1) })
                return await btnBack
            },
        },
    },
    "Kutilayotgan so’rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 1 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 1
        },
        next: {
            text: ({ chat_id }) => {
                return "So'rovlar"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar'])
            },
        },
    },
    "Tasdiqlanishi kutilayotgan so’rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 1 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 1
        },
        next: {
            text: ({ chat_id }) => {
                return "So'rovlar"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Bajarilishi kutilaytogan so’rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 1 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 1
        },
        next: {
            text: ({ chat_id }) => {
                return "So'rovlar"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "So'rov Yuborish": {
        selfExecuteFn: ({ chat_id, }) => {
            updateStep(chat_id, 10)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 1 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 1
        },
        next: {
            text: ({ chat_id }) => {
                return "Menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empMenuKeyboard
            },
        },
    },
}

let xorijiyXaridBtn = {
    "Xorijiy xarid": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != 'Xorijiy xarid' || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 1, menuName: 'Xorijiy xarid', chat_id })
            }
            updateStep(chat_id, 11)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Xorijiy xarid"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2)
            },
        },
    },
    "Xorijiy xarid konteyner buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid konteyner buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return "Ticket raqamini kiriting"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Xorijiy xarid mashina buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid mashina buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return "Ticket raqamini kiriting"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Xorijiy xarid tovar buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid tovar buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return "Ticket raqamini kiriting"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Xorijiy xarid to'lovi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 20)
            updateData(get(dataCurUser, 'id'), { subMenu: `Xorijiy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return "Hujjatni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2)
            },
        },
    },
    "Chetga pul chiqarish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 90)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chetga pul chiqarish` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2)
            },
        },
    },
    "Исходящий платеж(Chiquvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 21)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 20 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 20
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Document Type ni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Schet(Hisob)`, `Поставщик (Yetkazib beruvchi)`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Входящий платеж(Kiruvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            try {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                if (user?.update) {
                    updateStep(chat_id, dataCurUser?.lastStep)
                }
                else {
                    updateStep(chat_id, 21)
                    updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 20 })
                }
                updateData(user.currentDataId, { payment: true })
            }
            catch (e) {
                throw new Error(e)
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 20
        },
        next: {
            text: ({ chat_id }) => {
                try {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Document Type ni tanlang"
                }
                catch (e) {
                    throw new Error(e)
                }
            },
            btn: async ({ chat_id, }) => {
                try {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    let btn = user?.update ? list.lastBtn : empDynamicBtn([`Schet(Hisob)`, `Поставщик (Yetkazib beruvchi)`], 2)
                    updateUser(chat_id, { update: false })
                    return btn
                }
                catch (e) {
                    throw new Error(e)
                }
            },
        },
    },
    "Schet(Hisob)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Поставщик (Yetkazib beruvchi)`], 2), step: 21 })
            updateData(user.currentDataId, { documentType: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 21
        },
        next: {
            text: ({ chat_id }) => {
                return "Schet turini tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let b1Account43 = await b1Controller.getAccount43()
                let accountList43 = b1Account43.map((item, i) => {
                    return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                })
                updateData(user?.currentDataId, { accountList43 })
                return await dataConfirmBtnEmp(accountList43.sort((a, b) => a.id - b.id), 1, 'accountOneStep')
            },
        },
    },
    "Поставщик (Yetkazib beruvchi)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Поставщик (Yetkazib beruvchi)`], 2), step: 21 })
            updateData(user.currentDataId, { documentType: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 21
        },
        next: {
            text: ({ chat_id }) => {
                return "Поставщик (Yetkazib beruvchi) ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let mahalliyXaridBtn = {
    "Mahalliy xarid": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != 'Mahalliy xarid' || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 2, menuName: 'Mahalliy xarid', chat_id })
            }
            updateStep(chat_id, 40)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Mahalliy xarid"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[get(list, 'menu', 2)].map(item => item.name)], 2)
            },
        },
    },
    "Mahalliy xarid buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Mahalliy xarid buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 40 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 40
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Mahalliy xarid to'lovi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { DDS: `Mahalliy yetkazib beruvchilarga to'lov`, subMenu: `Mahalliy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 40 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 40
        },
        next: {
            text: ({ chat_id }) => {
                return "Hujjatni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2)
            },
        },
    },
    "Исходящий платеж(Chiquvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 42)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 41 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Поставщик (Yetkazib beruvchi) ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Входящий платеж(Kiruvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 42)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 41 })
            }
            updateData(user.currentDataId, { payment: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Поставщик (Yetkazib beruvchi) ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
}

let tolovHarajatBtn = {
    "To'lov/Xarajat": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "To'lov/Xarajat" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 3, menuName: "To'lov/Xarajat", chat_id })
            }
            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "To'lov/Xarajat"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[get(list, 'menu', 3)].map(item => item.name)], 2)
            },
        },
    },
    "Bank hisobidan to'lov/xarajat": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Bank hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Naqd/Karta hisobidan to'lov/xarajat": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Naqd/Karta hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2)
            },
        },
    },
    "Naqd/Click Bojxonaga oid xarajatlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 90)
            updateData(get(dataCurUser, 'id'), { subMenu: `Naqd/Click Bojxonaga oid xarajatlar` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2)
            },
        },
    },
    "Bank Bojxonaga oid xarajatlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Bank hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Исходящий платеж(Chiquvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 62)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 61 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Document Type ni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Входящий платеж(Kiruvchi to'lov)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 62)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 61 })
            }
            updateData(user.currentDataId, { payment: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : "Document Type ni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Schet(Hisob)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 63)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Schet turini tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let accountsObj = { ...accounts, ...(get(list, 'payment', false) ? accounts50 : {}) }
                let btn = await dataConfirmBtnEmp(Object.keys(accountsObj).map((item, i) => {
                    return { name: item, id: i }
                }), 2, 'accountType')
                return btn
            },
        },
    },
    "Заказчик(Группа: Xodimlar)(Xodim)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 80)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Поставщик (Yetkazib beruvchi) ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let tolovHarajatBojBtn = {
    "Исходящий платеж(Chiquvchi to'lov)": {
        selfExecuteFn: async ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 64)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 90 })
            }
            let b1Account15 = await b1Controller.getAccount15({ status: (dataCurUser.menu == 1 && dataCurUser.menuName == 'Xorijiy xarid') })
            let accountList15 = b1Account15?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { accountList: accountList15, payment: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 90
        },
        next: {
            text: ({ chat_id }) => {
                return 'Schetni tanlang'
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = await dataConfirmBtnEmp(list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Входящий платеж(Kiruvchi to'lov)": {
        selfExecuteFn: async ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 64)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2), step: 90 })
            }
            let b1Account15 = await b1Controller.getAccount15()
            let accountList15 = b1Account15?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { accountList: accountList15, payment: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 90
        },
        next: {
            text: ({ chat_id }) => {
                return 'Schetni tanlang'
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = await dataConfirmBtnEmp(list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Schet(Hisob)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 63)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Schet turini tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let accountsObj = { ...accounts, ...(get(list, 'payment', false) ? accounts50 : {}) }
                let btn = await dataConfirmBtnEmp(Object.keys(accountsObj).map((item, i) => {
                    return { name: item, id: i }
                }), 2, 'accountType')
                return btn
            },
        },
    },
    "Заказчик(Группа: Xodimlar)(Xodim)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 80)
            updateBack(chat_id, { text: "Document Type ni tanlang", btn: empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: false })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Поставщик (Yetkazib beruvchi) ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let shartnomaBtn = {
    "Shartnoma": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Shartnoma" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 4, menuName: "Shartnoma", chat_id })
            }
            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Shartnoma"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[get(list, 'menu', 4)].map(item => item.name)], 2)
            },
        },
    },
    "D12 Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D12 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "D64 Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D64 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "D777 Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D777 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Distribyutsiya Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Distribyutsiya Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    }
}


let narxChiqarishBtn = {
    "Narx chiqarish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Narx chiqarish" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 5, menuName: "Narx chiqarish", chat_id })
            }
            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Shartnoma"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[get(list, 'menu', 4)].map(item => item.name)], 2)
            },
        },
    },
    "Narx chiqarishni tasdiqlash xitoy": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash xitoy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Narx chiqarishni tasdiqlash mahalliy": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash mahalliy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let boshqaBtn = {
    "Boshqa": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Boshqa" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 6, menuName: "Boshqa", chat_id })
            }
            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empMenuKeyboard, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Shartnoma"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return empDynamicBtn([...SubMenu[get(list, 'menu', 4)].map(item => item.name)], 2)
            },
        },
    },
    "SAPda o'zgartirishni tasdiqlash": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `SAPda o'zgartirishni tasdiqlash` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Do'kon xarid": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Do'kon xarid` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Chegirma": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chegirma` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Yangi tovar nomi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Yangi tovar nomi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu[dataCurUser.menu].map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}



module.exports = {
    executeBtn,
    xorijiyXaridBtn,
    mahalliyXaridBtn,
    tolovHarajatBtn,
    narxChiqarishBtn,
    boshqaBtn,
    shartnomaBtn,
    tolovHarajatBojBtn
}