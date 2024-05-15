const { get, update } = require("lodash")
const moment = require('moment')
const { bot } = require("../config")
const b1Controller = require("../controllers/b1Controller")
const jiraController = require("../controllers/jiraController")
let { SubMenu, ocrdList, payType50 } = require("../credentials")
const { infoUser, updateUser, updateStep, updateBack, updateData, infoData, formatterCurrency, infoMenu, infoSubMenu, updateMenu, updateSubMenu, infoPermisson, deleteGroup, infoGroup } = require("../helpers")
const { empDynamicBtn } = require("../keyboards/function_keyboards")
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards")
const { mainMenuByRoles } = require("../keyboards/keyboards")
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
                    let subMenu = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
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
            let findComment = SubMenu()[get(data, 'menu', 1)].find(item => item.name == data.subMenu)?.comment
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
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },

    "21": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            if (msgText.length > 3) {
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateBack(chat_id, { text: `Yetkazib beruvchi ni ismini yozing`, btn: empDynamicBtn(), step: 21 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase(), [101, 106])
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
                        return `Yetkazib beruvchi ni tanlang`
                    }
                    return `Yetkazib beruvchi mavjud emas`
                }
                return `Yetkazib beruvchi ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(chat_id, data?.vendorList, 1, 'partnerSearch')
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
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`, btn: empDynamicBtn(), step: 23 })
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
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)
                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu()[get(data, 'menu', 1)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
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
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)

                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count != 2) {
                    return empDynamicBtn()
                }
                let btn = user?.update ? data.lastBtn : empDynamicBtn()
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
                    let subMenu = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)
                    if (get(subMenu, 'jira.statusId', '') ? (statusId == get(subMenu, 'jira.statusId', '')) : true) {
                        if (user?.update) {
                            updateStep(chat_id, get(list, 'lastStep', 30))
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
                            if (list?.accountList43?.length) {
                                let user = infoUser().find(item => item.chat_id == chat_id)
                                let list = infoData().find(item => item.id == user?.currentDataId)
                                let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, list?.accountList43.sort((a, b) => a.id - b.id), 1, 'account')
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

                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : `Hisob (qayerdan)`
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                if (data?.accountList43?.length) {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let list = infoData().find(item => item.id == user?.currentDataId)
                    let btn = user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, data?.accountList43.sort((a, b) => a.id - b.id), 1, 'account')
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
            if (msgText.replace(/\D/g, '').length != msgText.length) {
                return
            }
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 30))
            }
            else {
                updateStep(chat_id, 28)
                let btn = empDynamicBtn()
                updateBack(chat_id, { text: `Summani kiriting`, btn, step: 27 })
            }
            let data = await b1Controller.getCurrentRate('CNY', get(list, 'startDate', ''))
            let rate = get(data, '[0].Rate', 12500)
            updateData(user.currentDataId, { summa: msgText.replace(/\D/g, ''), currencyRate: get(list, 'currencyRate', rate) })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 27
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                if (msgText.replace(/\D/g, '').length != msgText.length) {
                    return 'Format xato yozilgan qaytadan yozing.'
                }
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                if (msgText.replace(/\D/g, '').length != msgText.length) {
                    return
                }
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : (list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn())
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
                let btn = list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn()
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
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
            let findComment = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
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
                let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, msgText }) => {
                return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
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
            let findComment = SubMenu()[get(data, 'menu', 2)].find(item => item.name == data.subMenu)?.comment
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
                let info = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },
    "42": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            if (msgText.length > 3) {
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateStep(chat_id, 43)
                updateBack(chat_id, { text: `Yetkazib beruvchi ni ismini yozing`, btn: empDynamicBtn(), step: 42 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase(), [113, 107])
                let vendorList = b1Partner.map((item, i) => {
                    return { name: `${item.CardName} - ${item.GroupCode == 113 ? 'Korxona' : "Do'kon"}`, id: item.CardCode, num: i + 1 }
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
                        return `Yetkazib beruvchi ni tanlang`
                    }
                    return `Yetkazib beruvchi mavjud emas`
                }
                return `Yetkazib beruvchi ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(chat_id, data?.vendorList, 1, 'partnerSearch')
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
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`, btn: empDynamicBtn(), step: 44 })
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
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)

                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true

                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu()[get(data, 'menu', 1)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
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
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)

                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true

                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count != 2) {
                    return empDynamicBtn()
                }

                let btnList = payType50
                let btn = user?.update ? data.lastBtn : await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                updateUser(chat_id, { update: false })
                return btn
            },
        },
    },
    "48": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)
            if (msgText.replace(/\D/g, '').length != msgText.length) {
                return
            }
            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 49)
                updateBack(chat_id, { text: `Summani yozing`, btn: empDynamicBtn(), step: 48 })
            }
            let data = await b1Controller.getCurrentRate('UZS', get(list, 'startDate', ''))
            let rate = get(data, '[0].Rate', 12500)
            updateData(user.currentDataId, { summa: msgText.replace(/\D/g, ''), currencyRate: get(list, 'currencyRate', rate) })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 48
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                if (msgText.replace(/\D/g, '').length != msgText.length) {
                    return 'Format xato yozilgan qaytadan yozing.'
                }
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                if (msgText.replace(/\D/g, '').length != msgText.length) {
                    return
                }
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let btn = user?.update ? list.lastBtn : (list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'UZS'), id: 'UZS' }], 1, 'rate') : empDynamicBtn())
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
                let btn = list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
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
                updateStep(chat_id, get(list, 'lastStep', 1))
            }
            else {
                // updateStep(chat_id, (list.menu == 1 && list.menuName == 'Xorijiy xarid') ? get(list, 'lastStep', 0) : 51)
                updateStep(chat_id, 51)
                let findComment = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu)?.comment
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

                return (user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : 'Hisob nuqtasini tanlang')
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)

                let btn = (user?.update ? list.lastBtn : await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'))
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
            let findComment = SubMenu()[get(data, 'menu', 3)].find(item => item.name == data.subMenu)?.comment
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
                let info = SubMenu()[get(list, 'menu', 3)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
            },
        },
    },
    "65": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            if (!user?.update) {
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`, btn: empDynamicBtn(), step: 65 })
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
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)

                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    console.log(dateToCheck, isValid)
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true
                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count == 2) {
                    updateData(user.currentDataId, { startDate: msgText[0], endDate: msgText[1] })
                    if (user?.update) {
                        let info = SubMenu()[get(data, 'menu', 3)].find(item => item.name == data.subMenu).infoFn({ chat_id })
                        updateStep(chat_id, get(data, 'lastStep', 30))
                        return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
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
                let data = infoData().find(item => item.id == user.currentDataId)
                msgText = msgText.replace(`1)To'lov sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.replace(`\n2)Hisobot To'lov sanasi Yil.Oy.Kun  :`, '')
                msgText = msgText.split(' ').filter(item => item)

                let count = 0
                for (let i = 0; i < msgText.length; i++) {
                    const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                    const dateToCheck = moment(msgText[i].replace(/\D/g, '')).format();
                    const isValid = isValidDate(dateToCheck);
                    let isV = (i == 0) ? new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L')) : true

                    if (isValid && msgText[i].replace(/\D/g, '').length == 8 && isV) {
                        count += 1
                    }
                }
                if (count != 2) {
                    return empDynamicBtn()
                }
                let btnList = payType50
                let btn = user?.update ? data.lastBtn : await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
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
                updateBack(chat_id, { text: `Xodimning ismini yozing`, btn: empDynamicBtn(), step: 80 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase(), [111])
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
                        return `Xodim ni tanlang`
                    }
                    return `Xodim mavjud emas`
                }
                return `Xodim ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return await dataConfirmBtnEmp(chat_id, data?.vendorList, 1, 'partnerSearch')
                    }
                }
                return empDynamicBtn()
            },
        },
    },
}

