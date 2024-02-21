const { get, isEmpty } = require("lodash");
let { SubMenu, accounts, accounts50, Menu } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData, infoPermisson, infoMenu, infoSubMenu, infoAllMenu } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { empKeyboard, adminKeyboard, jobMenu, mainMenuByRoles, affirmativeKeyboard, executorKeyboard } = require("../keyboards/keyboards");
const ShortUniqueId = require('short-unique-id');
const { randomUUID } = new ShortUniqueId({ length: 10 });
const { dataConfirmText, adminMenusInfo } = require("../keyboards/text");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const b1Controller = require("../controllers/b1Controller");
const { bot } = require("../config");


let firtBtnExecutor = () => {
    let newBtnMenu = {}
    let menuList = ['Tasdiqlovchi', 'Bajaruvchi', 'Xodim']
    for (let i = 0; i < menuList.length; i++) {
        let item = menuList[i]
        newBtnMenu[item] = {
            selfExecuteFn: ({ chat_id, }) => {
                updateStep(chat_id, 2)
                updateUser(chat_id, { currentUserRole: menuList[i] })
                updateBack(chat_id, { text: "Assalomu Aleykum", btn: mainMenuByRoles({ chat_id }), step: 1 })
            },
            middleware: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                return user.user_step
            },
            next: {
                text: ({ chat_id }) => {
                    return item
                },
                btn: async ({ chat_id, }) => {
                    return jobMenu[item]
                },
            },
        }
    }
    return newBtnMenu
}

let confirmativeBtn = {
    "Tasdiqlanmagan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let permission = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonMenuAffirmative = Object.fromEntries(Object.entries(get(permission, 'permissonMenuAffirmative', {})).map(item => {
                    return [item[0], item[1].map(el => SubMenu()[item[0]].find(s => s.id == el).name)]
                }))
                let mainData = infoData().filter(item => item?.full
                    && !get(item, 'confirmative')
                    && (permissonMenuAffirmative[item.menu] ? permissonMenuAffirmative[item.menu].includes(item?.subMenu) : false)
                )
                if (!permissonMenuAffirmative) {
                    return 'Mavjud emas'
                }

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlanmagan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        let btn = mainData[i].chat_id != chat_id ? (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmConfirmative')) : undefined
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), btn)
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                let permission = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonMenuAffirmative = Object.fromEntries(Object.entries(get(permission, 'permissonMenuAffirmative', {})).map(item => {
                    return [item[0], item[1].map(el => SubMenu()[item[0]].find(s => s.id == el).name)]
                }))
                let mainData = infoData().filter(item => item?.full
                    && !get(item, 'confirmative')
                    && (permissonMenuAffirmative[item.menu] ? permissonMenuAffirmative[item.menu].includes(item?.subMenu) : false)
                )
                if (!permissonMenuAffirmative) {
                    return empDynamicBtn()
                }
                if (mainData.length) {
                    let btn = mainData[0].chat_id != chat_id ? (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[0].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[0].id}` }], 2, 'confirmConfirmative')) : undefined
                    return btn
                }
                return empDynamicBtn()
            },
        },
    },
    "Tasdiqlanib , bajarilmagan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executer.status') == false)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlanib , bajarilmagan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Tasdiqlanib , bajarilishi kutilayotgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && !item.executer)

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlanib, bajarilishi kutilayotgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') == false)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Rad etilgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executer.status'))

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Bajarilgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}


let executorBtn = {
    "Bajarilmagan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let permission = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonMenuExecutor = Object.fromEntries(Object.entries(get(permission, 'permissonMenuExecutor', {})).map(item => {
                    return [item[0], item[1].map(el => SubMenu()[item[0]].find(s => s.id == el).name)]
                }))
                let mainData = infoData().filter(item => item?.full
                    && get(item, 'confirmative.status') && !get(item, 'executer')
                    && (permissonMenuExecutor[item.menu] ? permissonMenuExecutor[item.menu].includes(item?.subMenu) : false)
                )
                if (!permissonMenuExecutor) {
                    return 'Mavjud emas'
                }

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Bajarilmagan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmExecuter'))
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), btn)
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                let permission = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonMenuExecutor = Object.fromEntries(Object.entries(get(permission, 'permissonMenuExecutor', {})).map(item => {
                    return [item[0], item[1].map(el => SubMenu()[item[0]].find(s => s.id == el).name)]
                }))
                let mainData = infoData().filter(item => item?.full
                    && get(item, 'confirmative.status') && !get(item, 'executer')
                    && (permissonMenuExecutor[item.menu] ? permissonMenuExecutor[item.menu].includes(item?.subMenu) : false)
                )
                if (!permissonMenuExecutor) {
                    return empDynamicBtn()
                }
                if (mainData.length) {
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[0].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[0].id}` }], 2, 'confirmExecuter'))
                    return btn
                }
                return empDynamicBtn()
            },
        },
    },
    "Bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executer.status') && get(item, 'executer.chat_id') == chat_id)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Bajarilgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executer.status') == false && get(item, 'executer.chat_id') == chat_id)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Rad etilgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },

}


