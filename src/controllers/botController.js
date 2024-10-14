const { get } = require("lodash");
let { bot } = require("../config");
const { SubMenu } = require("../credentials");
const {
    writeUser, infoUser, updateStep, updateUser, deleteAllInvalidData, writePermisson, writeGroup, deleteGroup, infoGroup, infoPermisson, updateData, infoData, sendMessageHelper
} = require("../helpers");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const { option, jobMenu, mainMenuByRoles } = require("../keyboards/keyboards");
const { userInfoText, dataConfirmText, ticketAddText } = require("../keyboards/text");
const { xorijiyXaridCallback, mahalliyXaridCallback, othersCallback, adminCallback } = require("../modules/callback_query");
const { xorijiyXaridStep, mahalliyXaridStep, tolovHarajatStep, adminStep } = require("../modules/step");
const { executeBtn, xorijiyXaridBtn, mahalliyXaridBtn, tolovHarajatBtn, narxChiqarishBtn, boshqaBtn, shartnomaBtn, tolovHarajatBojBtn, adminBtn, newBtnExecuter, updateAdminBtn, deleteAdminBtn, changeStatusAdminBtn, infoAdminBtn, firtBtnExecutor, confirmativeBtn, executorBtn } = require("../modules/text");
const b1Controller = require("./b1Controller");
const jiraController = require("./jiraController");