let adminStep = {
    "705": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            if (!infoSubMenu().find(item => item.name == msgText)) {
                updateStep(chat_id, 706)
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                updateUser(chat_id, { newSubMenu: { ...get(user, 'newSubMenu', {}), title: msgText } })
                updateBack(chat_id, { text: 'Submenu nomini yozing', btn: empDynamicBtn(), step: 705 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 705
        },
        next: {
            text: ({ chat_id, msgText }) => {
                if (!infoSubMenu().find(item => item.name == msgText)) {
                    return 'Kommentariyani yozing'
                }
                return 'Sub Menu mavjud'
            },
            btn: async ({ chat_id, }) => {
                return empDynamicBtn()
            },
        },
    },
    "706": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            updateStep(chat_id, 707)
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            updateUser(chat_id, { newSubMenu: { ...get(user, 'newSubMenu', {}), comment: msgText } })
            updateBack(chat_id, { text: 'Kommentariyani yozing', btn: empDynamicBtn(), step: 706 })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 706
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let info = [
                    {
                        name: 'Asosiy Menu Nomi',
                        message: infoMenu().find(item => item.id == get(user, 'newSubMenu.menu', 0))?.name
                    },
                    {
                        name: 'Sub Menu Nomi',
                        message: get(user, 'newSubMenu.title', 0)
                    },
                    {
                        name: 'Kommentariya',
                        message: get(user, 'newSubMenu.comment', 0)
                    },
                ]
                return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
            },
            btn: async ({ chat_id, }) => {
                return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }], 2, 'confirmAdminSubMenu')
            },
        },
    },
    "710": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            if (!infoMenu().find(item => item.name == msgText)) {
                updateStep(chat_id, 711)
                let user = infoUser().find(item => item.chat_id == chat_id)
                updateUser(chat_id, { newMenu: { ...get(user, 'newMenu', {}), title: msgText } })
                updateBack(chat_id, { text: 'Asosiy Menu nomini yozing', btn: empDynamicBtn(), step: 710 })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 710
        },
        next: {
            text: ({ chat_id, msgText }) => {
                if (!infoMenu().find(item => item.name == msgText)) {
                    let info = [
                        {
                            name: 'Asosiy Menu Nomi',
                            message: msgText
                        }
                    ]
                    return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
                }
                return 'Bu Menu mavjud'
            },
            btn: async ({ chat_id, msgText }) => {
                if (!infoMenu().find(item => item.name == msgText)) {
                    return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }], 2, 'confirmAdminMenu')
                }
                return empDynamicBtn()
            },
        },
    },
    "803": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let type = get(user, 'updateMenu.menuType')
            let id = get(user, 'updateMenu.menuId')
            let key = get(user, 'updateMenu.key')
            type == 1 ? updateMenu(id, { name: msgText }) : updateSubMenu(id, (key == 1 ? { name: msgText } : { comment: msgText }))
            updateUser(chat_id, { back: get(user, 'back').filter(item => ![800, 801, 802].includes(+item.step)) })
            updateStep(chat_id, 800)
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 803
        },
        next: {
            text: ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let type = get(user, 'updateMenu.menuType')
                let id = get(user, 'updateMenu.menuId')
                let menu = (type == 1) ? infoMenu().find(item => item.id == id) : infoSubMenu().find(item => item.id == id)
                bot.sendMessage(chat_id, `${type == '1' ? 'Asosiy' : 'Sub'} Menu ${get(user, 'updateMenu.key') == 1 ? 'nomi' : 'kommentariya'} o'zgartirildi ✅`)
                return `Menular o'zgartirish`
            },
            btn: async ({ chat_id, msgText }) => {
                return empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            },
        },
    },
    "4000": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == get(user, 'notConfirmId'))
            updateData(list.id, { notConfirmMessage: msgText })
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: get(user, 'notConfirmId') })
            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
            let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Tasdiqlovchi tasdiqlamadi ❌ ID:${list.ID}`
            for (let i = 0; i < confirmativeList.length; i++) {
                bot.sendMessage(confirmativeList[i], dataConfirmText(info, text, chat_id))
            }
            bot.sendMessage(list.chat_id, dataConfirmText(info, text, chat_id))
            updateUser(chat_id, { confirmationStatus: false })
            // group
            let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
            let subMenuIdGroup = SubMenu()[get(list, 'menu')]?.find(item => item.name == get(list, 'subMenu'))
            let specialGroup = groups.filter(item => get(item, 'permissions', {})[get(list, 'menu')].find(el => el == get(subMenuIdGroup, 'id', 0)))

            for (let i = 0; i < specialGroup.length; i++) {
                bot.sendMessage(specialGroup[i].id, dataConfirmText(info, text, chat_id)).then((data) => {
                }).catch(e => {
                    if (get(e, 'response.body.error_code') == 403) {
                        deleteGroup(specialGroup[i].id)
                    }
                })
            }

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 4000
        },
        next: {
            text: ({ chat_id, msgText }) => {
                return `Jo'natildi ✅`
            },
            btn: async ({ chat_id, msgText }) => {
                return mainMenuByRoles({ chat_id })
            },
        },
    },
    "5000": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == get(user, 'notConfirmId'))
            updateData(list.id, { notConfirmMessage: msgText })
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: get(user, 'notConfirmId') })

            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
            let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi tasdiqlamadi ❌ ID:${list.ID}`
            for (let i = 0; i < confirmativeList.length; i++) {
                bot.sendMessage(confirmativeList[i], dataConfirmText(info, text, chat_id))
            }

            let executerList = infoPermisson().filter(item => get(get(item, 'permissonMenuExecutor', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            for (let i = 0; i < executerList.length; i++) {
                bot.sendMessage(executerList[i], dataConfirmText(info, text, chat_id))
            }

            bot.sendMessage(list.chat_id, dataConfirmText(info, text, chat_id))
            updateUser(chat_id, { confirmationStatus: false })

            // group
            let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
            let subMenuIdGroup = SubMenu()[get(list, 'menu')]?.find(item => item.name == get(list, 'subMenu'))
            let specialGroup = groups.filter(item => get(item, 'permissions', {})[get(list, 'menu')].find(el => el == get(subMenuIdGroup, 'id', 0)))

            for (let i = 0; i < specialGroup.length; i++) {
                bot.sendMessage(specialGroup[i].id, dataConfirmText(info, text, chat_id)).then((data) => {
                }).catch(e => {
                    if (get(e, 'response.body.error_code') == 403) {
                        deleteGroup(specialGroup[i].id)
                    }
                })
            }
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 5000
        },
        next: {
            text: ({ chat_id, msgText }) => {
                return `Jo'natildi ✅`
            },
            btn: async ({ chat_id, msgText }) => {
                return mainMenuByRoles({ chat_id })
            },
        },
    },
}

module.exports = {
    xorijiyXaridStep,
    mahalliyXaridStep,
    tolovHarajatStep,
    adminStep
}