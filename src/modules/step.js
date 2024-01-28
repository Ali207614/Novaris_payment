const { get, update } = require("lodash")
const moment = require('moment')
const b1Controller = require("../controllers/b1Controller")
const jiraController = require("../controllers/jiraController")
const { SubMenu, ocrdList } = require("../credentials")
const { infoUser, updateUser, updateStep, updateBack, updateData, infoData, formatterCurrency } = require("../helpers")
const { empDynamicBtn } = require("../keyboards/function_keyboards")
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards")
const { empMenuKeyboard } = require("../keyboards/keyboards")
const { dataConfirmText } = require("../keyboards/text")

let xorijiyXaridStep = {
    "12": {
        selfExecuteFn: ({ chat_id, msgText }) => {
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 12
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let jira = await jiraController.getTicketById({ issueKey: msgText })
                if (jira?.status) {
                    let statusId = get(jira, 'data.fields.status.id', 0)
                    let subMenu = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    if (get(subMenu, 'jira.statusId', '') ? (statusId == get(subMenu, 'jira.statusId', '')) : true) {
                        if (user?.update) {
                            updateStep(chat_id, list.lastStep)
                        }
                        else {
                            updateStep(chat_id, 13)
                            updateBack(chat_id, { text: "Ticket raqamini kiriting", btn: empDynamicBtn(), step: 12 })
                        }
                        updateData(user.currentDataId, { ticket: msgText })
                        xorijiyXaridStep['12'].next.btn = () => {
                            let btn = user?.update ? list.lastBtn : empDynamicBtn()
                            updateUser(chat_id, { update: false })
                            return btn
                        }
                    }
                    else {
                        xorijiyXaridStep['12'].next.btn = () => {
                            let btn = empDynamicBtn()
                            updateUser(chat_id, { update: false })
                            return btn
                        }
                        return `This task is not defined `
                    }
                } else {
                    xorijiyXaridStep['12'].next.btn = () => {
                        let btn = empDynamicBtn()
                        updateUser(chat_id, { update: false })
                        return btn
                    }
                    return `${jira.message}`
                }
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)

                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "13": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            updateStep(chat_id, 14)
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            updateData(user.currentDataId, { comment: msgText })
            let findComment = SubMenu[get(data, 'menu', 1)].find(item => item.name == data.subMenu)?.comment
            updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 13 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 13
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?')
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },

    "21": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            if (msgText.length > 3) {
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni ismini yozing`, btn: empDynamicBtn(), step: 21 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase())
                let vendorList = b1Partner.map((item, i) => {
                    return { name: `${item.CardName}`, id: item.CardCode, num: i + 1 }
                })
                updateData(user?.currentDataId, { vendorList })
            }

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            return user.user_step == 21 && data.documentType == false
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        updateStep(chat_id, 22)
                        return `Поставщик (Yetkazib beruvchi) ni tanlang`
                    }
                    return `Поставщик (Yetkazib beruvchi) mavjud emas`
                }
                return `Поставщик (Yetkazib beruvchi) ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(data?.vendorList, 1, 'partnerSearch')
                    }
                }
                return empDynamicBtn()
            },
        },
    },
    "23": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (!user?.update) {
                updateBack(chat_id, { text: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`, btn: empDynamicBtn(), step: 23 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 23
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)
                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu[get(data, 'menu', 1)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?')
                    }
                    else {
                        updateStep(chat_id, 24)
                        return "Ticket raqamini kiriting"
                    }
                }
                return `Data formatida xatolik bor Qaytadan kiriting`
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "24": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)

            if (user?.update) {
                updateStep(chat_id, get(data, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 25)
                updateBack(chat_id, { text: `Ticket raqamini kiriting`, btn: empDynamicBtn(), step: 24 })
            }
            let b1Account43 = await b1Controller.getAccount43()
            let accountList43 = b1Account43?.map((item, i) => {
                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
            })
            updateData(user?.currentDataId, { ticket: msgText, accountList43 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 24
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let jira = await jiraController.getTicketById({ issueKey: msgText })
                if (jira?.status) {
                    let statusId = get(jira, 'data.fields.status.id', 0)
                    let subMenu = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    if (get(subMenu, 'jira.statusId', '') ? (statusId == get(subMenu, 'jira.statusId', '')) : true) {
                        if (user?.update) {
                            updateStep(chat_id, get(data, 'lastStep', 30))
                        }
                        else {
                            updateStep(chat_id, 25)
                            updateBack(chat_id, { text: `Ticket raqamini kiriting`, btn: empDynamicBtn(), step: 24 })
                        }
                        let b1Account43 = await b1Controller.getAccount43()
                        let accountList43 = b1Account43?.map((item, i) => {
                            return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                        })
                        updateData(user?.currentDataId, { ticket: msgText, accountList43 })
                        xorijiyXaridStep['24'].next.btn = async () => {
                            if (data?.accountList43?.length) {
                                let user = infoUser().find(item => item.chat_id == chat_id)
                                let list = infoData().find(item => item.id == user?.currentDataId)
                                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(data?.accountList43.sort((a, b) => a.id - b.id), 1, 'account')
                                updateUser(chat_id, { update: false })
                                return btn
                            }
                            return empDynamicBtn()
                        }
                    }
                    else {
                        xorijiyXaridStep['24'].next.btn = () => {
                            let btn = empDynamicBtn()
                            updateUser(chat_id, { update: false })
                            return btn
                        }
                        return `This task is not defined `
                    }
                } else {
                    xorijiyXaridStep['24'].next.btn = () => {
                        let btn = empDynamicBtn()
                        updateUser(chat_id, { update: false })
                        return btn
                    }
                    return `${jira.message}`
                }

                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : `Schetni tanlang`
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                if (data?.accountList43?.length) {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(data?.accountList43.sort((a, b) => a.id - b.id), 1, 'account')
                    updateUser(chat_id, { update: false })
                    return btn
                }
                return empDynamicBtn()
            },
        },
    },
    "27": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 28)
                let btn = empDynamicBtn()
                updateBack(chat_id, { text: `Summani kiriting`, btn, step: 27 })
            }
            let data = await b1Controller.getCurrentRate('CNY')
            let rate = data[0]?.Rate
            updateData(user.currentDataId, { summa: msgText, currencyRate: rate })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 27
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : (list?.currencyRate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+list?.currencyRate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn())
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "28": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
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
            updateData(user.currentDataId, { currencyRate: msgText })

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 28
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "29": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            updateStep(chat_id, 30)
            updateData(user.currentDataId, { comment: msgText })
            let findComment = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
            updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 29 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 29
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?')
            },
            btn: async ({ chat_id, msgText }) => {
                return dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },
}

let mahalliyXaridStep = {
    "41": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            updateStep(chat_id, 42)
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            updateData(user.currentDataId, { comment: msgText })
            let findComment = SubMenu[get(data, 'menu', 2)].find(item => item.name == data.subMenu)?.comment
            updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 41 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?')
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },
    "42": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            if (msgText.length > 3) {
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateStep(chat_id, 43)
                updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni ismini yozing`, btn: empDynamicBtn(), step: 42 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase())
                let vendorList = b1Partner.map((item, i) => {
                    return { name: `${item.CardName}`, id: item.CardCode, num: i + 1 }
                })
                updateData(user?.currentDataId, { vendorList })
            }

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 42
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return `Поставщик (Yetkazib beruvchi) ni tanlang`
                    }
                    return `Поставщик (Yetkazib beruvchi) mavjud emas`
                }
                return `Поставщик (Yetkazib beruvchi) ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(data?.vendorList, 1, 'partnerSearch')
                    }
                }
                return empDynamicBtn()
            },
        },
    },
    "44": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (!user?.update) {
                updateBack(chat_id, { text: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`, btn: empDynamicBtn(), step: 44 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 44
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)
                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu[get(data, 'menu', 1)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?')
                    }
                    else {
                        updateStep(chat_id, 45)
                        return "To'lov usullarini tanlang"
                    }
                }
                return `Data formatida xatolik bor Qaytadan kiriting`
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btnList = [{ name: 'Naqd', id: 'Naqd' }, { name: 'Karta', id: 'Karta' }, { name: 'Terminal', id: 'Terminal' }, { name: `O'tkazma`, id: `O'tkazma` }]
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(btnList, 2, 'payType')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "48": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 49)
                updateBack(chat_id, { text: `Summani yozing`, btn: empDynamicBtn(), step: 48 })
            }
            let data = await b1Controller.getCurrentRate('UZS')
            let rate = data[0]?.Rate
            updateData(user.currentDataId, { summa: msgText, currencyRate: rate })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 48
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : (list?.currencyRate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+list?.currencyRate, 'UZS'), id: 'UZS' }], 1, 'rate') : empDynamicBtn())
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "49": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 50)
                let btn = list?.currencyRate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+list?.currencyRate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
                updateBack(chat_id, { text: list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing', btn, step: 49 })
            }
            updateData(user.currentDataId, { currencyRate: msgText })

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 49
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : empDynamicBtn()
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "50": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, (list.menu == 1 && list.menuName == 'Xorijiy xarid') ? get(list, 'lastStep', 0) : 51)
                let findComment = SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
                let btn = empDynamicBtn()
                updateBack(chat_id, { text: findComment, btn, step: 50 })
            }
            updateData(user.currentDataId, { comment: msgText })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 50
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return (list.menu == 1 && list.menuName == 'Xorijiy xarid') ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : (user?.update ? dataConfirmText(SubMenu[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?') : 'Hisob nuqtasini tanlang')
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = (list.menu == 1 && list.menuName == 'Xorijiy xarid') ? await dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp') : (user?.update ? list.lastBtn : await dataConfirmBtnEmp(ocrdList, 1, 'point'))
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    }
}

let tolovHarajatStep = {
    "61": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            updateStep(chat_id, 62)
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            updateData(user.currentDataId, { comment: msgText })
            let findComment = SubMenu[get(data, 'menu', 3)].find(item => item.name == data.subMenu)?.comment
            updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 61 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                let info = SubMenu[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?')
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp([{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },
    "65": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (!user?.update) {
                updateBack(chat_id, { text: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`, btn: empDynamicBtn(), step: 65 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 65
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)
                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu[get(data, 'menu', 3)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?')
                    }
                    else {
                        updateStep(chat_id, 45)
                        return "To'lov usullarini tanlang"
                    }
                }
                return `Data formatida xatolik bor Qaytadan kiriting`
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btnList = [{ name: 'Naqd', id: 'Naqd' }, { name: 'Karta', id: 'Karta' }, { name: 'Terminal', id: 'Terminal' }, { name: `O'tkazma`, id: `O'tkazma` }]
                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(btnList, 2, 'payType')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "80": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            if (msgText.length > 3) {
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateStep(chat_id, 43)
                updateBack(chat_id, { text: `Поставщик (Yetkazib beruvchi) ni ismini yozing`, btn: empDynamicBtn(), step: 80 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase())
                let vendorList = b1Partner.map((item, i) => {
                    return { name: `${item.CardName}`, id: item.CardCode, num: i + 1 }
                })
                updateData(user?.currentDataId, { vendorList })
            }

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 80
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return `Поставщик (Yetkazib beruvchi) ni tanlang`
                    }
                    return `Поставщик (Yetkazib beruvchi) mavjud emas`
                }
                return `Поставщик (Yetkazib beruvchi) ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(data?.vendorList, 1, 'partnerSearch')
                    }
                }
                return empDynamicBtn()
            },
        },
    },
}


module.exports = {
    xorijiyXaridStep,
    mahalliyXaridStep,
    tolovHarajatStep
}