let executeBtn = {
    "Orqaga": {
        selfExecuteFn: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateStep(chat_id, get(user, `back[${user.back.length - 1}].step`, 1))
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
    "So'rov Yuborish": {
        selfExecuteFn: ({ chat_id, }) => {
            updateStep(chat_id, 10)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: ({ chat_id }) => {
                return "Menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let permisson = infoPermisson().find(item => chat_id == item.chat_id)
                let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
                return empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)
            },
        },
    },


    "Kutilayotgan so’rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
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
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && !item?.confirmative && item.chat_id == chat_id)

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlanishi kutilayotgan so’rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${mainData[i].id}` }], 2, 'Waiting'))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                let mainData = infoData().filter(item => item.full && !item?.confirmative && item.chat_id == chat_id)
                if (mainData.length) {
                    let btn = await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${mainData[0].id}` }], 2, 'Waiting')
                    return btn
                }
                return empDynamicBtn()
            },
        },
    },
    "Bajarilishi kutilaytogan so’rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && !item?.executer && get(item, 'confirmative.status') && item.chat_id == chat_id)

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Bajarilishi kutilaytogan so’rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },




    "Tasdiqlangan so’rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: ({ chat_id }) => {
                return "So'rovlar"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Tasdiqlangan , bajarilmagan so'rovlar", "Tasdiqlangan , bajarilgan so'rovlar"])
            },
        },
    },
    "Tasdiqlangan , bajarilmagan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlangan , bajarilmagan so'rovlar", "Tasdiqlangan , bajarilgan so'rovlar"]), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') && !item?.executer && item.chat_id == chat_id)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlangan , bajarilmagan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Tasdiqlangan , bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlangan , bajarilmagan so'rovlar", "Tasdiqlangan , bajarilgan so'rovlar"]), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'executer.status') && get(item, 'confirmative.status') && item.chat_id == chat_id)

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlangan , bajarilgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },



    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: ({ chat_id }) => {
                return "So'rovlar"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Tasdiqlovchi rad etgan so'rovlar", "Bajaruvchi rad etgan so'rovlar"])
            },
        },
    },
    "Tasdiqlovchi rad etgan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlovchi rad etgan so'rovlar", "Bajaruvchi rad etgan so'rovlar"]), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'confirmative.status') == false && item.chat_id == chat_id)
                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Tasdiqlovchi rad etgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Bajaruvchi rad etgan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlovchi rad etgan so'rovlar", "Bajaruvchi rad etgan so'rovlar"]), step: 2 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2
        },
        next: {
            text: async ({ chat_id }) => {
                let mainData = infoData().filter(item => item.full && get(item, 'executer.status') == false && get(item, 'confirmative.status') && item.chat_id == chat_id)

                if (mainData.length) {
                    await bot.sendMessage(chat_id, `Bajaruvchi rad etgan so'rovlar`, empDynamicBtn())
                    let info = SubMenu()[get(mainData[0], 'menu', 1)].find(item => item.name == mainData[0].subMenu).infoFn({ chat_id: mainData[0].chat_id, id: mainData[0].id })
                    for (let i = 1; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        bot.sendMessage(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id))
                    }
                    return dataConfirmText(info, `So'rovlar`)
                }
                return 'Mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
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
            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
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
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Xorijiy xarid konteyner buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid konteyner buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid mashina buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid tovar buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 20)
            updateData(get(dataCurUser, 'id'), { subMenu: `Xorijiy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 90)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chetga pul chiqarish` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Document Type ni tanlang"
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
                    return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Document Type ni tanlang"
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
                return await dataConfirmBtnEmp(chat_id, accountList43.sort((a, b) => a.id - b.id), 1, 'accountOneStep')
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

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)

            updateStep(chat_id, 40)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
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
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Mahalliy xarid buyurtmasi": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Mahalliy xarid buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 40 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 40
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { DDS: `Mahalliy yetkazib beruvchilarga to'lov`, subMenu: `Mahalliy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 40 })
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Поставщик (Yetkazib beruvchi) ni ismini yozing"
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Поставщик (Yetkazib beruvchi) ni ismini yozing"
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

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
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
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Bank hisobidan to'lov/xarajat": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Bank hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Naqd/Karta hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 90)
            updateData(get(dataCurUser, 'id'), { subMenu: `Naqd/Click Bojxonaga oid xarajatlar` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Bank hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Document Type ni tanlang"
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Document Type ni tanlang"
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
                let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
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
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)

                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : 'Schetni tanlang'
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
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
            let b1Account15 = await b1Controller.getAccount15({ status: (dataCurUser.menu == 1 && dataCurUser.menuName == 'Xorijiy xarid') })
            let accountList15 = b1Account15?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { accountList: accountList15, payment: true })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 90
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : 'Schetni tanlang'
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
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
                let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
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

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
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
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "D12 Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D12 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D64 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D777 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Distribyutsiya Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
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
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Narx chiqarishni tasdiqlash xitoy": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash xitoy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash mahalliy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`)).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Boshqa"
            },
            btn: async ({ chat_id, }) => {

                let user = infoUser().find(item => item.chat_id == chat_id)
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "SAPda o'zgartirishni tasdiqlash": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `SAPda o'zgartirishni tasdiqlash` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Do'kon xarid` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chegirma` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
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
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Yangi tovar nomi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}




