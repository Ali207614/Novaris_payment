const { get, isEmpty, update } = require("lodash");
const { bot } = require("../config");
const b1Controller = require("../controllers/b1Controller");
const jiraController = require("../controllers/jiraController");
let { SubMenu, accounts50, ocrdList, accounts, DDS, subAccounts50, Menu, selectedUserStatus, selectedUserStatusUzb, newMenu, payType50 } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData, formatterCurrency, deleteAllInvalidData, confirmativeListFn, executerListFn, updatePermisson, infoPermisson, deleteBack, infoMenu, writeSubMenu, writeMenu, infoSubMenu, updateSubMenu, updateMenu, infoAllSubMenu, infoAllMenu } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const { mainMenuByRoles } = require("../keyboards/keyboards");
const { dataConfirmText, ticketAddText } = require("../keyboards/text");
let moment = require('moment')
let xorijiyXaridCallback = {
    "confirmEmp": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (get(list, 'full')) {
                return
            }
            updateStep(chat_id, user.user_step + 1)
            let cred = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
            let info = cred.infoFn({ chat_id })
            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id

            let btn = await dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            updateBack(chat_id, { text: dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id), btn, step: user.user_step })
            if (data[1] == '1') {
                let accessChatId = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
                let btnConfirmative = await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${list.id}`, }, { name: 'Bekor qilish', id: `2#${list.id}` }], 2, 'confirmConfirmative')
                let confirmativeSendlist = []
                for (let i = 0; i < accessChatId.length; i++) {
                    let send = await bot.sendMessage(accessChatId[i], dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id), btnConfirmative)
                    confirmativeSendlist.push({ messageId: send.message_id, chatId: accessChatId[i] })
                }
                updateData(user.currentDataId, { confirmativeSendlist })
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
                if (get(list, 'full')) {
                    return `Tasdiqlovchiga jo'natilagan`
                }
                let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })

                if (data[1] == '3') {
                    updateUser(chat_id, { update: true })
                    return dataConfirmText(info, `O'zgartirasizmi ?`, chat_id)
                }
                else if (data[1] == '2') {
                    return 'Menuni tanlang'
                }
                else if (data[1] == '1') {

                    return `Tasdiqlovchiga jo'natildi`
                }
            },
            btn: async ({ chat_id, data }) => {

                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                if (get(list, 'full')) {
                    return
                }
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })

                if (data[1] == '3') {
                    let updateList = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    return await dataConfirmBtnEmp(chat_id, [...updateList.update, { name: "Bekor qilish ❌", id: 0 }], updateList.updateLine, 'update')
                }
                else if (data[1] == '2') {
                    updateUser(chat_id, { update: false, back: [] })
                    updateStep(chat_id, 10)
                    deleteAllInvalidData({ chat_id })

                    let permisson = infoPermisson().find(item => chat_id == item.chat_id)
                    let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
                    // let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)
                    return mainMenuByRoles({ chat_id })
                }
                else if (data[1] == '1') {
                    updateData(user.currentDataId, { full: true, stateTime: { ...list.stateTime, create: new Date() } })
                    updateStep(chat_id, 10)
                    updateUser(chat_id, { update: false, back: [] })
                    let permisson = infoPermisson().find(item => chat_id == item.chat_id)
                    let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
                    // let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)
                    return mainMenuByRoles({ chat_id })
                }
            },
        },
    },
    "confirmConfirmative": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == data[2])
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: data[2] })
            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
            if (get(list, 'confirmative')) {
                return
            }
            else if (data[1] == '1') {
                let executerList = infoPermisson().filter(item => get(get(item, 'permissonMenuExecutor', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
                let btnExecuter = await dataConfirmBtnEmp(chat_id, [{ name: 'Bajarish', id: `1#${list.id}`, }, { name: 'Bekor qilish', id: `2#${list.id}` }], 2, 'confirmExecuter')
                for (let i = 0; i < executerList.length; i++) {
                    bot.sendMessage(executerList[i], dataConfirmText(info, 'Bajarasizmi ?', chat_id), btnExecuter)
                }

                let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
                let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Tasdiqlovchi tasdiqladi ✅ ID:${list.ID}`
                for (let i = 0; i < confirmativeList.length; i++) {
                    bot.sendMessage(confirmativeList[i], dataConfirmText(info, text, chat_id))
                }
                bot.sendMessage(list.chat_id, dataConfirmText(info, text, chat_id))
            }
            else if (data[1] == '2') {
                updateStep(chat_id, 4000)
                updateUser(chat_id, { notConfirmId: data[2], confirmationStatus: true })
            }
        },
        middleware: ({ chat_id, id }) => {
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
                    if (get(list, 'menuName') == 'Shartnoma') {
                        updateData(data[2], { executer: { chat_id, status: true }, confirmative: { chat_id, status: true }, stateTime: { ...list.stateTime, executor: { status: true, date: new Date() }, confirmative: { status: true, date: new Date() } } })
                        return `Tasdiqlandi ✅`
                    }
                    else {
                        updateData(data[2], { confirmative: { chat_id, status: true }, stateTime: { ...list.stateTime, confirmative: { status: true, date: new Date() } } })
                        return `Tasdiqlandi va Bajaruvchiga jo'natildi  ✅`
                    }

                }
                if (data[1] == '2') {
                    updateData(data[2], { confirmative: { chat_id, status: false }, stateTime: { ...list.stateTime, confirmative: { status: false, date: new Date() } } })
                    return `Bekor qilinganlik sababini yozing`
                }
            },
            btn: async ({ chat_id, data }) => {
                return
            },
        },
    },
    "confirmExecuter": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let list = infoData().find(item => item.id == data[2])
            let cred = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
            if (get(list, 'sapB1') === false && get(list, 'jira') === false) {
                return
            }
            if (get(list, 'executer')) {
                return
            }
            else if (data[1] == '1') {
                updateData(data[2], { jira: true, sapB1: true })
                let deleteMessage = bot.sendMessage(chat_id, `Loading...`)
                let count = 0;
                if (get(cred, 'jira')) {
                    let statusObj = await jiraController.jiraIntegrationResultObj({ list, cred })
                    updateData(data[2], { ticketAdd: true, ticketStatusObj: statusObj, jira: false })
                    count += 1
                    if (count == 2) {
                        bot.deleteMessage(chat_id, deleteMessage.message_id)
                    }
                }
                if (get(cred, 'b1.status')) {
                    let b1MainStatus = await b1Controller.executePayments({ list, cred })
                    updateData(data[2], { sapB1: false, sap: b1MainStatus?.status, sapErrorMessage: b1MainStatus?.message, purchase: false })
                    count += 1
                    if (count == 2) {
                        bot.deleteMessage(chat_id, deleteMessage.message_id)
                    }
                }
            }
            else if (data[1] == '2') {
                updateStep(chat_id, 5000)
                updateUser(chat_id, { notConfirmId: data[2], confirmationStatus: true })
            }
        },
        middleware: ({ chat_id, id }) => {
            return true
        },
        next: {
            text: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == data[2])
                if (get(list, 'sapB1') === false && get(list, 'jira') === false) {
                    return
                }
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: data[2] })
                let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id

                if (get(list, 'executer')) {
                    let executerUser = infoUser().find(item => item.chat_id == get(list, 'executer.chat_id'))
                    let text = `${get(executerUser, 'LastName')} ${get(executerUser, 'FirstName')} Bajaruvchi ${get(list, 'confirmative.status') ? 'tasdiqlagan ✅' : 'bekor qilgan ❌'}`
                    return text
                }
                if (data[1] == '1') {
                    updateData(data[2], { executer: { chat_id, status: true }, stateTime: { ...list.stateTime, executor: { status: true, date: new Date() } } })
                    let str = ''
                    if (get(list, 'ticketAdd')) {
                        let text = ticketAddText(list.ticketStatusObj)
                        str += `Jira\n${text}\n`
                    }
                    if (get(list, 'sap')) {
                        str += `Sapga qo'shildi ✅`
                    }
                    else if (get(list, 'sap') === false) {
                        str += `Sapga qo'shilmadi ❌ ${get(list, 'sapErrorMessage', '')}`
                    }
                    if (str) {
                        updateData(list.id, { SapJiraMessage: str })
                    }
                    let executerList = infoPermisson().filter(item => get(get(item, 'permissonMenuExecutor', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
                    let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajardi ✅ ID:${list.ID}`
                    for (let i = 0; i < executerList.length; i++) {
                        bot.sendMessage(executerList[i], dataConfirmText(info, text, chat_id))
                    }

                    let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)

                    for (let i = 0; i < confirmativeList.length; i++) {
                        bot.sendMessage(confirmativeList[i], dataConfirmText(info, text, chat_id))
                    }
                    bot.sendMessage(list.chat_id, dataConfirmText(info, text, chat_id))
                    return str || 'Bajarildi ✅'
                }
                if (data[1] == '2') {
                    updateData(data[2], { executer: { chat_id, status: false } })
                    updateData(data[2], { stateTime: { ...list.stateTime, executor: { status: false, date: new Date() } } })

                    return `Bekor qilinganlik sababini yozing`
                }
            },
            btn: async ({ chat_id, data }) => {
                return empDynamicBtn()
            },
        },
    },
    "update": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, user.user_step + 1)
            if (data[1] != 0) {
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                let updateList = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                let btn = await dataConfirmBtnEmp(chat_id, [...updateList.update, { name: "Bekor qilish", id: 0 }], updateList.updateLine, 'update')
                updateBack(chat_id, { text: dataConfirmText(info, "O'zgartirasizmi ?", chat_id), btn, step: user.user_step })
                updateData(user.currentDataId, { lastStep: updateList.lastStep, lastBtn: await dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp') })
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
                    let info = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).infoFn({ chat_id })
                    updateUser(chat_id, { update: false })
                    return dataConfirmText(info, "Tasdiqlaysizmi ?", chat_id)
                }
                let updateList = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).update
                let update = updateList.find(item => item.id == data[1])
                updateStep(chat_id, update.step)
                return update.message

            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let actData = infoData().find(item => item.id == user.currentDataId)
                let updateList = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu)
                if (data[1] == '0') {
                    updateStep(chat_id, updateList.lastStep)
                    return await dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                let update = updateList.update.find(item => item.id == data[1])
                return await update.btn({ chat_id })
            },
        },
    },
    "Waiting": {
        selfExecuteFn: ({ chat_id, data }) => {
            let list = infoData().find(item => item.id == data[2])
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
            let btn = dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${list.id}` }], 2, 'waiting')
            updateStep(chat_id, 201)
            updateBack(chat_id, { text: dataConfirmText(info, `Kutilayotgan So'rovlar`, chat_id), btn, step: 200 })

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step
        },
        next: {
            text: ({ chat_id, data }) => {
                let list = infoData().find(item => item.id == data[2])
                updateUser(chat_id, { update: true, currentDataId: data[2] })
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id, id: data[2] })
                return dataConfirmText(info, `O'zgartirasizmi ?`, chat_id)

            },
            btn: async ({ chat_id, data }) => {
                let list = infoData().find(item => item.id == data[2])
                let updateList = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)

                return await dataConfirmBtnEmp(chat_id, [...updateList.update, { name: "Bekor qilish ❌", id: `0#${data[2]}` }], updateList.updateLine, 'updateWaiting')

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
                    let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    let updateList = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    let btn = await dataConfirmBtnEmp(chat_id, [...updateList.update, { name: "Bekor qilish", id: `0#${data[2]}` }], updateList.updateLine, 'updateWaiting')
                    updateBack(chat_id, { text: dataConfirmText(info, "O'zgartirasizmi ?", chat_id), btn, step: user.user_step })
                    updateData(user.currentDataId, { lastStep: 200, lastBtn: await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${user.currentDataId}` }], 2, 'Waiting') })
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
                        let info = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).infoFn({ chat_id })
                        let btn = dataConfirmText(info, "Kutilayotgan So'rovlar ?", chat_id)
                        updateUser(chat_id, { update: false, waitingUpdateStatus: false })
                        return btn
                    }
                    let updateList = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu).update
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
                    let updateList = SubMenu()[get(actData, 'menu', 1)].find(item => item.name == actData.subMenu)
                    if (data[1] == '0') {
                        updateStep(chat_id, updateList.lastStep)
                        return await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${user.currentDataId}` }], 2, 'Waiting')
                    }
                    let update = updateList.update.find(item => item.id == data[1])
                    let btn = await update.btn({ chat_id })
                    updateUser(chat_id, { waitingUpdateStatus: true })
                    updateData(user.currentDataId, { lastBtn: mainMenuByRoles({ chat_id }) })
                    return btn
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
                return await dataConfirmBtnEmp(chat_id, list.vendorList, 1, 'partnerSearch', pagination)
            },
            update: true
        },
    },
    "partnerSearch": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, 2300)
            let pagination = { prev: 0, next: 10 }
            let btn = await dataConfirmBtnEmp(chat_id, list.vendorList, 1, 'partnerSearch', pagination)
            updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni tanlang`, btn, step: 22 })
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
                return `To'lovni turini tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = await dataConfirmBtnEmp(chat_id, [{ name: "Bo'nak", id: '1' }, { name: "To'lov", id: '2' }], 2, 'type')
                return btn
            },
        },
    },
    "type": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update && data[1] == '2') {
                updateStep(chat_id, list.lastStep)
            }
            else if (data[1] == '2') {
                let btn = await dataConfirmBtnEmp(chat_id, [{ name: "Bo'nak", id: '1' }, { name: "To'lov", id: '2' }], 2, 'type')
                updateBack(chat_id, { text: `To'lovni turini tanlang`, btn, step: 2300 })
                updateStep(chat_id, 23)
                updateData(user.currentDataId, { purchase: false })
            }
            else {
                let purchaseOrdersB1 = await b1Controller.getPurchaseOrder({ cardCode: get(list, 'vendorId', '') })
                updateData(user?.currentDataId, { purchaseOrders: purchaseOrdersB1, purchase: true })
                let btn = await dataConfirmBtnEmp(chat_id, [{ name: "Bo'nak", id: '1' }, { name: "To'lov", id: '2' }], 2, 'type')
                updateBack(chat_id, { text: `To'lovni turini tanlang`, btn, step: 2300 })
                updateStep(chat_id, 2301)
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 2300
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                if (data[1] == '1') {
                    return (get(list, 'purchaseOrders', [])?.length) ? 'Zakupkani tanlang' : 'Mavjud emas'
                }
                updateData(user.currentDataId, { purchaseOrders: [], purchase: false })
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
                `
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)

                if (data[1] == '1') {
                    if (get(list, 'purchaseOrders', []).length) {
                        let setEntry = [...new Set(get(list, 'purchaseOrders', []).map(item => item.DocEntry))]
                        let btnList = setEntry.map(item => get(list, 'purchaseOrders', []).find(el => el.DocEntry == item)).map(item => {
                            return { name: `${item.NumAtCard} - ${item.DocNum}`, id: item.DocEntry }
                        })
                        return await dataConfirmBtnEmp(chat_id, btnList, 1, 'purchase')
                    }
                    return empDynamicBtn()

                }
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "purchase": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 23)
                let setEntry = [...new Set(get(list, 'purchaseOrders', []).map(item => item.DocEntry))]
                let btnList = setEntry.map(item => get(list, 'purchaseOrders', []).find(el => el.DocEntry == item)).map(item => {
                    return { name: `${item.NumAtCard} - ${item.DocNum}`, id: item.DocEntry }
                })
                updateBack(chat_id, { text: `Schetni tanlang`, btn: await dataConfirmBtnEmp(chat_id, btnList, 1, 'purchase'), step: 2301 })
            }

            updateData(user.currentDataId, { purchaseEntry: data[1] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 2301
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
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
    "paginationPurchase": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Zakupkani tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let setEntry = [...new Set(get(list, 'purchaseOrders', []).map(item => item.DocEntry))]
                let btnList = setEntry.map(item => get(list, 'purchaseOrders', []).find(el => el.DocEntry == item)).map(item => {
                    return { name: `${item.NumAtCard} - ${item.DocNum}`, id: item.DocEntry }
                })
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                return await dataConfirmBtnEmp(chat_id, btnList, 1, 'purchase', pagination)
            },
            update: true
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
                let btn = await dataConfirmBtnEmp(chat_id, list.accountList43, 1, 'account')
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `Valyutani tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, [{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency')
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
                let btn = await dataConfirmBtnEmp(chat_id, list.accountList43, 1, 'accountOneStep')
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
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
    "paginationAccounts": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            return get(user, 'user_step') && get(list, 'subMenu') == "Xorijiy xarid to'lovi"
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Schetni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = await dataConfirmBtnEmp(chat_id, list?.accountList43.sort((a, b) => a.id - b.id), 1, 'account', pagination)
                return btn
            },
            update: true
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
                return await dataConfirmBtnEmp(chat_id, list.accountList43, 1, 'accountOneStep', pagination)
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
                let btn = await dataConfirmBtnEmp(chat_id, [{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency')
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `Summani kiriting`
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
                let btn = list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn()
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
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
                let btn = await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point', pagination)
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
                let btn = await dataConfirmBtnEmp(chat_id, list.vendorList, 1, 'partnerSearch', pagination)
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
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
            let btnList = payType50
            let btn = await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
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
                return await dataConfirmBtnEmp(chat_id, account50, 2, 'currency')
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
            let btn = await dataConfirmBtnEmp(chat_id, account50, 2, 'currency')
            updateBack(chat_id, { text: `To'lov usullarini tanlang`, btn, step: 46 })
            let b1Account50 = await b1Controller.getAccount(accounts50[list?.payType][data[1]], true)
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
                return await dataConfirmBtnEmp(chat_id, list?.accountList50?.sort((a, b) => +b.id - +a.id), 1, 'account')
            },
        },
    },
    "paginationAccounts": {
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
                let btn = await dataConfirmBtnEmp(chat_id, list?.accountList50?.sort((a, b) => +b.id - +a.id), 1, 'account', pagination)
                return btn
            },
            update: true
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
                let btn = await dataConfirmBtnEmp(chat_id, list?.accountList50.sort((a, b) => a.id - b.id), 1, 'account')
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `Summani kiriting`
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
                let btn = list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
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
                let btn = await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point')
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
                let info = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return user?.update ? dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id) : 'Statya DDS ni tanlang'

            },
            btn: async ({ chat_id, data }) => {


                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)

                let ddsList = Object.keys(DDS)?.filter(item => DDS[item].includes(+get(list, 'accountCodeOther'))).map((item, i) => {
                    return { name: item, id: i }
                }).length || ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: '(Xodim) Qarz (Xarajat)', id: '-2' }])))
                // let ddsList = get(list, 'documentType') ? Object.keys(DDS)?.filter(item => DDS[item].includes(+get(list, 'accountCodeOther'))).map((item, i) => {
                //     return { name: item, id: i }
                // }) : (get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: '(Xodim) Qarz (Xarajat)', id: '-2' }]))
                updateData(user.currentDataId, { ddsList })
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id,
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
                let btn = await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point')
                updateBack(chat_id, { text: `Hisob nuqtasini tanlang`, btn, step: 51 })
            }
            // updateData(user.currentDataId, { dds: get(list, 'ddsList', []).find((item, i) => i == data[1])?.name })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 52
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let info = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, data }) => {
                return await dataConfirmBtnEmp(chat_id,
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
            let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
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

                return await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
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
                let btn = await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20
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
                let btn = await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount', pagination)
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
                let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
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
                return dataConfirmBtnEmp(chat_id,
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
            if (SubMenu()[data[1]]) {
                let menuList = Menu().map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[item.id]?.length ? '✅' : ''}` }
                })
                if (get(user, 'selectedAdminUserStatus') == 'executor') {
                    menuList = menuList.filter(item => item.id != 4)
                }
                updateStep(chat_id, 703)
                updateBack(chat_id, {
                    text: `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`, btn: await dataConfirmBtnEmp(chat_id, menuList, 1, 'empMenu'), step: 702
                })
            }
            else {
                let menuList = Menu().map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, 'permissonMenuEmp', {})[item.id]?.length ? '✅' : ''}` }
                })

                updateBack(chat_id, {
                    text: `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`, btn: await dataConfirmBtnEmp(chat_id,
                        menuList
                        , 1, 'empMenu'), step: 702
                })
            }

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 702
        },
        next: {
            text: async ({ chat_id, data }) => {

                if (SubMenu()[data[1]]) {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    return `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`
                }
                return "Mavjud emas"

            },
            btn: async ({ chat_id, data }) => {
                if (SubMenu()[data[1]]) {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                    let infPermisson = get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]]?.length ? get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[data[1]] : []
                    return dataConfirmBtnEmp(chat_id, SubMenu()[data[1]].map((item, i) => {
                        return { name: `${item.name} ${infPermisson.includes(`${item.id}`) ? '✅' : ' '}`, id: `${data[1]}#${item.id}` }
                    }), 1, 'subMenu')
                }
                return empDynamicBtn()
            },
        },
    },
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
            updatePermisson(get(user, 'selectedAdminUserChatId'), Object.fromEntries([[selectedUserStatus[get(user, 'selectedAdminUserStatus')], infPermisson]]))
            infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            let menuList = Menu().map(item => {
                return { ...item, name: `${item.name} ${get(infoPermissonData, `${selectedUserStatus[get(user, 'selectedAdminUserStatus')]}`, {})[item.id]?.length ? '✅' : ''}` }
            })
            if (get(user, 'selectedAdminUserStatus') == 'executor') {
                menuList = menuList.filter(item => item.id != 4)
            }
            updateBack(chat_id, {
                text: `${selectedUserStatusUzb[get(user, 'selectedAdminUserStatus')]} uchun menuni tanlang`, btn: await dataConfirmBtnEmp(chat_id, menuList, 1, 'empMenu'), step: 702
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
                return dataConfirmBtnEmp(chat_id, SubMenu()[data[1]].map((item, i) => {
                    return { name: `${item.name} ${infPermisson.includes(`${item.id}`) ? '✅' : ' '}`, id: `${data[1]}#${item.id}` }
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
                let btn = await dataConfirmBtnEmp(chat_id, user.map(item => {
                    return {
                        name: `${item.LastName} ${item.FirstName}`, id: item.chat_id
                    }
                }), 1, 'adminUsers', pagination)
                return btn
            },
            update: true
        },
    },
    "newSubMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = await dataConfirmBtnEmp(chat_id,
                infoMenu()
                , 1, 'newSubMenu')
            updateBack(chat_id, { text: "Menuni tanlang", btn, step: 704 })
            updateUser(chat_id, { user_step: 705, newSubMenu: { menu: data[1] } })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 704
        },
        next: {
            text: async ({ chat_id, data }) => {
                return `Submenu nomini yozing`
            },
            btn: async ({ chat_id, data }) => {
                return empDynamicBtn()
            },
        },
    },
    "confirmAdminSubMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (data[1] == 1) {
                writeSubMenu(
                    {
                        menuId: get(user, 'newSubMenu.menu'),
                        name: get(user, 'newSubMenu.title'),
                        comment: get(user, 'newSubMenu.comment'),
                        update: [
                            {
                                id: 1,
                                name: 'Izoh',
                                message: get(user, 'newSubMenu.comment'),
                                btn: `() => empDynamicBtn()`,
                                step: '13',
                            }
                        ],
                        updateLine: 1,
                        lastStep: 62,
                        infoFn: `({ chat_id, id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                            let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                            return info
                        }`
                    }
                )
            }
            updateUser(chat_id, { user_step: 1, newSubMenu: {} })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 707
        },
        next: {
            text: async ({ chat_id, data }) => {
                return data[1] == 1 ? `Submenu qo'shildi ✅` : `Bekor qilindi ❌`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                return mainMenuByRoles({ chat_id })
            },
        },
    },
    "confirmAdminMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (data[1] == 1) {
                writeMenu(
                    {
                        name: get(user, 'newMenu.title'),
                    }
                )
            }
            updateUser(chat_id, { user_step: 1, newMenu: {} })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step') == 711
        },
        next: {
            text: async ({ chat_id, data }) => {
                return data[1] == 1 ? `Menu qo'shildi ✅` : `Bekor qilindi ❌`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                return mainMenuByRoles({ chat_id })
            },
        },
    },
    "paginationNewSubMenu": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Menuni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = dataConfirmBtnEmp(chat_id,
                    infoMenu()
                    , 1, 'newSubMenu', pagination)
                return btn
            },
            update: true
        },
    },

    "paginationUpdateMenus": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Menuni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = dataConfirmBtnEmp(chat_id,
                    (get(user, 'updatePaginationMenu', 1) == '1' ? infoMenu().map(item => {
                        return { name: item.name, id: `${item.id}#1` }
                    }) : infoSubMenu().map(item => {
                        return { name: item.name, id: `${item.id}#2` }
                    }))
                    , 1, 'updateMenus', pagination)
                return btn
            },
            update: true
        },
    },
    "paginationSelectMenus": {
        selfExecuteFn: ({ chat_id, data }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'user_step')
        },
        next: {
            text: ({ chat_id, data }) => {
                return `Menuni tanlang`
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let pagination = data[1] == 'prev' ? { prev: +data[2] - 10, next: data[2] } : { prev: data[2], next: +data[2] + 10 }
                let btn = dataConfirmBtnEmp(chat_id,
                    infoMenu().map(item => {
                        return { name: item.name, id: `${item.id}` }
                    })
                    , 1, 'selectMenus', pagination)
                return btn
            },
            update: true
        },
    },
    "selectMenus": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = await dataConfirmBtnEmp(chat_id,
                infoAllMenu().map(item => {
                    return { name: item.name, id: `${item.id}` }
                })
                , 1, 'selectMenus')
            updateUser(chat_id, { updatePaginationMenu: 2 })
            updateBack(chat_id, { text: "Menuni tanlang", btn, step: 801 })
        },
        middleware: ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && +user?.user_step == 801
        },
        next: {
            text: ({ chat_id, data }) => {
                let menu = infoSubMenu().filter(item => item.menuId == data[1])
                let mainMenu = infoAllMenu().find(item => item.id == data[1])
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (get(user, 'adminType') == 'delete' && menu?.length == 0) {
                    updateMenu(data[1], { isDelete: true })
                    return `Asosiy Menu O'chirildi ✅`
                }
                // else if (get(user, 'adminType') == 'change' && menu?.length == 0) {
                //     updateMenu(data[1], { status: !mainMenu?.status })
                //     return `Asosiy Menu ${!mainMenu?.status ? 'active qilindi ✅' : 'ne active qilindi ❌'}`
                // }
                return menu?.length ? "Menuni tanlang" : 'Menular mavjud emas'
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                if (get(user, 'adminType') == 'change') {
                    if (infoAllSubMenu().filter(item => item.menuId == data[1]).length) {
                        return dataConfirmBtnEmp(chat_id,
                            infoAllSubMenu().filter(item => item.menuId == data[1]).map(item => {
                                return { name: `${item.name} ${item.status ? '✅' : '❌'}`, id: `${item.id}#2` }
                            })
                            , 1, 'updateMenus')
                    }
                    return mainMenuByRoles({ chat_id })
                }


                if (infoSubMenu().filter(item => item.menuId == data[1]).length) {
                    return dataConfirmBtnEmp(chat_id,
                        infoSubMenu().filter(item => item.menuId == data[1]).map(item => {
                            return { name: item.name, id: `${item.id}#2` }
                        })
                        , 1, 'updateMenus')
                }
                return mainMenuByRoles({ chat_id })
            },
        },
    },
    "updateMenus": {
        selfExecuteFn: async ({ chat_id, data }) => {
            updateStep(chat_id, 802)
            let user = infoUser().find(item => item.chat_id == chat_id)
            let lastBtn = data[2] == '1' ?
                [
                    {
                        name: 'Asosiy Menu nomi',
                        id: `1#1`
                    }
                ] :
                [
                    {
                        name: 'Sub Menu nomi',
                        id: `1#2`
                    },
                    {
                        name: 'Kommentariya',
                        id: `2#2`
                    }
                ]
            let subMenu = (get(user, 'adminType') == 'change' ? infoAllSubMenu() : infoSubMenu()).find(item => item.id == data[1])
            let mainMenu = (get(user, 'adminType') == 'change' ? infoAllMenu() : infoMenu()).find(item => item.id == (data[2] == '1' ? data[1] : get(subMenu, 'menuId', 1)))
            let info = [
                {
                    name: 'Asosiy Menu Nomi',
                    message: get(mainMenu, 'name', '')
                },
                ...(data[2] == '2' ? [
                    {
                        name: 'Sub Menu Nomi',
                        message: get(subMenu, 'name')
                    },
                    {
                        name: 'Kommentariya',
                        message: get(subMenu, 'comment')
                    },
                    {
                        name: "Yaratilagan Sana",
                        message: moment(subMenu?.creationDate).format('LL')
                    }
                ] : [
                    {
                        name: "Yaratilagan Sana",
                        message: moment(mainMenu?.creationDate).format('LL')
                    }
                ]
                )
            ]

            let btn = await dataConfirmBtnEmp(chat_id, lastBtn, 2, 'updateAdminMenu')
            updateUser(chat_id, {
                updateMenu: { menuType: data[2], menuId: data[1], mainMenuId: get(mainMenu, 'id') },
                lastAdminSteps: {
                    btn,
                    text: dataConfirmText(info, `O'zgartirasizmi ?`, chat_id),
                    step: 802
                }
            })
            updateBack(chat_id, {
                text: `Menuni tanlang`, btn: await dataConfirmBtnEmp(chat_id,
                    (get(user, 'adminType') == 'change' ? infoAllMenu() : infoMenu()).map(item => {
                        return { name: item.name, id: `${item.id}` }
                    })
                    , 1, 'selectMenus'), step: 801
            })
        },
        middleware: ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return +user.user_step == 801
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let subMenu = (get(user, 'adminType') == 'change' ? infoAllSubMenu() : infoSubMenu()).find(item => item.id == data[1])
                let mainMenu = (get(user, 'adminType') == 'change' ? infoAllMenu() : infoMenu()).find(item => item.id == (data[2] == '1' ? data[1] : get(subMenu, 'menuId', 1)))
                let info = [
                    {
                        name: 'Asosiy Menu Nomi',
                        message: get(mainMenu, 'name', '')
                    },
                    ...(data[2] == '2' ? [
                        {
                            name: 'Sub Menu Nomi',
                            message: get(subMenu, 'name')
                        },
                        {
                            name: 'Kommentariya',
                            message: get(subMenu, 'comment')
                        },
                        {
                            name: "Yaratilagan Sana",
                            message: moment(subMenu?.creationDate).format('LL')
                        }
                    ] : [
                        {
                            name: "Yaratilagan Sana",
                            message: moment(mainMenu?.creationDate).format('LL')
                        }
                    ]
                    )
                ]
                return dataConfirmText(info, ` ${get(user, 'adminType') == 'update' ? `O'zgartirasizmi` : `Ochirish`}  ?`, chat_id)
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let subMenu = (get(user, 'adminType') == 'change' ? infoAllSubMenu() : infoSubMenu()).find(item => item.id == data[1])

                let btn = []
                if (get(user, 'adminType') == 'update') {
                    btn = data[2] == '1' ?
                        [
                            {
                                name: 'Asosiy Menu nomi',
                                id: `1#1`
                            }
                        ] :
                        [
                            {
                                name: 'Sub Menu nomi',
                                id: `1#2`
                            },
                            {
                                name: 'Kommentariya',
                                id: `2#2`
                            }
                        ]
                } else if (get(user, 'adminType') == 'delete') {
                    btn = [
                        {
                            name: `O'chirish`,
                            id: `1`
                        }
                    ]
                }
                else if (get(user, 'adminType') == 'change') {
                    btn = [
                        {
                            name: `Statusni ${subMenu?.status ? 'ne active' : 'active'} qilish`,
                            id: `${subMenu?.status ? '2' : '1'}`
                        }
                    ]
                }
                return dataConfirmBtnEmp(chat_id, btn, 2, 'updateAdminMenu')
            },
        },
    },
    "updateAdminMenu": {
        selfExecuteFn: async ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (get(user, 'adminType') == 'update') {
                updateStep(chat_id, 803)
                updateUser(chat_id, { updateMenu: { ...get(user, 'updateMenu'), key: data[1] } })
                updateBack(chat_id, { text: user?.lastAdminSteps?.text, btn: get(user, 'lastAdminSteps.btn'), step: get(user, 'lastAdminSteps.step') })
            } else if (get(user, 'adminType') == 'delete') {
                updateSubMenu(get(user, 'updateMenu.menuId', 1), { isDelete: true })
                updateUser(chat_id, { back: [] })
                updateStep(chat_id, 702)
            } else if (get(user, 'adminType') == 'change') {
                updateSubMenu(get(user, 'updateMenu.menuId', 1), { status: data[1] == 1 })
                updateUser(chat_id, { back: [] })
                updateStep(chat_id, 702)
            }
        },
        middleware: ({ chat_id, data }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && +user?.user_step == 802
        },
        next: {
            text: ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (get(user, 'adminType') == 'update') {
                    return data[2] == 2 ? (data[1] == 1 ? 'Sub Menu nomini yozing' : "Kommentariya yozing") : 'Asosiy Menu nomini yozing'
                }
                else if (get(user, 'adminType') == 'delete') {
                    return `Sub Menu o'chirildi ✅`
                }
                else if (get(user, 'adminType') == 'change') {
                    return `Sub Menu ${data[1] == '1' ? 'active' : 'ne active'} qilindi  ✅`
                }
            },
            btn: async ({ chat_id, data }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (get(user, 'adminType') == 'update') {
                    return empDynamicBtn()
                }
                else if (['delete', 'change'].includes(get(user, 'adminType'))) {
                    return mainMenuByRoles({ chat_id })
                }
                return empDynamicBtn()

            },
        },
    },

}

module.exports = {
    xorijiyXaridCallback,
    mahalliyXaridCallback,
    othersCallback,
    adminCallback
}