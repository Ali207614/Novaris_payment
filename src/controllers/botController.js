const { get } = require("lodash");
let { bot } = require("../config");
const { Menu, SubMenu } = require("../credentials");
const {
    writeUser, infoUser, updateStep, updateUser, updateBack, deleteAllInvalidData, writePermisson, writeGroup, deleteGroup, infoGroup, infoPermisson, updateData, writeData, infoData, sendMessageHelper
} = require("../helpers");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const { option, jobMenu, mainMenuByRoles } = require("../keyboards/keyboards");
const { userInfoText, dataConfirmText, ticketAddText } = require("../keyboards/text");
const { xorijiyXaridCallback, mahalliyXaridCallback, othersCallback, adminCallback } = require("../modules/callback_query");
const { xorijiyXaridStep, mahalliyXaridStep, tolovHarajatStep, adminStep } = require("../modules/step");
const { executeBtn, xorijiyXaridBtn, mahalliyXaridBtn, tolovHarajatBtn, narxChiqarishBtn, boshqaBtn, shartnomaBtn, tolovHarajatBojBtn, adminBtn, newBtnExecuter, updateAdminBtn, deleteAdminBtn, changeStatusAdminBtn, infoAdminBtn, firtBtnExecutor, confirmativeBtn, executorBtn } = require("../modules/text");
const verifixController = require("./verifixController");
const financialDbController = require("./financialDbController");
const jiraController = require("./jiraController");
const { CUSTOMER_SEARCH_STEP, shouldAskCustomer } = require("../helpers/customerSelection");
const loggerService = require("../services/loggerService");
const { permissionChatIds, hasPermissionOrAdmin, isAdminUser } = require("../helpers/adminPermissions");
const { findSubMenuForRequest, getSubMenuIdForRequest } = require("../helpers/subMenuResolver");
const { syncVerifixAttendanceForRequest } = require("../helpers/verifixAttendance");
const { runMessageBackFlow } = require("../helpers/messageBackFlow");
const ShortUniqueId = require("short-unique-id");

const { randomUUID } = new ShortUniqueId({ length: 10 });

const CONTACT_AUTH_PROMPT = "Telefon raqamingizni faqat pastdagi tugma orqali ulashing. Qo'lda yozilgan raqam yoki boshqa kontaktlar qabul qilinmaydi.";
const FOREIGN_CONTACT_BLOCK_MESSAGE = "Faqat o'zingizning Telegram kontakt raqamingizni ulashing. Boshqa odamning kontakti orqali tasdiqlash mumkin emas ❌";

const syncExecutorVerifixAttendance = async ({ list = {}, executorChatId }) => {
    const requester = infoUser().find(item => item.chat_id == get(list, 'chat_id'));
    const result = await syncVerifixAttendanceForRequest({
        request: list,
        requester,
        verifixController
    });

    if (!result.skipped) {
        updateData(get(list, 'id'), {
            verifixAttendance: {
                status: Boolean(result.status),
                message: result.message,
                created: result.created || 0,
                duplicateSkipped: result.duplicateSkipped || 0,
                executorChatId,
                syncedAt: result.status ? new Date() : undefined
            }
        });
    }

    return result;
};

class botConroller {
    isOwnSharedContact(msg) {
        const senderId = get(msg, "from.id");
        const contactUserId = get(msg, "contact.user_id");

        return Boolean(senderId && contactUserId && Number(senderId) === Number(contactUserId));
    }

    async messageBackFlow({ msgText, chat_id, isGroup, groupChatId, user }) {
        return runMessageBackFlow({
            msgText,
            chat_id,
            isGroup,
            groupChatId,
            user,
            Menu,
            SubMenu,
            infoPermisson,
            infoData,
            updateUser,
            updateStep,
            updateBack,
            updateData,
            writeData,
            sendMessageHelper,
            randomId: randomUUID
        });
    }

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
            
            // Log every text message
            loggerService.logBotAction(msg, 'TEXT_MESSAGE', { type: 'text', id: null }, { after: { text: msg.text } });