let adminBtn = {
    "Foydalanuvchilar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            updateStep(chat_id, 700)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 1 && get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Foydalanuvchini tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().filter(item => item.JobTitle !== 'Admin')
                return dataConfirmBtnEmp(chat_id, user.map(item => {
                    return {
                        name: `${item.LastName} ${item.FirstName}`, id: item.chat_id
                    }
                }), 1, 'adminUsers')
            },
        },
    },
    "Rollar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Rollarni belgilang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                return dataConfirmBtnEmp(chat_id,
                    [
                        {
                            name: `Xodim ${get(infoPermissonData, 'roles')?.includes('1') ? '✅' : ' '}`,
                            id: 1
                        },
                        {
                            name: `Tasdiqlovchi ${get(infoPermissonData, 'roles')?.includes('2') ? '✅' : ' '}`,
                            id: 2
                        },
                        {
                            name: `Bajaruvchi ${get(infoPermissonData, 'roles')?.includes('3') ? '✅' : ' '}`,
                            id: 3
                        }
                    ]
                    , 1, 'roles')
            },
        },
    },
    "Xodim-Menular": {
        selfExecuteFn: async ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateUser(chat_id, { selectedAdminUserStatus: 'emp' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Xodim uchun menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, 'permissonMenuEmp', {})[item.id]?.length ? '✅' : ''}` }
                })
                return dataConfirmBtnEmp(chat_id,
                    menuList
                    , 1, 'empMenu')
            },
        },
    },
    "Tasdiqlovchi-Menular": {
        selfExecuteFn: async ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateUser(chat_id, { selectedAdminUserStatus: 'affirmative' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Tasdiqlochi uchun menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, 'permissonMenuAffirmative', {})[item.id]?.length ? '✅' : ''}` }
                })
                return dataConfirmBtnEmp(chat_id,
                    menuList
                    , 1, 'empMenu')
            },
        },
    },
    "Bajaruvchi-Menular": {
        selfExecuteFn: async ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateUser(chat_id, { selectedAdminUserStatus: 'executor' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Bajaruvchi uchun menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, 'permissonMenuExecutor', {})[item.id]?.length ? '✅' : ''}` }
                })
                if (get(user, 'selectedAdminUserStatus') == 'executor') {
                    menuList = menuList.filter(item => item.id != 4)
                }
                return dataConfirmBtnEmp(chat_id,
                    menuList
                    , 1, 'empMenu')
            },
        },
    },
    "Menular": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Menular"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info"], 2)
            },
        },
    },
    "Menular qo'shish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info"], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 703)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 702
        },
        next: {
            text: ({ chat_id }) => {
                return "Menular qo'shish"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            },
        },
    },
    "Asosiy Menu": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateBack(chat_id, { text: "Menular qo'shish", btn, step: 703 })
            updateStep(chat_id, 710)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 703
        },
        next: {
            text: ({ chat_id }) => {
                return "Asosiy Menu nomini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Sub Menu": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateBack(chat_id, { text: "Menular qo'shish", btn, step: 703 })
            updateStep(chat_id, 704)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 703
        },
        next: {
            text: async ({ chat_id }) => {
                let menu = infoMenu()
                if (menu.length == 0) {
                    updateStep(chat_id, 703)
                }
                else {
                    await bot.sendMessage(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
                }
                return menu?.length ? "Menuni tanlang" : 'Menular mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id,
                    infoMenu()
                    , 1, 'newSubMenu')
            },
        },
    },

}

let updateAdminBtn = {
    "Menular o'zgartirish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info"], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 800)
            updateUser(chat_id, { adminType: 'update' })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 702
        },
        next: {
            text: ({ chat_id }) => {
                return "Menular o'zgartirish"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            },
        },
    },
    "Asosiy Menu": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateUser(chat_id, { updatePaginationMenu: 1 })
            updateBack(chat_id, { text: "Menular o'zgartirish", btn, step: 800 })
            updateStep(chat_id, 801)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && [800, 801].includes(+user?.user_step)
        },
        next: {
            text: ({ chat_id }) => {
                let menu = infoMenu()
                if (infoMenu().length == 0) {
                    updateStep(chat_id, 800)
                }
                return menu?.length ? "Menuni tanlang" : 'Menular mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id,
                    infoMenu().map(item => {
                        return { name: item.name, id: `${item.id}#1` }
                    })
                    , 1, 'updateMenus')
            },
        },
    },
    "Sub Menu": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateBack(chat_id, { text: "Menular o'zgartirish", btn, step: 800 })
            updateUser(chat_id, { updatePaginationMenu: 2 })
            updateStep(chat_id, 801)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && [800, 801].includes(+user?.user_step)
        },
        next: {
            text: async ({ chat_id }) => {
                let subMenu = infoSubMenu()
                if (infoSubMenu().length == 0) {
                    updateStep(chat_id, 800)
                }
                else {
                    await bot.sendMessage(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
                }
                return subMenu?.length ? "Menuni tanlang" : 'Menular mavjud emas'
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id,
                    infoMenu().map(item => {
                        return { name: item.name, id: `${item.id}` }
                    })
                    , 1, 'selectMenus')
            },
        },
    },
}

