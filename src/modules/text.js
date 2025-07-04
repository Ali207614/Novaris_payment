const { get, isEmpty, isDate } = require("lodash");
let { SubMenu, accounts, accounts50, Menu, empDataCred, execDataCred, confDataCred, newMenu, excelFnFormatData } = require("../credentials");
const { updateStep, infoUser, updateUser, updateBack, updateData, writeData, infoData, infoPermisson, infoMenu, infoSubMenu, infoAllMenu, infoGroup, sendMessageHelper, infoAccountPermisson, infoAccountList } = require("../helpers");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { empKeyboard, adminKeyboard, jobMenu, mainMenuByRoles, affirmativeKeyboard, executorKeyboard } = require("../keyboards/keyboards");
const ShortUniqueId = require('short-unique-id');
const { randomUUID } = new ShortUniqueId({ length: 10 });
const { dataConfirmText, adminMenusInfo, userInfoText } = require("../keyboards/text");
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards");
const b1Controller = require("../controllers/b1Controller");
const { bot } = require("../config");
const path = require('path')
const writeXlsxFile = require('write-excel-file/node')
let moment = require('moment')
const sleepNow = (delay) =>
    new Promise((resolve) => setTimeout(resolve, delay));
let firtBtnExecutor = () => {
    let newBtnMenu = {}
    let menuList = ['Tasdiqlovchi', 'Bajaruvchi', 'Xodim']
    for (let i = 0; i < menuList.length; i++) {
        let item = menuList[i]
        newBtnMenu[item] = {
            selfExecuteFn: ({ chat_id, }) => {
                updateStep(chat_id, 2)
                updateUser(chat_id, { currentUserRole: menuList[i], update: false })
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
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlanmagan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {

                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Tasdiqlanib , bajarilmagan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlanib , bajarilmagan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return "Sanani tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Tasdiqlanib , bajarilishi kutilayotgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlanib , bajarilishi kutilayotgan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Rad etilgan so'rovlar", user_step: 300 })

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: affirmativeKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Bajarilgan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },



    "Kunlik": {
        selfExecuteFn: async ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

            let mainData = confDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const today = moment().startOf('day');
            const tomorrow = moment(today).add(1, 'days');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(today, tomorrow, null, '[)');
            }).sort((a, b) => a.ID - b.ID)
            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Kunlik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmConfirmative'))
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Tasdiqlanmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },

    },
    "Haftalik": {
        selfExecuteFn: async ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

            let mainData = confDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const startOfWeek = moment().startOf('isoWeek');
            const endOfWeek = moment().endOf('isoWeek');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(startOfWeek, endOfWeek, null, '[]');
            }).sort((a, b) => a.ID - b.ID);

            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Haftalik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmConfirmative'))
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Tasdiqlanmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
    },
    "Oylik": {
        selfExecuteFn: async ({ chat_id, user }) => {
            try {
                updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

                let mainData = confDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []

                const startOfLast30Days = moment().subtract(30, 'days').startOf('day');
                const endOfToday = moment().endOf('day');

                mainData = mainData
                    .filter(item => {
                        const creationDate = moment(item.creationDate);
                        return creationDate.isBetween(startOfLast30Days, endOfToday, null, '[]');
                    })
                    .sort((a, b) => a.ID - b.ID);


                if (mainData.length) {
                    await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Oylik`, empDynamicBtn())

                    for (let i = 0; i < mainData.length; i++) {
                        let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                        let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Tasdiqlash', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmConfirmative'))
                        let file = get(mainData, `${[i]}.file`, {})

                        await sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Tasdiqlanmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                        await sleepNow(200)
                    }
                    return
                }
                return sendMessageHelper(chat_id, "Mavjud emas")
            }
            catch (e) {
                console.log(e, ' bu e')
            }

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Tasdiqlovchi'
        },
    },
}


let executorBtn = {
    "Bajarilmagan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Bajarilmagan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {
                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {

                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Bajarilgan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },
    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, { text: "So'rovlar", btn: executorKeyboard, step: 2 })
            updateUser(chat_id, { selectedInfoMenu: "Rad etilgan so'rovlar", user_step: 300 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },


    "Kunlik": {
        selfExecuteFn: async ({ chat_id }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

            let user = infoUser().find(item => item.chat_id == chat_id)
            let mainData = execDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const today = moment().startOf('day');
            const tomorrow = moment(today).add(1, 'days');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(today, tomorrow, null, '[)');
            }).sort((a, b) => a.ID - b.ID)


            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Kunlik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let file = get(mainData, `${[i]}.file`, {})
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Bajarish', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmExecuter'))
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Bajarilmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },

    },
    "Haftalik": {
        selfExecuteFn: async ({ chat_id }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

            let user = infoUser().find(item => item.chat_id == chat_id)
            let mainData = execDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const startOfWeek = moment().startOf('isoWeek');
            const endOfWeek = moment().endOf('isoWeek');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(startOfWeek, endOfWeek, null, '[]');
            }).sort((a, b) => a.ID - b.ID);
            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Haftalik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Bajarish', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmExecuter'))
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Bajarilmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },

    },
    "Oylik": {
        selfExecuteFn: async ({ chat_id }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 300 })

            let user = infoUser().find(item => item.chat_id == chat_id)
            let mainData = execDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const startOfLast30Days = moment().subtract(30, 'days').startOf('day');
            const endOfToday = moment().endOf('day');

            mainData = mainData
                .filter(item => {
                    const creationDate = moment(item.creationDate);
                    return creationDate.isBetween(startOfLast30Days, endOfToday, null, '[]');
                })
                .sort((a, b) => a.ID - b.ID);



            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Oylik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let btn = (await dataConfirmBtnEmp(chat_id, [{ name: 'Bajarish', id: `1#${mainData[i].id}`, }, { name: 'Bekor qilish', id: `2#${mainData[i].id}` }], 2, 'confirmExecuter'))
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == "Bajarilmagan so'rovlar" ? btn : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return 'Mavjud emas'

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 300 && get(user, 'currentUserRole') == 'Bajaruvchi'
        },

    },

}


let executeBtn = {
    "Orqaga": {
        document: true,
        selfExecuteFn: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (get(user, 'confirmationStatus')) {
                return
            }
            updateStep(chat_id, get(user, `back[${user.back.length - 1}].step`, 1))
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'back', []).length
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (get(user, 'confirmationStatus')) {
                    return 'Bekor qilinganlik sababini yozing'
                }
                return get(user, `back[${user.back.length - 1}].text`)
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (get(user, 'confirmationStatus')) {
                    return
                }
                let btnBack = get(user, `back[${user.back.length - 1}].btn`)


                updateUser(chat_id, {
                    back: user.back.filter((item, i) => i != user.back.length - 1),
                    lastFile: { ...get(user, 'lastFile'), currentDataId: '' }
                })
                return await btnBack
            },
        },
    },
    "So'rov Yuborish": {
        selfExecuteFn: ({ chat_id, }) => {
            updateStep(chat_id, 10)
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
            updateUser(chat_id, {
                waitingUpdateStatus: false,
                extraWaiting: false
            })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2
        },
        next: {
            text: ({ chat_id }) => {
                return "Menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                let permisson = infoPermisson().find(item => chat_id == item.chat_id)
                let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
                return empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.isDelete == false && item.status == true).map(item => item.name), 3)
            },
        },
    },


    "Kutilayotgan so’rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
            updateStep(chat_id, 3)
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Xodim'
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
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlanishi kutilayotgan so’rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'

            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },
    "Bajarilishi kutilaytogan so’rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(['Tasdiqlanishi kutilayotgan so’rovlar', 'Bajarilishi kutilaytogan so’rovlar']), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Bajarilishi kutilaytogan so’rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'

            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },


    "Tasdiqlangan so’rovlar": {
        selfExecuteFn: ({ chat_id, user }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
            updateStep(chat_id, 3)

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Xodim'
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
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlangan , bajarilmagan so'rovlar", "Tasdiqlangan , bajarilgan so'rovlar"]), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlangan , bajarilmagan so'rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'

            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },
    "Tasdiqlangan , bajarilgan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlangan , bajarilmagan so'rovlar", "Tasdiqlangan , bajarilgan so'rovlar"]), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlangan , bajarilgan so'rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'

            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },


    "Rad etilgan so'rovlar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "So'rovlar", btn: empKeyboard, step: 2 })
            updateStep(chat_id, 3)
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2 && get(user, 'currentUserRole') == 'Xodim'
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
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlovchi rad etgan so'rovlar", "Bajaruvchi rad etgan so'rovlar"]), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Tasdiqlovchi rad etgan so'rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {

                return 'Sanani tanlang'

            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)

            },
        },
    },
    "Bajaruvchi rad etgan so'rovlar": {
        selfExecuteFn: ({ chat_id }) => {
            updateStep(chat_id, 200)
            updateBack(chat_id, { text: "So'rovlar", btn: empDynamicBtn(["Tasdiqlovchi rad etgan so'rovlar", "Bajaruvchi rad etgan so'rovlar"]), step: 3 })
            updateUser(chat_id, { selectedInfoMenu: "Bajaruvchi rad etgan so'rovlar" })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 3 && get(user, 'currentUserRole') == 'Xodim'
        },
        next: {
            text: async ({ chat_id }) => {
                return 'Sanani tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2)
            },
        },
    },

    "Kunlik": {
        selfExecuteFn: async ({ chat_id }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 200 })

            let user = infoUser().find(item => item.chat_id == chat_id)
            let mainData = empDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []

            const today = moment().startOf('day');
            const tomorrow = moment(today).add(1, 'days');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(today, tomorrow, null, '[)');
            }).sort((a, b) => a.ID - b.ID)


            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Kunlik`, empDynamicBtn())
                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu)?.infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == 'Tasdiqlanishi kutilayotgan so’rovlar' ? await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${mainData[i].id}` }], 2, 'Waiting') : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)

                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 200 && get(user, 'currentUserRole') == 'Xodim'
        },
    },
    "Haftalik": {
        selfExecuteFn: async ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 200 })

            let mainData = empDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []

            const startOfWeek = moment().startOf('isoWeek');
            const endOfWeek = moment().endOf('isoWeek');

            mainData = mainData.filter(item => {
                const creationDate = moment(item.creationDate);
                return creationDate.isBetween(startOfWeek, endOfWeek, null, '[]');
            }).sort((a, b) => a.ID - b.ID);

            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Haftalik`, empDynamicBtn())
                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == 'Tasdiqlanishi kutilayotgan so’rovlar' ? await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${mainData[i].id}` }], 2, 'Waiting') : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 200 && get(user, 'currentUserRole') == 'Xodim'
        },

    },
    "Oylik": {
        selfExecuteFn: async ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Sanani tanlang", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik'], 2), step: 200 })

            let mainData = empDataCred({ chat_id })[get(user, 'selectedInfoMenu')]({ chat_id }) || []
            const startOfLast30Days = moment().subtract(30, 'days').startOf('day');
            const endOfToday = moment().endOf('day');

            mainData = mainData
                .filter(item => {
                    const creationDate = moment(item.creationDate);
                    return creationDate.isBetween(startOfLast30Days, endOfToday, null, '[]');
                })
                .sort((a, b) => a.ID - b.ID);


            if (mainData.length) {
                await sendMessageHelper(chat_id, `${get(user, 'selectedInfoMenu')} - Oylik`, empDynamicBtn())

                for (let i = 0; i < mainData.length; i++) {
                    let mainInfo = SubMenu()[get(mainData[i], 'menu', 1)].find(item => item.name == mainData[i].subMenu).infoFn({ chat_id: mainData[i].chat_id, id: mainData[i].id })
                    let file = get(mainData, `${[i]}.file`, {})
                    sendMessageHelper(chat_id, dataConfirmText(mainInfo, `So'rovlar`, chat_id), (get(user, 'selectedInfoMenu') == 'Tasdiqlanishi kutilayotgan so’rovlar' ? await dataConfirmBtnEmp(chat_id, [{ name: "O'zgartirish", id: `3#${mainData[i].id}` }], 2, 'Waiting') : undefined), { file }, { lastFile: mainData[i]?.lastFile })
                    await sleepNow(200)
                }
                return
            }
            return sendMessageHelper(chat_id, "Mavjud emas")
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 200 && get(user, 'currentUserRole') == 'Xodim'
        },

    },
}

