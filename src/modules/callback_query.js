const { get } = require("lodash");
const { bot } = require("../config");
const b1Controller = require("../controllers/b1Controller");
const jiraController = require("../controllers/jiraController");
const { SubMenu, accounts50, ocrdList, accounts, DDS, subAccounts50, Menu, selectedUserStatus, selectedUserStatusUzb } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData, formatterCurrency, deleteAllInvalidData, confirmativeListFn, executerListFn, updatePermisson, infoPermisson, deleteBack } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const { empKeyboard, empMenuKeyboard } = require("../keyboards/keyboards");
const { dataConfirmText, ticketAddText } = require("../keyboards/text");
let xorijiyXaridCallback = {
    "confirmEmp": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, user.user_step + 1)
            let cred = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
            let info = cred.infoFn({ chat_id })
            let btn = await dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            updateBack(chat_id, { text: dataConfirmText(info, 'Tasdiqlaysizmi ?'), btn, step: user.user_step })
            if (data[1] == '1') {
                let confirmativeList = confirmativeListFn()
                let btnConfirmative = await dataConfirmBtnEmp([{ name: 'Tasdiqlash', id: `1#${list.id}`, }, { name: 'Bekor qilish', id: `2#${list.id}` }, { name: "O'zgartirish", id: `3#${list.id}` }], 2, 'confirmConfirmative')
                for (let i = 0; i < confirmativeList.length; i++) {
                    bot.sendMessage(confirmativeList[i].chat_id, dataConfirmText(info, 'Tasdiqlaysizmi ?'), btnConfirmative)
                }

                // if (get(cred, 'jira')) {
                //     let statusObj = await jiraController.jiraIntegrationResultObj({ list, cred })
                //     updateData(user.currentDataId, { ticketAdd: true, ticketStatusObj: statusObj })
                // }
                // if (get(cred, 'b1.status')) {
                //     let b1MainStatus = await b1Controller.executePayments({ list, cred })
                // }
            }
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'lastMessageId', 1) == id
        },
        next: {
            text: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                if (data[1] == '3') {
                    updateUser(chat_id, { update: true })
                    let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    return dataConfirmText(info, `O'zgartirasizmi ?`)
                }
                else if (data[1] == '2') {
                    return 'Menuni tanlang'
                }
                else if (data[1] == '1') {
                    // if (list.ticketAdd) {
                    //     let text = ticketAddText(list.ticketStatusObj)
                    //     return text
                    // }
                    // return 'SAP'
                    return `Tasdiqlovchiga jo'natildi`
                }
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })

                if (data[1] == '3') {
                    let updateList = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    return await dataConfirmBtnEmp([...updateList.update, { name: "Bekor qilish ❌", id: 0 }], updateList.updateLine, 'update')
                }
                else if (data[1] == '2') {
                    updateUser(chat_id, { back: [], update: false })
                    updateStep(chat_id, 10)
                    deleteAllInvalidData({ chat_id })
                    return empMenuKeyboard
                }
                else if (data[1] == '1') {
                    updateData(user.currentDataId, { full: true })
                    updateStep(chat_id, 10)
                    updateUser(chat_id, { back: [], update: false })
                    return empMenuKeyboard
                }
            },
        },
    },
    "confirmConfirmative": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == data[2])
            let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id })

            if (get(list, 'confirmative')) {
                return
            }
            else if (data[1] == '1') {
                updateData(data[2], { confirmative: { chat_id, status: true } })
                let executerList = executerListFn()
                let btnExecuter = await dataConfirmBtnEmp([{ name: 'Tasdiqlash', id: `1#${list.id}`, }, { name: 'Bekor qilish', id: `2#${list.id}` }, { name: "O'zgartirish", id: `3#${list.id}` }], 2, 'confirmExecuter')
                for (let i = 0; i < executerList.length; i++) {
                    bot.sendMessage(executerList[i].chat_id, dataConfirmText(info, 'Tasdiqlaysizmi ?'), btnExecuter)
                }

                let confirmativeList = confirmativeListFn().filter(item => item.chat_id != chat_id)
                let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Tasdiqlovchi tasdiqladi ✅ ID:${list.ID}`
                for (let i = 0; i < confirmativeList.length; i++) {
                    bot.sendMessage(confirmativeList[i].chat_id, dataConfirmText(info, text))
                }
                bot.sendMessage(list.chat_id, dataConfirmText(info, text))
            }
            else if (data[1] == '2') {
                updateData(data[2], { confirmative: { chat_id, status: false } })
                let confirmativeList = confirmativeListFn().filter(item => item.chat_id != chat_id)
                let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Tasdiqlovchi tasdiqlamadi ❌ ID:${list.ID}`
                for (let i = 0; i < confirmativeList.length; i++) {
                    bot.sendMessage(confirmativeList[i].chat_id, dataConfirmText(info, text))
                }
                bot.sendMessage(list.chat_id, dataConfirmText(info, text))
            }
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return true
        },
        next: {
            text: async ({ chat_id, data }) => {
                let list = infoData().find(item => item.id == data[2])
                if (get(list, 'confirmative')) {
                    let confirmativeUser = infoUser().find(item => item.chat_id == get(list, 'confirmative.chat_id'))
                    let text = `${get(confirmativeUser, 'LastName')} ${get(confirmativeUser, 'FirstName')} Tasdiqlovchi ${get(list, 'confirmative.status') ? 'tasdiqlagan ✅' : 'bekor qilgan ❌'}`
                    return text
                }
                if (data[1] == '1') {
                    return `Tasdiqlandi va Bajaruvchiga jo'natildi  ✅`
                }
                if (data[1] == '2') {
                    return `Tasdiqlanmadi ❌`
                }
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == data[2])
                return
            },
        },
    },
    "confirmExecuter": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == data[2])
            let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id })
            if (get(list, 'executer')) {
                return
            }
            else if (data[1] == '1') {
                updateData(data[2], { executer: { chat_id, status: true } })
                let executerList = executerListFn().filter(item => item.chat_id != chat_id)
                let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi tasdiqladi ✅ ID:${list.ID}`
                for (let i = 0; i < executerList.length; i++) {
                    bot.sendMessage(executerList[i].chat_id, dataConfirmText(info, text))
                }
                bot.sendMessage(list.chat_id, dataConfirmText(info, text))
            }
            else if (data[1] == '2') {
                updateData(data[2], { executer: { chat_id, status: false } })
                let confirmativeList = confirmativeListFn().filter(item => item.chat_id == get(list, 'confirmative.chat_id'))
                let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi tasdiqlamadi ❌ ID:${list.ID}`
                for (let i = 0; i < confirmativeList.length; i++) {
                    bot.sendMessage(confirmativeList[i].chat_id, dataConfirmText(info, text))
                }

                let executerList = executerListFn().filter(item => item.chat_id != chat_id)
                for (let i = 0; i < executerList.length; i++) {
                    bot.sendMessage(executerList[i].chat_id, dataConfirmText(info, text))
                }

                bot.sendMessage(list.chat_id, dataConfirmText(info, text))
            }
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return true
        },
        next: {
            text: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == data[2])
                if (get(list, 'executer')) {
                    let executerUser = infoUser().find(item => item.chat_id == get(list, 'executer.chat_id'))
                    let text = `${get(executerUser, 'LastName')} ${get(executerUser, 'FirstName')} Bajaruvchi ${get(lit, 'confirmative.status') ? 'tasdiqlagan ✅' : 'bekor qilgan ❌'}`
                    return text
                }
                if (data[1] == '1') {
                    return `Tasdiqlandi jo'natildi ✅`
                }
                if (data[1] == '2') {
                    return `Tasdiqlanmadi ❌`
                }
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == data[2])
                return
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
    "Waiting": {
        selfExecuteFn: ({ chat_id, data }) => {
            try {
                let user = infoUser().find(item => item.chat_id == chat_id);
                let list = infoData().find(item => item.id == data[2])
                let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                let btn = dataConfirmBtnEmp([{ name: "O'zgartirish", id: `3#${list.id}` }], 2, 'waiting')
                updateStep(chat_id, 201)
                updateBack(chat_id, { text: dataConfirmText(info, `Kutilayotgan So'rovlar`), btn, step: 200 })
            }
            catch (e) {
                console.log(e, ' bu err 1')
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 200
        },
        next: {
            text: ({ chat_id, data }) => {
                try {
                    let list = infoData().find(item => item.id == data[2])
                    updateUser(chat_id, { update: true, currentDataId: data[2] })
                    let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id, id: data[2] })
                    return dataConfirmText(info, `O'zgartirasizmi ?`)
                }
                catch (e) {
                    console.log(e, ' bu err 2')
                }
            },
            btn: async ({ chat_id, data }) => {
                try {
                    let list = infoData().find(item => item.id == data[2])
                    let updateList = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)

                    return await dataConfirmBtnEmp([...updateList.update, { name: "Bekor qilish ❌", id: `0#${data[2]}` }], updateList.updateLine, 'updateWaiting')
                }
                catch (e) {
                    console.log(e, ' bu err 3')
                }
            },
        },
    },
    "updateWaiting": {
        selfExecuteFn: async ({ chat_id, data }) => {
            try {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                updateStep(chat_id, user.user_step + 1)
                if (data[1] != 0) {
                    let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    let updateList = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    let btn = await dataConfirmBtnEmp([...updateList.update, { name: "Bekor qilish", id: `0#${data[2]}` }], updateList.updateLine, 'updateWaiting')
                    updateBack(chat_id, { text: dataConfirmText(info, "O'zgartirasizmi ?"), btn, step: user.user_step })
                    updateData(user.currentDataId, { lastStep: 200, lastBtn: await dataConfirmBtnEmp([{ name: "O'zgartirish", id: `3#${user.currentDataId}` }], 2, 'Waiting') })
                }
            }
            catch (e) {
                throw new Error(e)
            }
        },
        middleware: ({ chat_id, id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 201
        },
        next: {
            text: ({ chat_id, data }) => {
                try {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let actData = infoData().find(item => item.id == user.currentDataId)
                    if (data[1] == '0') {
                        let info = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).infoFn({ chat_id })
                        updateUser(chat_id, { update: false })
                        return dataConfirmText(info, "Kutilayotgan So'rovlar ?")
                    }
                    let updateList = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).update
                    let update = updateList.find(item => item.id == data[1])
                    updateStep(chat_id, update.step)
                    return update.message
                }
                catch (e) {
                    throw new Error(e)
                }
            },
            btn: async ({ chat_id, data }) => {
                try {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let actData = infoData().find(item => item.id == user.currentDataId)
                    let updateList = SubMenu[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu)
                    if (data[1] == '0') {
                        updateStep(chat_id, updateList.lastStep)
                        return await dataConfirmBtnEmp([{ name: "O'zgartirish", id: `3#${user.currentDataId}` }], 2, 'Waiting')
                    }
                    let update = updateList.update.find(item => item.id == data[1])
                    return await update.btn({ chat_id })
                }
                catch (e) {
                    throw new Error(e)
                }
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
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return user?.update ? dataConfirmText(info, 'Tasdiqlaysizmi ?') : 'Statya DDS ni tanlang'
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let ddsList = get(list, 'documentType', false) ? Object.keys(DDS)?.filter(item => DDS[item].includes(+get(list, 'accountCodeOther'))).map((item, i) => {
                    return { name: item, id: i }
                }) : (get(list, "DDS", false) ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: '(Xodim) Qarz (Xarajat)', id: '-2' }]))
                updateData(user.currentDataId, { ddsList })
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(
                    ddsList, 2, 'dds')
                return btn
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