            if (user && get(user, 'is_active') === false) {
                await loggerService.logBotAction(msg, 'INACTIVE_USER_BLOCKED', { type: 'user_auth' }, {}, {
                    chatId: chat_id,
                    groupChatId: isGroup ? groupChatId : undefined
                });
                sendMessageHelper(
                    isGroup ? groupChatId : chat_id,
                    "Profilingiz aktiv emas. Admin bilan bog'laning."
                );
                return;
            }

            if (msg.text == "/start") {
                loggerService.logBotAction(msg, 'COMMAND_START');

                if (['group', 'supergroup'].includes(get(msg, 'chat.type', '')) && !infoGroup().find(item => item.id == get(msg, 'chat.id'))) {
                    writeGroup(get(msg, 'chat', {}))
                    sendMessageHelper(get(msg, 'chat.id'), "Qo'shildi ✅")
                }
                else if (!['group', 'supergroup'].includes(get(msg, 'chat.type', ''))) {
                    sendMessageHelper(
                        chat_id,
                        !get(user, "user_step")
                            ? `Assalomu Aleykum. ${CONTACT_AUTH_PROMPT}`
                            : "Assalomu Aleykum",
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
            else if (!get(user, "user_step") && /^\+?\d{7,15}$/.test(msg.text)) {
                await loggerService.logBotAction(msg, 'CONTACT_AUTH_BLOCKED_MANUAL_PHONE', { type: 'user_auth' });
                sendMessageHelper(chat_id, CONTACT_AUTH_PROMPT, option);
            }
            else if (!isGroup && !get(user, "user_step") && msg.text && !msg.text.startsWith('/')) {
                sendMessageHelper(chat_id, CONTACT_AUTH_PROMPT, option);
            }
            else if (msg.text == '/info') {
                if (user) {
                    let adminText = `ID: ${get(user, 'EmployeeID', 1)}\n${get(user, 'LastName', '')} ${get(user, 'FirstName')}\n\nAdmin`
                    sendMessageHelper(chat_id, isAdminUser(user) ? adminText : userInfoText({ user, chat_id }))
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
                let execute = btnTreeList.find(item => item[msg.text] && item[msg.text]?.middleware({ chat_id, msgText: msg.text, isGroup, groupChatId, user }))
                execute = execute ? execute[msg.text] : {}
                let handled = false
                if (await get(execute, 'middleware', () => { })({ chat_id, msgText: msg.text, isGroup, groupChatId, user })) {
                    handled = true
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, isGroup, groupChatId, user }) : undefined
                    let userAfterExecute = infoUser().find((item) => item.chat_id === chat_id);
                    let dataAfterExecute = infoData().find(item => get(item, 'id') == get(userAfterExecute, 'currentDataId'))
                    if (!get(userAfterExecute, 'update') && get(userAfterExecute, 'user_step') == 61 && shouldAskCustomer(dataAfterExecute)) {
                        updateStep(chat_id, CUSTOMER_SEARCH_STEP)
                    }
                    if (Object.values(get(execute, 'next', {})).length) {
                        let user = infoUser().find((item) => item.chat_id === chat_id);

                        let data = {}
                        let textBot = await execute?.next?.text ? await execute?.next?.text({ chat_id, msgText: msg.text, isGroup, groupChatId, user }) : ''
                        let currentUser = infoUser().find((item) => item.chat_id === chat_id)
                        let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text, isGroup, groupChatId, user }) : undefined
                        if (get(currentUser, 'update') && !execute?.document) {
                            data = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                        }

                        let botInfo = await execute?.next?.file ? bot.sendDocument((isGroup ? groupChatId : chat_id), await execute?.next?.file({ chat_id }), btnBot) :
                            sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(data, 'file', {}) })
                        let lastMessageId = await botInfo
                        updateUser(chat_id, { lastMessageId: lastMessageId?.message_id })
                    }
                }
                if (!handled) {
                    await this.messageBackFlow({ msgText: msg.text, chat_id, isGroup, groupChatId, user })
                }
            }
            else if (
                stepTree[get(user, 'user_step', '1').toString()]
            ) {
                let execute = stepTree[get(user, 'user_step', '1').toString()]
                let handled = false
                if (await get(execute, 'middleware', () => { })({ chat_id, msgText: msg.text, isGroup, groupChatId, user })) {
                    handled = true
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, msgText: msg.text, isGroup, groupChatId, user }) : undefined

                    if (Object.values(get(execute, 'next', {})).length) {
                        let user = infoUser().find((item) => item.chat_id === chat_id);

                        let data = {}
                        let textBot = await execute?.next?.text({ chat_id, msgText: msg.text, isGroup, groupChatId, user })
                        let currentUser = infoUser().find((item) => item.chat_id === chat_id)
                        let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text, isGroup, groupChatId, user }) : undefined
                        if (get(currentUser, 'update') && !execute?.document) {
                            data = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                        }

                        let botInfo = await execute?.next?.file ? await bot.sendDocument((isGroup ? groupChatId : chat_id), await execute?.next?.file({ chat_id, msgText: msg.text }), btnBot) :
                            await sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(data, 'file', {}) })
                        updateUser(chat_id, { lastMessageId: botInfo?.message_id })
                    }
                }
                if (!handled) {
                    await this.messageBackFlow({ msgText: msg.text, chat_id, isGroup, groupChatId, user })
                }
            }
            else {
                await this.messageBackFlow({ msgText: msg.text, chat_id, isGroup, groupChatId, user })
            }
        }
        catch (err) {
            console.log(err, ' bu err')
            throw new Error(err);
        }
    }

    async callback_query(msg, data, chat_id) {
        try {
            loggerService.logBotAction(msg.message, 'CALLBACK_QUERY', { type: 'callback', id: msg.id }, { after: { data: data.join('#') } });
            let isGroup = ['group', 'supergroup'].includes(get(msg, 'message.chat.type', ''))
            let groupChatId = get(msg, 'message.chat.id')
            if (['group', 'supergroup'].includes(get(msg, 'message.chat.type'))) {
                chat_id = get(msg, 'from.id')
            }
            let user = infoUser().find((item) => item.chat_id === chat_id);
            let callbackTree = { ...xorijiyXaridCallback, ...mahalliyXaridCallback, ...othersCallback, ...adminCallback }
            if (user && get(user, 'is_active') === false) {
                await loggerService.logBotAction(msg.message, 'INACTIVE_USER_CALLBACK_BLOCKED', { type: 'user_auth' }, {}, {
                    chatId: chat_id,
                    groupChatId: isGroup ? groupChatId : undefined
                });
                sendMessageHelper(
                    isGroup ? groupChatId : chat_id,
                    "Profilingiz aktiv emas. Admin bilan bog'laning."
                );
                return;
            }
            if (user) {
                if (callbackTree[data[0]]) {
                    let callbackTreeList = [xorijiyXaridCallback, mahalliyXaridCallback, othersCallback, adminCallback]
                    let execute = callbackTreeList.find(item => item[data[0]] && item[data[0]]?.middleware({ chat_id, data, msgText: msg.text, id: get(msg, 'message.message_id', 0), isGroup, groupChatId, user }))
                    execute = execute ? execute[data[0]] : {}
                    if (get(execute, 'middleware', () => { })({ chat_id, data, msgText: msg.text, id: get(msg, 'message.message_id', 0), isGroup, groupChatId, user })) {
                        await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, data, isGroup, groupChatId, id: get(msg, 'message.message_id', 0), user }) : undefined
                        if (Object.values(get(execute, 'next', {})).length) {
                            let dataInfo = {}
                            let currentUser = infoUser().find(item => item.chat_id == chat_id)
                            let textBot = await execute?.next?.text({ chat_id, data, isGroup, groupChatId, user: currentUser })
                            let btnBot = await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg, isGroup, groupChatId, user: currentUser }) : undefined
                            if (get(currentUser, 'update') && !execute?.document) {
                                dataInfo = infoData().find(item => get(item, 'id') == get(currentUser, 'currentDataId'))
                            }
                            let botInfo = await execute?.next?.update ?
                                bot.editMessageText(await execute?.next?.text({ chat_id, data, user }), { chat_id, message_id: +currentUser.lastMessageId, ...(await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg, user }) : undefined) })
                                : (await execute?.next?.file ? bot.sendDocument((isGroup ? groupChatId : chat_id), await execute?.next?.file({ chat_id, data, user }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data, msg, user }) : undefined) :
                                    sendMessageHelper((isGroup ? groupChatId : chat_id), textBot, btnBot, { file: get(dataInfo, 'file', {}) }))
                            let botId = await botInfo

                            updateUser(chat_id, { lastMessageId: botId.message_id })
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err, ' bu err')
            throw new Error(err);
        }
    }

    async contact(msg, chat_id) {
        try {
            let phone = get(msg, "contact.phone_number", "").replace(/\D/g, "");
            const phoneLast4 = phone.slice(-4);

            if (!this.isOwnSharedContact(msg)) {
                await loggerService.logBotAction(msg, 'CONTACT_AUTH_BLOCKED_FOREIGN_CONTACT', { type: 'user_auth' }, {}, {
                    senderId: get(msg, 'from.id'),
                    contactUserId: get(msg, 'contact.user_id', null),
                    phoneLast4
                });
                sendMessageHelper(chat_id, FOREIGN_CONTACT_BLOCK_MESSAGE, option);
                return;
            }

            let deleteMessage = await sendMessageHelper(chat_id, 'Loading...')
            await loggerService.logBotAction(msg, 'CONTACT_VERIFIX_AUTH_START', { type: 'user_auth' }, {}, { phoneLast4 });
            
            let verifix_user = await verifixController.getEmpInfo(phone);
            let final_user = null;

            if (get(verifix_user, "status") && get(verifix_user, "data.value")?.length) {
                final_user = get(verifix_user, "data.value[0]", {});
            } else if (!get(verifix_user, "status")) {
                await loggerService.logError(new Error(get(verifix_user, 'message', 'Verifix employee lookup failed')), {
                    source: 'verifix_sync',
                    action: 'VERIFIX_EMPLOYEE_LOOKUP_FAILURE',
                    actor: { chatId: chat_id, role: 'user' },
                    entity: { type: 'user_auth' },
                    metadata: { phoneLast4 }
                });
            }

            if (final_user) {
                writeUser({
                    ...final_user,
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
                await loggerService.logBotAction(msg, 'CONTACT_VERIFIX_AUTH_SUCCESS', { type: 'user_auth' }, {
                    after: {
                        employeeId: get(final_user, 'EmployeeID')
                    }
                }, { phoneLast4 });
                sendMessageHelper(
                    chat_id,
                    "Foydalanuvchi tasdiqlandi ✅",
                    mainMenuByRoles({ chat_id })
                );
            } else {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
                await loggerService.logBotAction(msg, 'CONTACT_VERIFIX_AUTH_NOT_FOUND', { type: 'user_auth' }, {}, { phoneLast4 });
                sendMessageHelper(chat_id, "Foydalanuvchi tasdiqlanmadi ❌", option);
            }
        } catch (err) {
            loggerService.logError(err, {
                source: 'telegram_bot',
                action: 'CONTACT_VERIFIX_AUTH_ERROR',
                actor: { chatId: chat_id, role: 'user' },
                entity: { type: 'user_auth' }
            });
            throw new Error(err);
        }
    }

    async sendDocument(chat_id, dataId) {
        let user = infoUser().find(item => item.chat_id == chat_id)
        let list = infoData().find(item => item.id == dataId)
        const attendanceResult = await syncExecutorVerifixAttendance({ list, executorChatId: chat_id });
        if (!attendanceResult.status) {
            await sendMessageHelper(chat_id, `Verifixga vaqt qo'shilmadi ❌\n${attendanceResult.message}\n\nSo'rov bajarilgan deb belgilanmadi. Ma'lumotni to'g'rilab qayta urinib ko'ring.`)
            return
        }

        let requestSubMenu = findSubMenuForRequest(SubMenu(), list, 1)
        let info = requestSubMenu.infoFn({ chat_id: list.chat_id, id: dataId })
        let subMenuId = requestSubMenu?.id
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
        let executorList = permissionChatIds({
            users: infoUser(),
            permissions: infoPermisson(),
            permissionKey: 'permissonMenuExecutor',
            menuId: get(list, 'menu'),
            subMenuId
        })
        let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajardi ✅ ID:${list.ID}`
        for (let i = 0; i < executorList.length; i++) {
            sendMessageHelper(executorList[i], newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })
        }

        let confirmativeList = permissionChatIds({
            users: infoUser(),
            permissions: infoPermisson(),
            permissionKey: 'permissonMenuAffirmative',
            menuId: get(list, 'menu'),
            subMenuId
        })

        for (let i = 0; i < confirmativeList.length; i++) {
            sendMessageHelper(confirmativeList[i], newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })
        }

        sendMessageHelper(list.chat_id, newText + dataConfirmText(info, text, chat_id), { file }, { lastFile: get(list, 'lastFile') })

        // group

        let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
        let subMenuIdGroup = findSubMenuForRequest(SubMenu(), list)
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
        let cred = findSubMenuForRequest(SubMenu(), list, 1)
        let deleteMessage = await sendMessageHelper(chat_id, `Loading...`)
        let count = 0;

        let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajardi ✅ ID:${list.ID}`
        let dataInfo = dataConfirmText(cred.infoFn({ chat_id: list.chat_id, id: list.id }), text, chat_id)
        if (get(cred, 'jira') && get(list, 'ticket')) {
            let statusObj = await jiraController.jiraIntegrationResultObj({ list, cred, dataInfo })
            updateData(list.id, { ticketAdd: true, ticketStatusObj: statusObj, jira: false })
            count += 1
            if (count == 2) {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
            }
        }
        if (get(cred, 'b1.status')) {
            let b1MainStatus = await financialDbController.executePayments({ list, cred, dataInfo })
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
            loggerService.logBotAction(msg, 'DOCUMENT_UPLOAD', { type: 'document', id: msg.document?.file_id }, { after: { fileName: msg.document?.file_name } });
            let isGroup = ['group', 'supergroup'].includes(get(msg, 'chat.type', ''))
            let groupChatId = get(msg, 'chat.id')
            if (['group', 'supergroup'].includes(get(msg, 'chat.type'))) {
                chat_id = get(msg, 'from.id')
            }

            let file = get(msg, 'document', {})
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (get(user, 'lastFile.currentDataId')) {
                let list = infoData().find(item => item.id == get(user, 'lastFile.currentDataId'))
                if (get(list, 'executor')) {
                    return
                }
                if (isGroup) {
                    let subMenuId = getSubMenuIdForRequest(SubMenu(), list, 1)
                    if (!hasPermissionOrAdmin({
                        users: infoUser(),
                        permissions: infoPermisson(),
                        chat_id,
                        permissionKey: 'permissonMenuExecutor',
                        menuId: get(list, 'menu'),
                        subMenuId
                    })) {
                        bot.sendMessage(groupChatId, 'Mumkin emas ❌')
                        return
                    }
                }
                updateData(get(user, 'lastFile.currentDataId'), { lastFile: { file } })
                await this.helperDocument(chat_id, get(user, 'lastFile.currentDataId'))
                return
            }
            let list = infoData().find(item => item.id == user?.currentDataId)
            if (get(list, 'file.active')) {
                updateData(get(list, 'id'), { file: { active: false, send: true, document: file } })
                let info = findSubMenuForRequest(SubMenu(), list, 2).infoFn({ chat_id })
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
                let botInfo = await sendMessageHelper(
                    chat_id,
                    dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id),
                    button,
                    { file: { send: true, document: file } }
                )
                updateUser(chat_id, { lastMessageId: botInfo.message_id })
                return
            }
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = new botConroller();