class botConroller {
    async text(msg, chat_id) {
        try {
            let isGroup = ['group', 'supergroup'].includes(get(msg, 'chat.type', ''))
            let groupChatId = get(msg, 'chat.id')
            if (['group', 'supergroup'].includes(get(msg, 'chat.type', ''))) {
                chat_id = get(msg, 'from.id')
            }
            let user = infoUser().find((item) => item.chat_id === chat_id);
            let btnTree = {
                ...firtBtnExecutor(), ...confirmativeBtn,
                ...executeBtn, ...xorijiyXaridBtn, ...mahalliyXaridBtn, ...tolovHarajatBtn, ...narxChiqarishBtn, ...boshqaBtn, ...shartnomaBtn, ...tolovHarajatBojBtn, ...updateAdminBtn, ...adminBtn, ...deleteAdminBtn, ...changeStatusAdminBtn, ...infoAdminBtn, ...executorBtn, ...newBtnExecuter()
            }
            let stepTree = { ...xorijiyXaridStep, ...mahalliyXaridStep, ...tolovHarajatStep, ...adminStep }
            if (msg.text == "/start") {
                if (['group', 'supergroup'].includes(get(msg, 'chat.type', '')) && !infoGroup().find(item => item.id == get(msg, 'chat.id'))) {
                    writeGroup(get(msg, 'chat', {}))
                    sendMessageHelper(get(msg, 'chat.id'), "Qo'shildi ✅")
                }
                else if (!['group', 'supergroup'].includes(get(msg, 'chat.type', ''))) {
                    sendMessageHelper(
                        chat_id,
                        "Assalomu Aleykum",
                        !get(user, "user_step") ? option : mainMenuByRoles({ chat_id })
                    );
                    if (get(user, "user_step")) {
                        updateUser(chat_id, {
                            back: [], update: false, confirmationStatus: false, waitingUpdateStatus: false,
                            extraWaiting: false,
                            lastFile: { ...get(user, 'lastFile'), currentDataId: '' }
                        })
                        updateStep(chat_id, 1)
                        deleteAllInvalidData({ chat_id })
                    }
                }
            }
            else if (msg.text == '/info') {
                if (user) {
                    let adminText = `ID: ${get(user, 'EmployeeID', 1)}\n${get(user, 'LastName', '')} ${get(user, 'FirstName')}\n\nAdmin`
                    sendMessageHelper(chat_id, get(user, 'JobTitle', '') == 'Admin' ? adminText : userInfoText({ user, chat_id }))
                }
            }
            else if (msg.text == '/delete' && ['group', 'supergroup'].includes(get(msg, 'chat.type', '')) && infoGroup().find(item => item.id == get(msg, 'chat.id'))) {
                deleteGroup(get(msg, 'chat.id'))
                sendMessageHelper(get(msg, 'chat.id'), "O'chirildi ❌")
            }
            else if (
                btnTree[msg.text] && get(user, "user_step", 0) >= 1
            ) {
                let btnTreeList = [firtBtnExecutor(), confirmativeBtn, executeBtn, xorijiyXaridBtn, mahalliyXaridBtn, tolovHarajatBtn, narxChiqarishBtn, boshqaBtn, shartnomaBtn, tolovHarajatBojBtn, adminBtn, updateAdminBtn, deleteAdminBtn, changeStatusAdminBtn, infoAdminBtn, executorBtn, newBtnExecuter()]
                let execute = btnTreeList.find(item => item[msg.text] && item[msg.text]?.middleware({ chat_id, msgText: msg.text, isGroup, groupChatId }))
                execute = execute ? execute[msg.text] : {}
                if (await get(execute, 'middleware', () => { })({ chat_id, msgText: msg.text, isGroup, groupChatId })) {
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, isGroup, groupChatId }) : undefined
                    if (Object.values(get(execute, 'next', {})).length) {

                        let data = {}
                        let textBot = await execute?.next?.text ? await execute?.next?.text({ chat_id, msgText: msg.text, isGroup, groupChatId }) : ''
                        let currentUser = infoUser().find((item) => item.chat_id === chat_id)
                        let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text, isGroup, groupChatId }) : undefined
                        if (get(currentUser, 'update') && !execute?.document) {
                            data = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                        }

                        let botInfo = await execute?.next?.file ? bot.sendDocument((isGroup ? groupChatId : chat_id), await execute?.next?.file({ chat_id }), btnBot) :
                            sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(data, 'file', {}) })
                        let lastMessageId = await botInfo
                        updateUser(chat_id, { lastMessageId: lastMessageId?.message_id })
                    }
                }
            }
            else if (
                stepTree[get(user, 'user_step', '1').toString()]
            ) {
                let execute = stepTree[get(user, 'user_step', '1').toString()]
                if (await get(execute, 'middleware', () => { })({ chat_id, msgText: msg.text, isGroup, groupChatId })) {
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, msgText: msg.text, isGroup, groupChatId }) : undefined
                    if (Object.values(get(execute, 'next', {})).length) {
                        let data = {}
                        let textBot = await execute?.next?.text({ chat_id, msgText: msg.text, isGroup, groupChatId })
                        let currentUser = infoUser().find((item) => item.chat_id === chat_id)
                        let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text, isGroup, groupChatId }) : undefined
                        if (get(currentUser, 'update') && !execute?.document) {
                            data = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                        }

                        let botInfo = await execute?.next?.file ? await bot.sendDocument((isGroup ? groupChatId : chat_id), await execute?.next?.file({ chat_id, msgText: msg.text }), btnBot) :
                            await sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(data, 'file', {}) })
                        updateUser(chat_id, { lastMessageId: botInfo?.message_id })
                    }
                }
            }
        }
        catch (err) {
            throw new Error(err);
        }
    }

    async callback_query(msg, data, chat_id) {
        try {
            let isGroup = ['group', 'supergroup'].includes(get(msg, 'message.chat.type', ''))
            let groupChatId = get(msg, 'message.chat.id')
            if (['group', 'supergroup'].includes(get(msg, 'message.chat.type'))) {
                chat_id = get(msg, 'from.id')
            }
            let user = infoUser().find((item) => item.chat_id === chat_id);
            let callbackTree = { ...xorijiyXaridCallback, ...mahalliyXaridCallback, ...othersCallback, ...adminCallback }
            if (user) {
                if (callbackTree[data[0]]) {
                    let callbackTreeList = [xorijiyXaridCallback, mahalliyXaridCallback, othersCallback, adminCallback]
                    let execute = callbackTreeList.find(item => item[data[0]] && item[data[0]]?.middleware({ chat_id, data, msgText: msg.text, id: get(msg, 'message.message_id', 0), isGroup, groupChatId }))
                    execute = execute ? execute[data[0]] : {}
                    if (get(execute, 'middleware', () => { })({ chat_id, data, msgText: msg.text, id: get(msg, 'message.message_id', 0), isGroup, groupChatId })) {
                        await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, data, isGroup, groupChatId, id: get(msg, 'message.message_id', 0) }) : undefined
                        if (Object.values(get(execute, 'next', {})).length) {
                            let dataInfo = {}
                            let textBot = await execute?.next?.text({ chat_id, data, isGroup, groupChatId })
                            let currentUser = infoUser().find(item => item.chat_id == chat_id)
                            let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg, isGroup, groupChatId }) : undefined
                            if (get(currentUser, 'update') && !execute?.document) {
                                dataInfo = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                            }
                            let botInfo = await execute?.next?.update ?
                                bot.editMessageText(await execute?.next?.text({ chat_id, data }), { chat_id, message_id: +currentUser.lastMessageId, ...(await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg }) : undefined) })
                                : (await execute?.next?.file ? bot.sendDocument(chat_id, await execute?.next?.file({ chat_id, data }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg }) : undefined) :
                                    sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(dataInfo, 'file', {}) }))
                            let botId = await botInfo
                            updateUser(chat_id, { lastMessageId: botId.message_id })
                        }
                    }
                }
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    async contact(msg, chat_id) {
        try {
            let phone = get(msg, "contact.phone_number", "").replace(/\D/g, "");
            let deleteMessage = await sendMessageHelper(chat_id, 'Loading...')
            let sap_user = await b1Controller.getEmpInfo(phone);
            if (get(sap_user, "status") && get(sap_user, "data.value")?.length) {
                writeUser({
                    ...get(sap_user, "data.value[0]", {}),
                    chat_id,
                    is_active: true,
                    user_step: 1,
                    back: []
                });
                if (!infoPermisson().find(el => el.chat_id == chat_id)) {
                    writePermisson({
                        chat_id
                    })
                }
                bot.deleteMessage(chat_id, deleteMessage.message_id)
                sendMessageHelper(
                    chat_id,
                    "Foydalanuvchi tasdiqlandi ✅",
                    mainMenuByRoles({ chat_id })
                );
            } else {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
                sendMessageHelper(chat_id, "Foydalanuvchi tasdiqlanmadi ❌", option);
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    async sendDocument(chat_id, dataId) {
        let user = infoUser().find(item => item.chat_id == chat_id)
        let list = infoData().find(item => item.id == dataId)
        let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: dataId })
        let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
        let file = get(list, 'file', {})

        let newText = `${'🔵'.repeat(10)}\n`
        updateData(dataId, { executor: { chat_id, status: true }, stateTime: { ...list.stateTime, executor: { status: true, date: new Date() } } })
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
        let executorList = infoPermisson().filter(item => get(get(item, 'permissonMenuExecutor', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
        let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajardi ✅ ID:${list.ID}`
        for (let i = 0; i < executorList.length; i++) {
            sendMessageHelper(executorList[i], newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })
        }

        let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)

        for (let i = 0; i < confirmativeList.length; i++) {
            sendMessageHelper(confirmativeList[i], newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })
        }

        sendMessageHelper(list.chat_id, newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })

        // group

        let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
        let subMenuIdGroup = SubMenu()[get(list, 'menu')]?.find(item => item.name == get(list, 'subMenu'))
        let specialGroup = groups.filter(item => get(item, 'permissions', {})[get(list, 'menu')].find(el => el == get(subMenuIdGroup, 'id', 0)))

        for (let i = 0; i < specialGroup.length; i++) {
            sendMessageHelper(specialGroup[i].id, newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') }).then((data) => {
            }).catch(e => {
                if (get(e, 'response.body.error_code') == 403) {
                    deleteGroup(specialGroup[i].id)
                }
            })
        }

        bot.sendMessage(chat_id, str || 'Bajarildi ✅')
        return
    }

    async helperDocument(chat_id, dataId) {
        let user = infoUser().find(item => item.chat_id == chat_id)
        let list = infoData().find(item => item.id == dataId)
        let cred = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
        let deleteMessage = sendMessageHelper(chat_id, `Loading...`)
        let count = 0;

        let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajardi ✅ ID:${list.ID}`
        let dataInfo = dataConfirmText(cred.infoFn({ chat_id: list.chat_id, id: list.id }), text, chat_id)
        if (get(cred, 'jira')) {
            let statusObj = await jiraController.jiraIntegrationResultObj({ list, cred, dataInfo })
            updateData(list.id, { ticketAdd: true, ticketStatusObj: statusObj, jira: false })
            count += 1
            if (count == 2) {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
            }
        }
        if (get(cred, 'b1.status')) {
            let b1MainStatus = await b1Controller.executePayments({ list, cred, dataInfo })
            updateData(list.id, { sapB1: false, sap: b1MainStatus?.status, sapErrorMessage: b1MainStatus?.message })
            count += 1
            if (count == 2) {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
            }
        }

        await this.sendDocument(chat_id, dataId)
    }

    async document(msg, chat_id) {
        try {
            console.log(msg, chat_id)
            let file = get(msg, 'document', {})
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (get(user, 'lastFile.currentDataId')) {
                updateData(get(user, 'lastFile.currentDataId'), { lastFile: { file } })
                await this.helperDocument(chat_id, get(user, 'lastFile.currentDataId'))
                return
            }
            let list = infoData().find(item => item.id == user?.currentDataId)
            if (get(list, 'file.active')) {
                updateData(get(list, 'id'), { file: { active: false, send: true, document: file } })
                let info = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                let button = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: 'Ha', callback_data: 'confirmEmp#1' },
                                { text: 'Bekor qilish', callback_data: 'confirmEmp#2' }
                            ],
                            [
                                { text: "O'zgartirish", callback_data: 'confirmEmp#3' },
                            ]
                        ]
                    }
                };
                if (get(user, 'waitingUpdateStatus')) {
                    button = {}
                }
                let botInfo = await bot.sendDocument(chat_id, get(file, 'file_id'), {
                    caption: dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id),
                    reply_markup: button?.reply_markup
                })
                updateUser(chat_id, { lastMessageId: botInfo.message_id })
                return
            }
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = new botConroller();


