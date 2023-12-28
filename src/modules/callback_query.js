const { get } = require("lodash");
const b1Controller = require("../controllers/b1Controller");
const { SubMenu, accounts50, ocrdList, accounts, DDS, subAccounts50 } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData, formatterCurrency, deleteAllInvalidData } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const { empKeyboard, empMenuKeyboard } = require("../keyboards/keyboards");
const { dataConfirmText } = require("../keyboards/text");
let xorijiyXaridCallback = {
    "confirmEmp": {
        selfExecuteFn: async ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, user.user_step + 1)
            let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
            let btn = await dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            updateBack(chat_id, { text: dataConfirmText(info, 'Tasdiqlaysizmi ?'), btn, step: user.user_step })
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'lastMessageId', 1) == id
        },
        next: {
            text: ({ chat_id, data }) => {
                if (data[1] == '3') {
                    updateUser(chat_id, { update: true })
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    return dataConfirmText(info, `O'zgartirasizmi ?`)
                }
                else if (data[1] == '2') {
                    return 'Menuni tanlang'
                }
            },
            btn: async ({ chat_id, data }) => {
                if (data[1] == '3') {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let updateList = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    return await dataConfirmBtnEmp([...updateList.update, { name: "Bekor qilish ❌", id: 0 }], updateList.updateLine, 'update')
                }
                else if (data[1] == '2') {
                    updateUser(chat_id, { back: [], update: false })
                    updateStep(chat_id, 10)
                    deleteAllInvalidData({ chat_id })
                    return empMenuKeyboard
                }
            },
        },
    },
    "update": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, user.user_step + 1)
            if (data[1] != 0) {
                let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                let updateList = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                let btn = await dataConfirmBtnEmp([...updateList.update, { name: "Bekor qilish", id: 0 }], updateList.updateLine, 'update')
                updateBack(chat_id, { text: dataConfirmText(info, "O'zgartirasizmi ?"), btn, step: user.user_step })
                updateData(user.currentDataId, { lastStep: updateList.lastStep, lastBtn: await dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp') })
            }
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'lastMessageId', 1) == id
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let actData = infoData().find(item => item.id == user.currentDataId)
                if (data[1] == '0') {
                    let info = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).infoFn({ chat_id })
                    updateUser(chat_id, { update: false })
                    return dataConfirmText(info, "Tasdiqlaysizmi ?")
                }
                let updateList = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).update
                let update = updateList.find(item => item.id == data[1])
                updateStep(chat_id, update.step)
                return update.message

            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let actData = infoData().find(item => item.id == user.currentDataId)
                let updateList = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu)
                if (data[1] == '0') {
                    updateStep(chat_id, updateList.lastStep)
                    return await dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                let update = updateList.update.find(item => item.id == data[1])
                return await update.btn({ chat_id })
            },
        },
    },
    "pagination": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Поставщик (Yetkazib beruvchi) ni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                return await dataConfirmBtnEmp(list.vendorList, 1, 'partnerSearch', pagination)
            },
            update: true
        },
    },
    "partnerSearch": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, list.lastStep)
            }
            else {
                updateStep(chat_id, 23)
                let pagination = { prev: 0, next: 10 }
                let btn = await dataConfirmBtnEmp(list.vendorList, 1, 'partnerSearch', pagination)
                updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni tanlang`, btn, step: 22 })
            }
            updateData(user.currentDataId, { vendorId: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 22
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
                `
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "account": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 26)
                let btn = await dataConfirmBtnEmp(list.accountList43, 1, 'account')
                updateBack(chat_id, { text: `Schetni tanlang`, btn, step: 25 })
            }
            updateData(user.currentDataId, { accountCode: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 25
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `Valyutani tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp([{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "accountOneStep": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 23)
                let btn = await dataConfirmBtnEmp(list.accountList43, 1, 'accountOneStep')
                updateBack(chat_id, { text: `Schetni tanlang`, btn, step: 21 })
            }
            updateData(user.currentDataId, { accountCodeOneStep: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 21
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
                `
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "paginationOneSetp": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Schetni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                return await dataConfirmBtnEmp(list.vendorList, 1, 'accountOneStep', pagination)
            },
            update: true
        },
    },
    "currency": {
        selfExecuteFn: async ({ chat_id, data }) => {

            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 27)
                let btn = await dataConfirmBtnEmp([{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency')
                updateBack(chat_id, { text: `Valyutani tanlang`, btn, step: 26 })
            }
            updateData(user.currentDataId, { currency: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 26
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `Summani kiriting`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "rate": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 29)
                let btn = list?.currencyRate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+list?.currencyRate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn()
                updateBack(chat_id, { text: list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing', btn, step: 28 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 28
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
}


let mahalliyXaridCallback = {
    "paginationPoint": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Hisob nuqtasini tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = await dataConfirmBtnEmp(ocrdList, 1, 'point', pagination)
                return btn
            },
            update: true
        },
    },
    "partnerSearch": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, list.lastStep)
            }
            else {
                updateStep(chat_id, 44)
                let pagination = { prev: 0, next: 10 }
                let btn = await dataConfirmBtnEmp(list.vendorList, 1, 'partnerSearch', pagination)
                updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni tanlang`, btn, step: 43 })
            }
            updateData(user.currentDataId, { vendorId: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 43
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
                `
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "payType": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, 46)
            let btnList = [{ name: 'Naqd', id: 'Naqd' }, { name: 'Karta', id: 'Karta' }, { name: 'Terminal', id: 'Terminal' }, { name: `O'tkazma`, id: `O'tkazma` }]
            let btn = await dataConfirmBtnEmp(btnList, 2, 'payType')
            updateBack(chat_id, { text: `To'lov usullarini tanlang`, btn, step: 45 })
            updateData(user.currentDataId, { payType: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 45
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Valyutani tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let account50 = Object.keys(accounts50[data[1]]).map(item => {
                    return { name: item, id: item }
                })
                return await dataConfirmBtnEmp(account50, 2, 'currency')
            },
        },
    },
    "currency": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)

            updateStep(chat_id, 47)
            let account50 = Object.keys(accounts50[list?.payType]).map(item => {
                return { name: item, id: item }
            })
            let btn = await dataConfirmBtnEmp(account50, 2, 'currency')
            updateBack(chat_id, { text: `To'lov usullarini tanlang`, btn, step: 46 })
            let b1Account50 = await b1Controller.getAccount(accounts50[list?.payType][data[1]])
            let accountList50 = b1Account50?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { currency: data[1], accountList50 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 46
        },
        next: {
            text: async ({ chat_id, data }) => {
                return `Schetni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return await dataConfirmBtnEmp(list?.accountList50?.sort((a, b) => +b.id - +a.id), 1, 'account')
            },
        },
    },
    "account": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, list.lastStep)
            }
            else {
                updateStep(chat_id, 48)
                let btn = await dataConfirmBtnEmp(list?.accountList50.sort((a, b) => a.id - b.id), 1, 'account')
                updateBack(chat_id, { text: `Schetni tanlang`, btn, step: 47 })
            }
            updateData(user.currentDataId, { accountCode: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 47
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `Summani kiriting`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "rate": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 50)
                let btn = list?.currencyRate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+list?.currencyRate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
                updateBack(chat_id, { text: list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing', btn, step: 48 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 49
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "point": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 52)
                let btn = await dataConfirmBtnEmp(ocrdList, 1, 'point')
                updateBack(chat_id, { text: `Hisob nuqtasini tanlang`, btn, step: 51 })
            }
            updateData(user.currentDataId, { point: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 51
        },
        next: {
            text: ({ chat_id, data }) => {
                return 'Statya DDS ni tanlang'
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let ddsList = get(list, 'documentType', true) ? Object.keys(DDS)?.filter(item => DDS[item].includes(+get(list, 'accountCodeOther'))).map((item, i) => {
                    return { name: item, id: i }
                }) : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: '(Xodim) Qarz (Xarajat)', id: '-2' }])
                updateData(user.currentDataId, { ddsList })
                return await dataConfirmBtnEmp(
                    ddsList, 2, 'dds')
            },
        },
    },
    "dds": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 53)
                let btn = await dataConfirmBtnEmp(ocrdList, 1, 'point')
                updateBack(chat_id, { text: `Hisob nuqtasini tanlang`, btn, step: 51 })
            }
            updateData(user.currentDataId, { dds: get(list, 'ddsList', []).find((item, i) => i == data[1])?.name })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 52
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let info = SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?')
            },
            btn: async ({ chat_id, data }) => {
                return await dataConfirmBtnEmp(
                    [
                        { name: 'Ha', id: 1, },
                        { name: 'Bekor qilish', id: 2 },
                        { name: "O'zgartirish", id: 3 }
                    ], 2, 'confirmEmp')
            },
        },
    },
}

let othersCallback = {
    "accountType": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 64)
            let accountsObj = { ...accounts, ...(get(list, 'payment', false) ? subAccounts50 : {}) }
            let accountsList = accountsObj[Object.keys(accountsObj)[data[1]]]
            let btn = await dataConfirmBtnEmp(Object.keys(accountsObj).map((item, i) => {
                return { name: item, id: i }
            }), 2, 'accountType')
            updateBack(chat_id, { text: `Schet turini tanlang`, btn, step: 63 })
            let b1Account = await b1Controller.getAccountNo(accountsList)
            let accountList = b1Account?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { accountType: Object.keys(accountsObj)[data[1]], accountList })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 63
        },
        next: {
            text: async ({ chat_id, data }) => {
                return `Schetni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)

                return await dataConfirmBtnEmp(list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
            },
        },
    },
    "othersAccount": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, list.lastStep)
            }
            else {
                updateStep(chat_id, 65)
                let btn = await dataConfirmBtnEmp(list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                updateBack(chat_id, { text: `Schetni tanlang`, btn, step: 64 })
            }
            updateData(user.currentDataId, { accountCodeOther: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 64
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
                `
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "paginationAccount": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Schet ni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = await dataConfirmBtnEmp(list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount', pagination)
                return btn
            },
            update: true
        },
    },
    "paginationAccountType": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Schet turini tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let accountsObj = { ...accounts, ...(get(list, 'payment', false) ? accounts50 : {}) }
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = await dataConfirmBtnEmp(Object.keys(accountsObj).map((item, i) => {
                    return { name: item, id: i }
                }), 2, 'accountType', pagination)
                return btn
            },
            update: true
        },
    }
}

module.exports = {
    xorijiyXaridCallback,
    mahalliyXaridCallback,
    othersCallback
}