let adminCallback = {
    "adminUsers": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateUser(chat_id, { selectedAdminUserChatId: data[1] })
            updateStep(chat_id, 701)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 700
        },
        next: {
            text: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == data[1])
                return `${user?.LastName} ${user?.FirstName}`
            },
            btn: async ({ chat_id, data }) => {
                return empDynamicBtn(['Rollar', "Xodim-Menular", "Tasdiqlovchi-Menular", "Bajaruvchi-Menular"], 2)
            },
        },
    },
    "roles": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            let roles = get(infoPermissonData, 'roles', []).find(item => item === data[1]) ? get(infoPermissonData, 'roles', []).filter(item => item !== data[1]) : [...get(infoPermissonData, 'roles', []), data[1]]
            updatePermisson(get(user, 'selectedAdminUserChatId'), { roles })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 702
        },
        next: {
            text: async ({ chat_id, data }) => {
                return `Rollarni belgilang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                return dataConfirmBtnEmp(
                    [
                        {
                            name: `Xodim ${get(infoPermissonData, 'roles', []).includes('1') ? '✅' : ''}`,
                            id: 1
                        },
                        {
                            name: `Tasdiqlovchi ${get(infoPermissonData, 'roles', []).includes('2') ? '✅' : ''}`,
                            id: 2
                        },
                        {
                            name: `Bajaruvchi ${get(infoPermissonData, 'roles', []).includes('3') ? '✅' : ''}`,
                            id: 3
                        }
                    ]
                    , 1, 'roles')
            },
            update: true
        },
    },
    "empMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            let menuList = Menu.map(item => {
                return { ...item, name: `${item.name} ${get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[item.id]?.length ? '✅' : ''}` }
            })
            updateBack(chat_id, {
                text: `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`, btn: await dataConfirmBtnEmp(menuList, 1, 'empMenu'), step: 702
            })
            updateStep(chat_id, 703)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 702
        },
        next: {
            text: async ({ chat_id, data }) => {

                let user = infoUser().find(item => item.chat_id == chat_id)

                return `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let infPermisson = get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]]?.length ? get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]] : []
                return dataConfirmBtnEmp(SubMenu[data[1]].map((item, i) => {
                    return { name: `${item.name} ${infPermisson.includes(`${i}`) ? '✅' : ' '}`, id: `${data[1]}#${i}` }
                }), 1, 'subMenu')
            },
        },
    },
    // affirmativeMenu
    "subMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            let infPermisson = get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})
            if (infPermisson[data[1]]?.length) {
                infPermisson[data[1]] = infPermisson[data[1]].find(item => item == data[2]) ? infPermisson[data[1]].filter(item => item != data[2]) : [...infPermisson[data[1]], data[2]]
            }
            else {
                infPermisson = { ...infPermisson, ...Object.fromEntries([[data[1], [data[2]]]]) }
            }
            deleteBack(chat_id, 702)
            // `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`
            updatePermisson(get(user, 'selectedAdminUserChatId'), Object.fromEntries([[selectedUserStatus[get(user, 'selectedAdminUserStatus')], infPermisson]]))
            infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            let menuList = Menu.map(item => {
                return { ...item, name: `${item.name} ${get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[item.id]?.length ? '✅' : ''}` }
            })
            updateBack(chat_id, {
                text: `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`, btn: await dataConfirmBtnEmp(menuList, 1, 'empMenu'), step: 702
            })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 703
        },
        next: {
            text: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                return `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let infPermisson = get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]]?.length ? get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]] : []
                return dataConfirmBtnEmp(SubMenu[data[1]].map((item, i) => {
                    return { name: `${item.name} ${infPermisson.includes(`${i}`) ? '✅' : ' '}`, id: `${data[1]}#${i}` }
                }), 1, 'subMenu')
            },
            update: true
        },
    },
    "paginationAdminUsers": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Foydalanuvchini tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().filter(item => item.JobTitle !== 'Admin')
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = await dataConfirmBtnEmp(user.map(item => {
                    return {
                        name: `${item.LastName} ${item.FirstName}`, id: item.chat_id
                    }
                }), 1, 'adminUsers', pagination)
                return btn
            },
            update: true
        },
    }

}

module.exports = {
    xorijiyXaridCallback,
    mahalliyXaridCallback,
    othersCallback,
    adminCallback
}