let deleteAdminBtn = {
    "Menular o'chirish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info"], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 801)
            updateUser(chat_id, { adminType: 'delete' })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 702
        },
        next: {
            text: async ({ chat_id }) => {
                if (infoMenu().length == 0) {
                    updateStep(chat_id, 702)
                }
                else {
                    await bot.sendMessage(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
                }
                return infoMenu().length ? "Menular o'chirish" : "Mavjud emas"
            },
            btn: async ({ chat_id, }) => {
                if (infoMenu().length == 0) {
                    return empDynamicBtn()
                }
                return dataConfirmBtnEmp(chat_id,
                    infoMenu().map(item => {
                        return { name: item.name, id: `${item.id}` }
                    })
                    , 1, 'selectMenus')
            },
        },
    },
}

let changeStatusAdminBtn = {
    "Menular status": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info"], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 801)
            updateUser(chat_id, { adminType: 'change' })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 702
        },
        next: {
            text: async ({ chat_id }) => {
                if (infoAllMenu().length == 0) {
                    updateStep(chat_id, 702)
                }
                else {
                    await bot.sendMessage(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
                }
                return infoAllMenu().length ? "Menular status" : "Mavjud emas"
            },
            btn: async ({ chat_id, }) => {
                if (infoAllMenu().length == 0) {
                    return empDynamicBtn()
                }
                return dataConfirmBtnEmp(chat_id,
                    infoAllMenu().map(item => {
                        return { name: `${item.name}`, id: `${item.id}` }
                    })
                    , 1, 'selectMenus')
            },
        },
    },
}
let infoAdminBtn = {
    'Menular info': {
        selfExecuteFn: ({ chat_id, }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return adminMenusInfo()
            },
            btn: async ({ chat_id, }) => {
                return
            },
        },
    },
}