let xorijiyXaridBtn = {
    "Xorijiy xarid": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != 'Xorijiy xarid' || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 1, menuName: 'Xorijiy xarid', chat_id })
            }
            updateStep(chat_id, 11)
            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Xorijiy xarid"
            },
            btn: async ({ chat_id, user }) => {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Xorijiy xarid konteyner buyurtmasi": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid konteyner buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
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
    "Xorijiy xarid tayyor buyurtma": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid tayyor buyurtma' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid mashina buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 12)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Xorijiy xarid tovar buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 20)
            updateData(get(dataCurUser, 'id'), { subMenu: `Xorijiy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return "Hujjatni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Chetga pul chiqarish": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 90)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chetga pul chiqarish` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Chetga pul chiqarish (Bank)": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chetga pul chiqarish (Bank)` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 11 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 11
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Chiquvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 21)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 20 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 20
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Hujjat turi ni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Hisob`, `Yetkazib beruvchi`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Kiruvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            try {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                if (user?.update) {
                    updateStep(chat_id, dataCurUser?.lastStep)
                }
                else {
                    updateStep(chat_id, 21)
                    updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 20 })
                }
                updateData(user.currentDataId, { payment: true })
            }
            catch (e) {
                throw new Error(e)
            }
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 20
        },
        next: {
            text: ({ chat_id, user }) => {
                try {
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Hujjat turi ni tanlang"
                }
                catch (e) {
                    throw new Error(e)
                }
            },
            btn: async ({ chat_id, user }) => {
                try {
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    let btn = user?.update ? list.lastBtn : empDynamicBtn([`Hisob`, `Yetkazib beruvchi`], 2)
                    updateUser(chat_id, { update: false })
                    return btn
                }
                catch (e) {
                    throw new Error(e)
                }
            },
        },
    },
    "Hisob": {
        selfExecuteFn: ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `Yetkazib beruvchi`], 2), step: 21 })
            updateData(user.currentDataId, { documentType: true, vendorId: "", purchase: false, vendorList: [], purchaseOrders: [] })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 21
        },
        next: {
            text: ({ chat_id }) => {
                return "Hisob (qayerga)"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)

                let b1Account43 = await b1Controller.getAccount43()
                let accountList43 = b1Account43.map((item, i) => {
                    return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                })
                let subMenuId = SubMenu()[get(list, 'menu')].find(el => el.name == get(list, 'subMenu')).id

                if (infoAccountPermisson()[get(list, 'menu')] && infoAccountPermisson()[get(list, 'menu')][subMenuId]) {
                    let notAcc = Object.values(infoAccountPermisson()[get(list, 'menu')][subMenuId]).flat()
                    accountList43 = accountList43.filter(item => !notAcc.includes((get(item, 'id', '') || '').toString()))
                }

                updateData(user?.currentDataId, { accountList43 })
                return await dataConfirmBtnEmp(chat_id, accountList43.sort((a, b) => a.id - b.id), 1, 'accountOneStep')
            },
        },
    },
    "Yetkazib beruvchi": {
        selfExecuteFn: ({ chat_id, user }) => {
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `Yetkazib beruvchi`], 2), step: 21 })
            updateData(user.currentDataId, { documentType: false, accountCodeOther: '' })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 21
        },
        next: {
            text: ({ chat_id }) => {
                return "Yetkazib beruvchi ni ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let mahalliyXaridBtn = {
    "Mahalliy xarid": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != 'Mahalliy xarid' || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 2, menuName: 'Mahalliy xarid', chat_id })
            }

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)

            updateStep(chat_id, 40)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Mahalliy xarid"
            },
            btn: async ({ chat_id, user }) => {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Mahalliy xarid buyurtmasi": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { subMenu: 'Mahalliy xarid buyurtmasi' })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 40 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 40
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 41)
            updateData(get(dataCurUser, 'id'), { DDS: `Mahalliy yetkazib beruvchilarga to'lov`, subMenu: `Mahalliy xarid to'lovi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 40 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 40
        },
        next: {
            text: ({ chat_id }) => {
                return "Hujjatni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Chiquvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 42)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 41 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Yetkazib beruvchi ni ismini yozing"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Kiruvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 42)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 41 })
            }
            updateData(user.currentDataId, { payment: true })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Yetkazib beruvchi ni ismini yozing"
            },
            btn: async ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "To'lov/Xarajat" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 3, menuName: "To'lov/Xarajat", chat_id })
            }

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "To'lov/Xarajat"
            },
            btn: async ({ chat_id, user }) => {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Bank hisobidan to'lov/xarajat": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Bank hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Bank (Oylik davriy xarajat)": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Bank (Oylik davriy xarajat)` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd/Karta hisobidan to'lov/xarajat` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },


    "Naqd (Tovar qabuli, Yetkazish, Operatsion)": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd (Tovar qabuli, Yetkazish, Operatsion)` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },

    "Naqd (AV/TMB, Marketing, Dastur, Ijara)": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd (AV/TMB, Marketing, Dastur, Ijara)` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Naqd (Oylik davriy xarajat)": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd (Oylik davriy xarajat)` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Naqd NQ": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd NQ` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },

    "Naqd/Karta hisobiga tushum": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Naqd/Karta hisobiga tushum` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Kiruvchi to'lov`], 2)
            },
        },
    },
    "Naqd/Click Bojxonaga oid xarajatlar": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 90)
            updateData(get(list, 'id'), { subMenu: `Naqd/Click Bojxonaga oid xarajatlar` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id }) => {
                return 'Hujjatni tanlang'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2)
            },
        },
    },
    "Bank Bojxonaga oid xarajatlar": {
        selfExecuteFn: ({ chat_id, user }) => {
            let list = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[get(list, 'menu', 3)]
            updateStep(chat_id, 61)
            updateData(get(list, 'id'), { subMenu: `Bank Bojxonaga oid xarajatlar` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[get(list, 'menu', 3)].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Chiquvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 62)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 61 })
            }
            updateData(user.currentDataId, { payment: false })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Hujjat turi ni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Hisob`, `(Xodim)`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Kiruvchi to'lov": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 62)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 61 })
            }
            updateData(user.currentDataId, { payment: true })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : "Hujjat turi ni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn([`Hisob`, `(Xodim)`], 2)
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Hisob": {
        document: true,
        selfExecuteFn: ({ chat_id, user }) => {
            updateStep(chat_id, 63)
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: true, vendorId: "", purchase: false, vendorList: [], purchaseOrders: [] })

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Hisob (qayerga)"
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let accountsObj = { ...accounts(), ...(get(list, 'payment', false) ? accounts50() : {}) }
                let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
                    return { name: item, id: i }
                }), 2, 'accountType')
                return btn
            },
        },
    },
    "(Xodim)": {
        selfExecuteFn: ({ chat_id, user }) => {
            updateStep(chat_id, 80)
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: false, accountCodeOther: '' })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Xodimning ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let tolovHarajatBojBtn = {
    "Chiquvchi to'lov": {
        selfExecuteFn: async ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 64)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 90 })
            }
            let b1Account15 = await b1Controller.getAccount15({ status: (dataCurUser.menu == 1 && dataCurUser?.menuName == 'Xorijiy xarid') })
            let accountList15 = b1Account15?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            let subMenuId = SubMenu()[get(dataCurUser, 'menu')].find(el => el.name == get(dataCurUser, 'subMenu')).id

            if (infoAccountPermisson()[get(dataCurUser, 'menu')] && infoAccountPermisson()[get(dataCurUser, 'menu')][subMenuId]) {
                let notAcc = Object.values(infoAccountPermisson()[get(dataCurUser, 'menu')][subMenuId]).flat()
                accountList15 = accountList15.filter(item => !notAcc.includes((get(item, 'id', '') || '').toString()))
            }

            updateData(user?.currentDataId, { accountList: accountList15, payment: false })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 90
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)

                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : 'Hisob (qayerdan)'
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Kiruvchi to'lov": {
        selfExecuteFn: async ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (user?.update) {
                updateStep(chat_id, dataCurUser?.lastStep)
            }
            else {
                updateStep(chat_id, 64)
                updateBack(chat_id, { text: "Hujjatni tanlang", btn: empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2), step: 90 })
            }
            let b1Account15 = await b1Controller.getAccount15({ status: (dataCurUser.menu == 1 && dataCurUser?.menuName == 'Xorijiy xarid') })
            let accountList15 = b1Account15?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            let subMenuId = SubMenu()[get(dataCurUser, 'menu')].find(el => el.name == get(dataCurUser, 'subMenu')).id

            if (infoAccountPermisson()[get(dataCurUser, 'menu')] && infoAccountPermisson()[get(dataCurUser, 'menu')][subMenuId]) {
                let notAcc = Object.values(infoAccountPermisson()[get(dataCurUser, 'menu')][subMenuId]).flat()
                accountList15 = accountList15.filter(item => !notAcc.includes((get(item, 'id', '') || '').toString()))
            }

            updateData(user?.currentDataId, { accountList: accountList15, payment: true })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 90
        },
        next: {
            text: ({ chat_id, user }) => {

                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : 'Hisob (qayerdan)'
            },
            btn: async ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "Hisob": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateStep(chat_id, 63)
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `Xodim`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: true, vendorId: "", purchase: false, vendorList: [], purchaseOrders: [] })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Hisob (qayerga)"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let accountsObj = { ...accounts(), ...(get(list, 'payment', false) ? (accounts50()) : {}) }
                let btn = await dataConfirmBtnEmp(chat_id, Object.keys(accountsObj).map((item, i) => {
                    return { name: item, id: i }
                }), 2, 'accountType')
                return btn
            },
        },
    },
    "(Xodim)": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            updateStep(chat_id, 80)
            updateBack(chat_id, { text: "Hujjat turi ni tanlang", btn: empDynamicBtn([`Hisob`, `(Xodim)`], 2), step: 62 })
            updateData(user.currentDataId, { documentType: false, accountCodeOther: '' })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 62
        },
        next: {
            text: ({ chat_id }) => {
                return "Xodimning ismini yozing"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
}

let shartnomaBtn = {
    "Shartnoma": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Shartnoma" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 4, menuName: "Shartnoma", chat_id })
            }

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Shartnoma"
            },
            btn: async ({ chat_id, user }) => {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "D12 Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D12 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D64 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `D777 Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Distribyutsiya Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "DQ Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `DQ Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },

    "SM Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `SM Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "AN Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `AN Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "NM Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `NM Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "UR Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `UR Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "JZ Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `JZ Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },


    "BX Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            try {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                updateStep(chat_id, 61)
                updateData(get(dataCurUser, 'id'), { subMenu: `BX Shartnoma shabloni` })
                updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
            }
            catch (e) {
                console.log(e)
            }
        },
        middleware: ({ chat_id }) => {
            return true
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "SU Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `SU Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            return true
        },
        next: {
            text: ({ chat_id, user }) => {
                let list = infoData().find(item => item.id == user?.currentDataId)
                let findComment = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu)?.comment
                return findComment
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "QA Shartnoma shabloni": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `QA Shartnoma shabloni` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id }) => {
            return true
        },
        next: {
            text: ({ chat_id, user }) => {
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


let narxChiqarishBtn = {
    "Narx chiqarish": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Narx chiqarish" || dataCurUser.full) {
                let uid = randomUUID()
                updateUser(chat_id, { currentDataId: uid })
                writeData({ id: uid, menu: 5, menuName: "Narx chiqarish", chat_id })
            }

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Narx chiqarish"
            },
            btn: async ({ chat_id, user }) => {
                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "Narx chiqarishni tasdiqlash xitoy": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash xitoy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Narx chiqarishni tasdiqlash mahalliy` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: async ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            if (dataCurUser?.menuName != "Boshqa" || dataCurUser.full) {
                let uid = randomUUID()
                await updateUser(chat_id, { currentDataId: uid })
                await writeData({ id: uid, menu: 6, menuName: "Boshqa", chat_id })
            }

            let permisson = infoPermisson().find(item => chat_id == item.chat_id)
            let permissonMenuEmp = Object.fromEntries(Object.entries(get(permisson, 'permissonMenuEmp', {})).filter(item => item[1]?.length))
            let btn = empDynamicBtn(Menu().filter(item => Object.keys(permissonMenuEmp).includes(`${item.id}`) && item.status && item.isDelete == false).map(item => item.name), 3)

            updateStep(chat_id, 60)
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn, step: 10 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 10
        },
        next: {
            text: ({ chat_id }) => {
                return "Boshqa"
            },
            btn: async ({ chat_id, user }) => {

                let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
                let permisson = infoPermisson().find(item => item.chat_id == chat_id)
                let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
                return empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2)
            },
        },
    },
    "SAPda o'zgartirishni tasdiqlash": {
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `SAPda o'zgartirishni tasdiqlash` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Do'kon xarid` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Chegirma` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, user }) => {
            let dataCurUser = infoData().find(item => item.id == user?.currentDataId)
            let permisson = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonSubMenu = get(permisson, 'permissonMenuEmp', {})[dataCurUser.menu]
            updateStep(chat_id, 61)
            updateData(get(dataCurUser, 'id'), { subMenu: `Yangi tovar nomi` })
            updateBack(chat_id, { text: "Sub Menuni tanlang", btn: empDynamicBtn([...SubMenu()[dataCurUser.menu].filter(item => permissonSubMenu.includes(`${item.id}`)).map(item => item.name)], 2), step: 60 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 60
        },
        next: {
            text: ({ chat_id, user }) => {
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
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            updateStep(chat_id, 700)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
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
    "Foydalanuvchilarni qidirish": {
        selfExecuteFn: ({ chat_id, }) => {
            updateStep(chat_id, 8000)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Foydalanuvchini Ismi yoki telefon raqamini yozing"
            },
            btn: async ({ chat_id, }) => {
                return
            },
        },
    },
    "Rollar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Rollarni belgilang"
            },
            btn: async ({ chat_id, user }) => {
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
            updateUser(chat_id, { selectedAdminUserStatus: 'emp' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Xodim uchun menuni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().filter(item => item.status && item.isDelete == false).map(item => {
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
            updateUser(chat_id, { selectedAdminUserStatus: 'affirmative' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Tasdiqlochi uchun menuni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().filter(item => item.status && item.isDelete == false).map(item => {
                    return { ...item, name: `${item.name} ${get(infoPermissonData, 'permissonMenuAffirmative', {})[item.id]?.length ? '✅' : ''}` }
                })
                return dataConfirmBtnEmp(chat_id,
                    menuList
                    , 1, 'empMenu')
            },
        },
    },
    "Isim Familya": {
        selfExecuteFn: async ({ chat_id, user }) => {
            let emp = infoUser().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
            await updateStep(chat_id, 704)
            let text = `Xodim : ${get(emp, 'LastName', '')} ${get(emp, 'FirstName', '')}\n\nYengi Isimni yozing`
            await updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            await sendMessageHelper(chat_id, text, empDynamicBtn())
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
    },
    "Bajaruvchi-Menular": {
        selfExecuteFn: async ({ chat_id, }) => {
            updateUser(chat_id, { selectedAdminUserStatus: 'executor' })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Bajaruvchi uchun menuni tanlang"
            },
            btn: async ({ chat_id, user }) => {
                let infoPermissonData = infoPermisson().find(item => item.chat_id == get(user, 'selectedAdminUserChatId'))
                let menuList = Menu().filter(item => item.status && item.isDelete == false).map(item => {
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
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            updateStep(chat_id, 702)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                return "Menular"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info",], 2)
            },
        },
    },
    "Menular qo'shish": {
        selfExecuteFn: ({ chat_id, }) => {
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info",], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 703)
        },
        middleware: ({ chat_id, user }) => {
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
    "Xodim menulari": {
        selfExecuteFn: ({ chat_id, user }) => {
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info",], 2)
            updateBack(chat_id, { text: "Menular", btn, step: 702 })
            updateStep(chat_id, 703)

            let allUser = infoUser()
            for (let i = 0; i < allUser.length; i++) {
                sendMessageHelper(chat_id, userInfoText({ user: allUser[i], chat_id: allUser[i].chat_id }))
            }
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 702
        },
        next: {
            text: ({ chat_id }) => {
                return "Xodim menulari"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Asosiy Menu": {
        selfExecuteFn: ({ chat_id, }) => {
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateBack(chat_id, { text: "Menular qo'shish", btn, step: 703 })
            updateStep(chat_id, 710)
        },
        middleware: ({ chat_id, user }) => {
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
            let btn = empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            updateBack(chat_id, { text: "Menular qo'shish", btn, step: 703 })
            updateStep(chat_id, 704)
        },
        middleware: ({ chat_id, user }) => {
            return get(user, 'JobTitle') == 'Admin' && user?.user_step == 703
        },
        next: {
            text: async ({ chat_id }) => {
                let menu = infoMenu()
                if (menu.length == 0) {
                    updateStep(chat_id, 703)
                }
                else {
                    await sendMessageHelper(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
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

    "Gruppalar": {
        selfExecuteFn: ({ chat_id, }) => {
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            if (infoGroup().length == 0) {
                return
            }
            sendMessageHelper(chat_id, "Gruppalar", empDynamicBtn());
            updateStep(chat_id, 7000)
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 1 && get(user, 'JobTitle') == 'Admin'
        },
        next: {
            text: ({ chat_id }) => {
                if (infoGroup().length == 0) {
                    return 'Mavjud emas'
                }
                return "Menuni tanlang"
            },
            btn: async ({ chat_id, }) => {
                if (infoGroup().length == 0) {
                    return empDynamicBtn()
                }
                let menuList = Menu().filter(item => item.status && item.isDelete == false).map(item => {
                    return { ...item, name: `${item.name}` }
                })
                return dataConfirmBtnEmp(chat_id,
                    menuList
                    , 1, 'menuGroup')
            },
        },
    },
    "Schet": {
        selfExecuteFn: async ({ chat_id, }) => {
            await updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
            await sendMessageHelper(chat_id, 'Harakatni tanlang', empDynamicBtn(['Schet biriktirish', `Schet qo'shish`, "Schet o'chirish"], 2))
        },
        middleware: ({ chat_id }) => {
            return true
        },
    },
    "Schet biriktirish": {
        selfExecuteFn: async ({ chat_id }) => {
            await updateUser(chat_id, { accountListAdmin: { status: true } })
            await updateBack(chat_id, { text: "Harakatni tanlang", btn: empDynamicBtn(['Schet biriktirish', `Schet qo'shish`, "Schet o'chirish"], 2), step: 1 })
            let btnList = Object.values(SubMenu()).flat().filter(item => get(item, 'update', []).length > 2).map(item => ({ id: `${item.id}#${item.menuId}`, name: item.name }))
            let btn = await dataConfirmBtnEmp(chat_id, btnList, 1, 'accountMenu')
            await sendMessageHelper(chat_id, 'Menularni tanlang', btn)
        },
        middleware: ({ chat_id }) => {
            return true
        },
    },
    "Schet qo'shish": {
        selfExecuteFn: async ({ chat_id, }) => {
            await updateUser(chat_id, { adminAccountStatus: true })
            await updateBack(chat_id, { text: "Harakatni tanlang", btn: empDynamicBtn(['Schet biriktirish', `Schet qo'shish`, "Schet o'chirish"], 2), step: 1 })
            let btnList = Object.keys(infoAccountList()).map(item => ({ id: item, name: item }))
            let btn = await dataConfirmBtnEmp(chat_id, btnList, 1, 'accountsListAdmin')
            await sendMessageHelper(chat_id, 'Menularni tanlang', btn)
        },
        middleware: ({ chat_id }) => {
            return true
        },
    },
    "Schet o'chirish": {
        selfExecuteFn: async ({ chat_id, }) => {
            await updateUser(chat_id, { adminAccountStatus: false })
            await updateBack(chat_id, { text: "Harakatni tanlang", btn: empDynamicBtn(['Schet biriktirish', `Schet qo'shish`, "Schet o'chirish"], 2), step: 1 })
            let btnList = Object.keys(infoAccountList()).map(item => ({ id: item, name: item }))
            let btn = await dataConfirmBtnEmp(chat_id, btnList, 1, 'accountsListAdmin')
            await sendMessageHelper(chat_id, 'Menularni tanlang', btn)
        },
        middleware: ({ chat_id }) => {
            return true
        },
    }
}


let updateAdminBtn = {
    "Menular o'zgartirish": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info",], 2)
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
                    await sendMessageHelper(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
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
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info", "Xodim menulari"], 2)
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
                    await sendMessageHelper(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
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
            let btn = empDynamicBtn(["Menular qo'shish", "Menular o'zgartirish", "Menular o'chirish", "Menular status", "Menular info", "Xodim menulari"], 2)
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
                    await sendMessageHelper(chat_id, `Active Asosiy menular ro'yxati`, empDynamicBtn())
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
    "Ma'lumotlar": {
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
                return "Vaqtni tanlang"
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn(['Kunlik', "Haftalik", 'Oylik', 'Tanlash'], 3)
            },
        },
    },
    "Kunlik": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, {
                text: "Ma'lumotlar", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik', 'Tanlash'], 3)
                , step: 702
            })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && get(user, 'user_step') == 702
        },
        next: {
            file: async ({ chat_id }) => {

                const today = moment().startOf('day');
                const tomorrow = moment(today).add(1, 'days');

                let data = infoData().filter(item => {
                    const creationDate = moment(item.creationDate);
                    return creationDate.isBetween(today, tomorrow, null, '[)') && get(item, 'full');
                }).sort((a, b) => a.ID - b.ID)


                let { objects, schema } = excelFnFormatData({ main: data })
                await writeXlsxFile(objects, {
                    schema,
                    filePath: path.join(process.cwd(), "data.xlsx")
                })
                return path.join(process.cwd(), "data.xlsx")
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "Haftalik": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, {
                text: "Ma'lumotlar", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik', 'Tanlash'], 3)
                , step: 702
            })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && get(user, 'user_step') == 702
        },
        next: {
            file: async ({ chat_id }) => {

                const startOfMonth = moment().startOf('isoWeek');
                const endOfMonth = moment().endOf('isoWeek');

                let data = infoData().filter(item => {
                    const creationDate = moment(item.creationDate);
                    return creationDate.isBetween(startOfMonth, endOfMonth, null, '[]') && get(item, 'full');
                }).sort((a, b) => a.ID - b.ID);


                let { objects, schema } = excelFnFormatData({ main: data })
                await writeXlsxFile(objects, {
                    schema,
                    filePath: path.join(process.cwd(), "data.xlsx")
                })
                return path.join(process.cwd(), "data.xlsx")
            },
            btn: async ({ chat_id, }) => {
                return
            },
        },
    },
    "Oylik": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, {
                text: "Ma'lumotlar", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik', 'Tanlash'], 3)
                , step: 702
            })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && get(user, 'user_step') == 702
        },
        next: {
            file: async ({ chat_id }) => {
                const startOfMonth = moment().startOf('month');
                const endOfMonth = moment().endOf('month');

                let data = infoData().filter(item => {
                    const creationDate = moment(item.creationDate);
                    return creationDate.isBetween(startOfMonth, endOfMonth, null, '[]') && get(item, 'full');
                }).sort((a, b) => a.ID - b.ID);


                let { objects, schema } = excelFnFormatData({ main: data })
                await writeXlsxFile(objects, {
                    schema,
                    filePath: path.join(process.cwd(), "data.xlsx")
                })
                return path.join(process.cwd(), "data.xlsx")
            },
            btn: async ({ chat_id, }) => {
                return
            },
        },
    },
    "Tanlash": {
        selfExecuteFn: ({ chat_id, }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            updateBack(chat_id, {
                text: "Ma'lumotlar", btn: empDynamicBtn(['Kunlik', "Haftalik", 'Oylik', 'Tanlash'], 3)
                , step: 702
            })
            updateStep(chat_id, 9000)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return get(user, 'JobTitle') == 'Admin' && get(user, 'user_step') == 702
        },
        next: {
            text: async ({ chat_id }) => {
                return `Boshlanish sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')}`
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
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
                    let btn = empDynamicBtn(Menu().filter(el => Object.keys(permissonMenuEmp).includes(`${el.id}`) && el.status && el.isDelete == false).map(el => el.name), 3)
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