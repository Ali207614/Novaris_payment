const { get } = require("lodash");
let { bot } = require("../config");
const {
    writeUser, infoUser, updateStep, updateUser, deleteAllInvalidData
} = require("../helpers");
const { option, jobMenu } = require("../keyboards/keyboards");
const { xorijiyXaridCallback, mahalliyXaridCallback, othersCallback } = require("../modules/callback_query");
const { xorijiyXaridStep, mahalliyXaridStep, tolovHarajatStep } = require("../modules/step");
const { executeBtn, xorijiyXaridBtn, mahalliyXaridBtn, tolovHarajatBtn, narxChiqarishBtn, boshqaBtn, shartnomaBtn } = require("../modules/text");
const b1Controller = require("./b1Controller");

class botConroller {
    async text(msg, chat_id) {
        try {
            let user = infoUser().find((item) => item.chat_id === chat_id);
            let btnTree = {
                ...executeBtn, ...xorijiyXaridBtn, ...mahalliyXaridBtn, ...tolovHarajatBtn, ...narxChiqarishBtn, ...boshqaBtn, ...shartnomaBtn
            }
            let stepTree = { ...xorijiyXaridStep, ...mahalliyXaridStep, ...tolovHarajatStep }

            if (msg.text == "/start") {
                bot.sendMessage(
                    chat_id,
                    "Assalomu Aleykum",
                    !get(user, "user_step") ? option : jobMenu[user.JobTitle]
                );
                if (get(user, "user_step")) {
                    updateUser(chat_id, { back: [], update: false })
                    updateStep(chat_id, 1)
                    deleteAllInvalidData({ chat_id })
                }
            }
            else if (
                btnTree[msg.text] && get(user, "user_step", 0) >= 1
            ) {
                let btnTreeList = [executeBtn, xorijiyXaridBtn, mahalliyXaridBtn, tolovHarajatBtn, narxChiqarishBtn, boshqaBtn, shartnomaBtn]
                let execute = btnTreeList.find(item => item[msg.text] && item[msg.text]?.middleware({ chat_id, msgText: msg.text }))
                execute = execute ? execute[msg.text] : {}
                if (get(execute, 'middleware', () => { })({ chat_id })) {
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id }) : undefined
                    if (execute?.next) {
                        let botInfo = await execute?.next?.file ? bot.sendDocument(chat_id, await execute?.next?.file({ chat_id }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text }) : undefined) :
                            bot.sendMessage(chat_id, await execute?.next?.text({ chat_id, msgText: msg.text }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text }) : undefined)
                        let lastMessageId = await botInfo
                        updateUser(chat_id, { lastMessageId: lastMessageId.message_id })
                    }
                }
            }
            else if (
                stepTree[get(user, 'user_step', '1').toString()]
            ) {
                let execute = stepTree[get(user, 'user_step', '1').toString()]
                if (get(execute, 'middleware', () => { })({ chat_id })) {
                    await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, msgText: msg.text }) : undefined
                    if (execute?.next) {
                        let botInfo = await execute?.next?.file ? await bot.sendDocument(chat_id, await execute?.next?.file({ chat_id, msgText: msg.text }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text }) : undefined) :
                            await bot.sendMessage(chat_id, await execute?.next?.text({ chat_id, msgText: msg.text }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, msgText: msg.text }) : undefined)
                        updateUser(chat_id, { lastMessageId: botInfo.message_id })
                    }
                }
            }
        }
        catch (err) {
            console.log(err)
            throw new Error(err);
        }
    }

    async callback_query(msg, data, chat_id) {
        try {
            let user = infoUser().find((item) => item.chat_id === chat_id);
            let callbackTree = { ...xorijiyXaridCallback, ...mahalliyXaridCallback, ...othersCallback }
            if (user) {
                if (callbackTree[data[0]]) {
                    let callbackTreeList = [xorijiyXaridCallback, mahalliyXaridCallback, othersCallback]
                    let execute = callbackTreeList.find(item => item[data[0]] && item[data[0]]?.middleware({ chat_id, msgText: msg.text, id: get(msg, 'message.message_id', 0) }))
                    execute = execute ? execute[data[0]] : {}
                    if (get(execute, 'middleware', () => { })({ chat_id, msgText: msg.text, id: get(msg, 'message.message_id', 0) })) {
                        await execute?.selfExecuteFn ? await execute.selfExecuteFn({ chat_id, data }) : undefined
                        if (execute?.next) {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let botInfo = await execute?.next?.update ? bot.editMessageText(await execute?.next?.text({ chat_id, data }), { chat_id, message_id: +user.lastMessageId, ...(await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data }) : undefined) }) : (await execute?.next?.file ? bot.sendDocument(chat_id, await execute?.next?.file({ chat_id, data }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data }) : undefined) :
                                bot.sendMessage(chat_id, await execute?.next?.text({ chat_id, data }), await execute?.next?.btn ? await execute?.next?.btn({ chat_id, data }) : undefined))
                            let botId = await botInfo
                            updateUser(chat_id, { lastMessageId: botId.message_id })
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err)
            throw new Error(err);
        }
    }

    async contact(msg, chat_id) {
        try {
            let phone = get(msg, "contact.phone_number", "").replace(/\D/g, "");
            let deleteMessage = await bot.sendMessage(chat_id, 'Loading...')
            let sap_user = await b1Controller.getEmpInfo(phone);
            if (get(sap_user, "status") && get(sap_user, "data.value")?.length) {
                writeUser({
                    ...get(sap_user, "data.value[0]", {}),
                    chat_id,
                    is_active: true,
                    user_step: 1,
                });
                bot.deleteMessage(chat_id, deleteMessage.message_id)
                bot.sendMessage(
                    chat_id,
                    "Foydalanuvchi tasdiqlandi ✅",
                    jobMenu[get(sap_user, "data.value[0].JobTitle", {})]
                );
            } else {
                bot.deleteMessage(chat_id, deleteMessage.message_id)
                bot.sendMessage(chat_id, "Foydalanuvchi tasdiqlanmadi ❌", option);
            }
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = new botConroller();