let newBtnExecuter = () => {
    let newBtnMenu = {}
    for (let i = 0; i < infoMenu().length; i++) {
        let item = infoMenu()[i]
        let subMenuList = infoSubMenu().filter(el => el.menuId == item.id)
        if (subMenuList.length) {
            newBtnMenu[item.name] = {
                selfExecuteFn: ({ chat_id, }) => {
                    let user = infoUser().find(el => el.chat_id == chat_id)
                    let dataCurUser = infoData().find(el => el.id == user?.currentDataId)
                    if (dataCurUser?.menuName != `${item.name}` || dataCurUser.full) {
                        let uid = randomUUID()
                        updateUser(chat_id, { currentDataId: uid })
                        writeData({ id: uid, menu: item.id, menuName: item.name, chat_id })
                    }
                    let permisson = infoPermisson().find(el => chat_id == el.chat_id)
                    let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(el => el[1]?.length))
                    let btn = empDynamicBtn(Menu().filter(el => Object.keys(permissonMenuEmp).includes(`${el.id}`)).map(el => el.name), 3)
                    updateStep(chat_id, 60)
                    updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
                },
                middleware: ({ chat_id }) => {
                    let user = infoUser().find(el => el.chat_id == chat_id)
                    return user.user_step == 10
                },
                next: {
                    text: ({ chat_id }) => {
                        return `${item.name}`
                    },
                    btn: async ({ chat_id, }) => {
                        let user = infoUser().find(el => el.chat_id == chat_id)
                        let dataCurUser = infoData().find(el => el.id == user?.currentDataId)
                        let permisson = infoPermisson().find(el => el.chat_id == chat_id)
                        let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                        return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(el => permissonSubMenu.includes(`${el.id}`)).map(el => el.name)], 2)
                    },
                },
            }
            subMenuList.forEach(s => {
                newBtnMenu[s.name] = {
                    selfExecuteFn: ({ chat_id, }) => {
                        let user = infoUser().find(el => el.chat_id == chat_id)
                        let dataCurUser = infoData().find(el => el.id == user?.currentDataId)
                        let permisson = infoPermisson().find(el => el.chat_id == chat_id)
                        let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                        updateStep(chat_id, 61)
                        updateData(get(dataCurUser, 'id'), { subMenu: `${s.name}` })
                        updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(el => permissonSubMenu.includes(`${el.id}`)).map(el => el.name)], 2), step: 60 })
                    },
                    middleware: ({ chat_id }) => {
                        let user = infoUser().find(el => el.chat_id == chat_id)
                        return user.user_step == 60
                    },
                    next: {
                        text: ({ chat_id }) => {
                            let user = infoUser().find(el => el.chat_id == chat_id)
                            let list = infoData().find(el => el.id == user?.currentDataId)
                            let findComment = SubMenu()[get(list, 'menu', 3)]?.find(el => el.name == list.subMenu)?.comment
                            return findComment || 'Error'
                        },
                        btn: async ({ chat_id, }) => {
                            return empDynamicBtn()
                        },
                    },
                }
            })
        }
    }
    return newBtnMenu
}



module.exports = {
    executeBtn,
    xorijiyXaridBtn,
    mahalliyXaridBtn,
    tolovHarajatBtn,
    narxChiqarishBtn,
    boshqaBtn,
    shartnomaBtn,
    tolovHarajatBojBtn,
    adminBtn,
    newBtnExecuter,
    updateAdminBtn,
    deleteAdminBtn,
    changeStatusAdminBtn,
    infoAdminBtn,
    firtBtnExecutor,
    confirmativeBtn,
    executorBtn
}