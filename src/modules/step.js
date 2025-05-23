const { get, update } = require("lodash")
const moment = require('moment')
const { bot } = require("../config")
const b1Controller = require("../controllers/b1Controller")
const jiraController = require("../controllers/jiraController")
let { SubMenu, ocrdList, payType50, excelFnFormatData } = require("../credentials")
const { infoUser, updateUser, updateStep, updateBack, updateData, infoData, formatterCurrency, infoMenu, infoSubMenu, updateMenu, updateSubMenu, infoPermisson, deleteGroup, infoGroup, parseDate, sendMessageHelper, infoAccountPermisson, infoAccountList, writeInfoAccountList } = require("../helpers")
const { empDynamicBtn } = require("../keyboards/function_keyboards")
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards")
const { mainMenuByRoles, adminKeyboard } = require("../keyboards/keyboards")
const { dataConfirmText } = require("../keyboards/text")
const path = require('path')
const writeXlsxFile = require('write-excel-file/node')

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
            let user = infoUser().find(item => item.chat_id == chat_id)
            let list = infoData().find(item => item.id == user.currentDataId)

            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                let findComment = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
                updateStep(chat_id, 14)
                updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 13 })
            }
            updateData(user.currentDataId, { comment: msgText })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 13
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                if (user?.update) {
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
                }
                return "File jo'natasizmi ?"
            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                if (user?.update) {
                    return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                return await dataConfirmBtnEmp(chat_id, [
                    {
                        name: 'Ha', id: 1
                    },
                    { name: "Yo'q", id: 2 },
                ], 2, 'isSendFile')

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
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')} \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : ${moment().format('YYYY.MM.DD')}`, btn: empDynamicBtn(), step: 23 })
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

            let subMenuId = SubMenu()[get(data, 'menu')].find(el => el.name == get(data, 'subMenu')).id

            if (infoAccountPermisson()[get(data, 'menu')] && infoAccountPermisson()[get(data, 'menu')][subMenuId]) {
                let notAcc = Object.values(infoAccountPermisson()[get(data, 'menu')][subMenuId]).flat()
                accountList43 = accountList43.filter(item => !notAcc.includes((get(item, 'id', '') || '').toString()))
            }

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
                        let subMenuId = SubMenu()[get(list, 'menu')].find(el => el.name == get(list, 'subMenu')).id

                        if (infoAccountPermisson()[get(list, 'menu')] && infoAccountPermisson()[get(list, 'menu')][subMenuId]) {
                            let notAcc = Object.values(infoAccountPermisson()[get(list, 'menu')][subMenuId]).flat()
                            accountList43 = accountList43.filter(item => !notAcc.includes((get(item, 'id', '') || '').toString()))
                        }

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
            const regex = /^\d+(\.\d+)?$/;

            if (!regex.test(msgText)) {
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
            updateData(user.currentDataId, { summa: msgText, currencyRate: get(list, 'currencyRate', rate) })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 27
        },
        next: {
            text: async ({ chat_id, msgText }) => {

                const regex = /^\d+(\.\d+)?$/;

                if (!regex.test(msgText)) {
                    return 'Format xato yozilgan qaytadan yozing.'
                }

                // if (msgText.replace(/\D/g, '').length != msgText.length) {
                // }
                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                const regex = /^\d+(\.\d+)?$/;

                if (!regex.test(msgText)) {
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
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : SubMenu()[get(list, 'menu', 1)].find(item => item.name == get(list, 'subMenu'))?.comment
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

            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 30)
                let findComment = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.comment
                updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 29 })
            }

            updateData(user.currentDataId, { comment: msgText })

        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 29
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (user?.update) {
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
                }
                return "File jo'natasizmi ?"
            },
            btn: async ({ chat_id, msgText }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)

                if (user?.update) {
                    return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                return await dataConfirmBtnEmp(chat_id, [
                    {
                        name: 'Ha', id: 1
                    },
                    { name: "Yo'q", id: 2 },
                ], 2, 'isSendFile')

            },
        },
    },
}

let mahalliyXaridStep = {
    "41": {
        selfExecuteFn: ({ chat_id, msgText }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            let data = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(data, 'lastStep', 30))
            }
            else {
                let findComment = SubMenu()[get(data, 'menu', 2)].find(item => item.name == data.subMenu)?.comment
                updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 41 })
                updateStep(chat_id, 42)
            }
            updateData(user.currentDataId, { comment: msgText })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 41
        },
        next: {
            text: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (user?.update) {
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let info = SubMenu()[get(list, 'menu', 2)].find(item => item.name == list.subMenu).infoFn({ chat_id })
                    return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
                }
                return "File jo'natasizmi ?"

            },
            btn: async ({ chat_id, }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                if (user?.update) {
                    return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                return await dataConfirmBtnEmp(chat_id, [
                    {
                        name: 'Ha', id: 1
                    },
                    { name: "Yo'q", id: 2 },
                ], 2, 'isSendFile')

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
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')} \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : ${moment().format('YYYY.MM.DD')}`, btn: empDynamicBtn(), step: 44 })
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
            const regex = /^\d+(\.\d+)?$/;

            if (!regex.test(msgText)) {
                return
            }


            if (user?.update) {
                updateStep(chat_id, get(list, 'lastStep', 0))
            }
            else {
                updateStep(chat_id, 49)
                updateBack(chat_id, { text: `Summani yozing`, btn: empDynamicBtn(), step: 48 })
            }
            let cur = get(list, 'currency', 'UZS') == 'CNY' ? 'CNY' : 'UZS'
            let data = await b1Controller.getCurrentRate(cur, get(list, 'startDate', ''))
            let rate = get(data, '[0].Rate', 12500)
            updateData(user.currentDataId, { summa: msgText, currencyRate: rate || get(list, 'currencyRate') })
        },
        middleware: ({ chat_id }) => {
            let user = infoUser().find(item => item.chat_id == chat_id)
            return user.user_step == 48
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                const regex = /^\d+(\.\d+)?$/;

                if (!regex.test(msgText)) {
                    return 'Format xato yozilgan qaytadan yozing.'
                }

                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user.currentDataId)
                return user?.update ? dataConfirmText(SubMenu()[get(list, 'menu', 2)].find(item => item.name == list?.subMenu).infoFn({ chat_id }), 'Tasdiqlaysizmi ?', chat_id) : (list?.currencyRate ? `Kursni yozing yoki sistemni kursni tanlang` : 'Kursni yozing')
            },
            btn: async ({ chat_id, msgText }) => {
                const regex = /^\d+(\.\d+)?$/;

                if (!regex.test(msgText)) {
                    return
                }

                let user = infoUser().find(item => item.chat_id == chat_id)
                let list = infoData().find(item => item.id == user?.currentDataId)
                let cur = get(list, 'currency', 'UZS') == 'CNY' ? 'CNY' : 'UZS'

                let btn = user?.update ? list.lastBtn : (list?.currencyRate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+list?.currencyRate, cur), id: 'UZS' }], 1, 'rate') : empDynamicBtn())
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
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            let data = infoData().find(item => item.id == user.currentDataId)
            if (user?.update) {
                updateStep(chat_id, get(data, 'lastStep', 30))
            }
            else {
                let findComment = SubMenu()[get(data, 'menu', 3)].find(item => item.name == get(data, 'subMenu'))?.comment
                updateBack(chat_id, { text: findComment, btn: empDynamicBtn(), step: 61 })
                updateStep(chat_id, 62)
            }
            updateData(user.currentDataId, { comment: msgText })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 61
        },
        next: {
            text: ({ chat_id, user }) => {

                if (user?.update) {
                    let list = infoData().find(item => item.id == user.currentDataId)
                    let info = SubMenu()[get(list, 'menu', 3)].find(item => item.name == get(list, 'subMenu')).infoFn({ chat_id })
                    return dataConfirmText(info, 'Tasdiqlaysizmi ?', chat_id)
                }
                return "File jo'natasizmi"

            },
            btn: async ({ chat_id, user }) => {

                if (user?.update) {
                    return dataConfirmBtnEmp(chat_id, [{ name: 'Ha', id: 1, }, { name: 'Bekor qilish', id: 2 }, { name: "O'zgartirish", id: 3 }], 2, 'confirmEmp')
                }
                return await dataConfirmBtnEmp(chat_id, [
                    {
                        name: 'Ha', id: 1
                    },
                    { name: "Yo'q", id: 2 },
                ], 2, 'isSendFile')

            },
        },
    },
    "65": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            if (!user?.update) {
                updateBack(chat_id, { text: `1)To'lov sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')} \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : ${moment().format('YYYY.MM.DD')}`, btn: empDynamicBtn(), step: 65 })
            }
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 65
        },
        next: {
            text: async ({ chat_id, msgText, user }) => {
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
            btn: async ({ chat_id, msgText, user }) => {
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
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            if (msgText.length > 3) {
                updateStep(chat_id, 43)
                updateBack(chat_id, { text: `Xodimning ismini yozing`, btn: empDynamicBtn(), step: 80 })
                let b1Partner = await b1Controller.getPartner(msgText.toLowerCase(), [111])
                let vendorList = b1Partner.map((item, i) => {
                    return { name: `${item.CardName}`, id: item.CardCode, num: i + 1 }
                })
                updateData(user?.currentDataId, { vendorList })
            }

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 80
        },
        next: {
            text: async ({ chat_id, msgText, user }) => {
                let data = infoData().find(item => item.id == user.currentDataId)

                if (msgText.length > 3) {
                    if (data?.vendorList?.length) {
                        return `Xodim ni tanlang`
                    }
                    return `Xodim mavjud emas`
                }
                return `Xodim ni ismi 3 ta harfdan katta bo'lishi kerak`

            },
            btn: async ({ chat_id, msgText, user }) => {
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
    "704": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            if (get(user, 'selectedAdminUserChatId')) {
                await updateUser(get(user, 'selectedAdminUserChatId'), { LastName: "", FirstName: msgText })
                await sendMessageHelper(chat_id, `Foydalanuvchi ismi muvaffaqiyatli o'zgartirildi ✅`, await mainMenuByRoles({ chat_id }))
                await updateStep(chat_id, 1)
            }
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 704
        },
    },
    "705": {
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            if (!infoSubMenu().find(item => item.name == msgText)) {
                updateStep(chat_id, 706)
                let data = infoData().find(item => item.id == user.currentDataId)
                updateUser(chat_id, { newSubMenu: { ...get(user, 'newSubMenu', {}), title: msgText } })
                updateBack(chat_id, { text: 'Submenu nomini yozing', btn: empDynamicBtn(), step: 705 })
            }
        },
        middleware: ({ chat_id, user }) => {
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
    "2222": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            let accountsList = await infoAccountList()


            if (accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')].find(item => item == msgText) && get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot allaqachon mavjud")
                return
            }
            else if (!accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')].find(item => item == msgText) && !get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot topilmadi")
                return
            }


            if (get(user, 'adminAccountStatus')) {
                accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')], msgText])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli yozildi✅")
            }
            else {
                accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')].filter(item => item != msgText)])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli O'chirildi❌")
            }

        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2222
        },
    },
    "2223": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            let accountsList = await infoAccountList()


            if (accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')].find(item => item == msgText) && get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot allaqachon mavjud")
                return
            }
            else if (!accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')].find(item => item == msgText) && !get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot topilmadi")
                return
            }


            if (get(user, 'adminAccountStatus')) {
                accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')], msgText])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli yozildi✅")
            }
            else {
                accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')][get(user, 'accountListAdmin.group')][get(user, 'accountListAdmin.currency')].filter(item => item != msgText)])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli O'chirildi❌")
            }
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2223
        },
    },
    "2224": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            let accountsList = await infoAccountList()
            if (accountsList[get(user, 'accountListAdmin.name')].find(item => item == msgText) && get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot allaqachon mavjud")
                return
            }
            else if (!accountsList[get(user, 'accountListAdmin.name')].find(item => item == msgText) && !get(user, 'adminAccountStatus')) {
                await sendMessageHelper(chat_id, "Ma'lumot topilmadi")
                return
            }
            if (get(user, 'adminAccountStatus')) {
                accountsList[get(user, 'accountListAdmin.name')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')], msgText])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli yozildi✅")
            }
            else {
                accountsList[get(user, 'accountListAdmin.name')] = [...new Set([...accountsList[get(user, 'accountListAdmin.name')].filter(item => item != msgText)])]
                await writeInfoAccountList(accountsList)
                await sendMessageHelper(chat_id, "Ma'lumot muvaffaqiyatli O'chirildi❌")
            }
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 2224
        },
    },
    "706": {
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            updateStep(chat_id, 707)
            let data = infoData().find(item => item.id == user.currentDataId)
            updateUser(chat_id, { newSubMenu: { ...get(user, 'newSubMenu', {}), comment: msgText } })
            updateBack(chat_id, { text: 'Kommentariyani yozing', btn: empDynamicBtn(), step: 706 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 706
        },
        next: {
            text: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            if (!infoMenu().find(item => item.name == msgText)) {
                updateStep(chat_id, 711)
                updateUser(chat_id, { newMenu: { ...get(user, 'newMenu', {}), title: msgText } })
                updateBack(chat_id, { text: 'Asosiy Menu nomini yozing', btn: empDynamicBtn(), step: 710 })
            }
        },
        middleware: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            let type = get(user, 'updateMenu.menuType')
            let id = get(user, 'updateMenu.menuId')
            let key = get(user, 'updateMenu.key')
            type == 1 ? updateMenu(id, { name: msgText }) : updateSubMenu(id, (key == 1 ? { name: msgText } : { comment: msgText }))
            updateUser(chat_id, { back: get(user, 'back').filter(item => ![800, 801, 802].includes(+item.step)) })
            updateStep(chat_id, 800)
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 803
        },
        next: {
            text: ({ chat_id, msgText, user }) => {
                let type = get(user, 'updateMenu.menuType')
                let id = get(user, 'updateMenu.menuId')
                let menu = (type == 1) ? infoMenu().find(item => item.id == id) : infoSubMenu().find(item => item.id == id)
                sendMessageHelper(chat_id, `${type == '1' ? 'Asosiy' : 'Sub'} Menu ${get(user, 'updateMenu.key') == 1 ? 'nomi' : 'kommentariya'} o'zgartirildi ✅`)
                return `Menular o'zgartirish`
            },
            btn: async ({ chat_id, msgText }) => {
                return empDynamicBtn(["Asosiy Menu", "Sub Menu"], 2)
            },
        },
    },
    "4000": {
        selfExecuteFn: ({ chat_id, msgText, user }) => {
            let list = infoData().find(item => item.id == get(user, 'notConfirmId'))
            updateData(list.id, { notConfirmMessage: msgText })
            let newText = `${'🔴'.repeat(10)}\n`
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: get(user, 'notConfirmId') })
            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
            let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Tasdiqlovchi tasdiqlamadi ❌ ID:${list.ID}`
            let file = get(list, 'file', {})

            for (let i = 0; i < confirmativeList.length; i++) {
                sendMessageHelper(confirmativeList[i], newText + dataConfirmText(info, text, chat_id), { file })
            }
            sendMessageHelper(list.chat_id, newText + dataConfirmText(info, text, chat_id), { file })
            updateUser(chat_id, { confirmationStatus: false, user_step: 1 })
            // group
            let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
            let subMenuIdGroup = SubMenu()[get(list, 'menu')]?.find(item => item.name == get(list, 'subMenu'))
            let specialGroup = groups.filter(item => get(item, 'permissions', {})[get(list, 'menu')].find(el => el == get(subMenuIdGroup, 'id', 0)))

            for (let i = 0; i < specialGroup.length; i++) {
                sendMessageHelper(specialGroup[i].id, newText + dataConfirmText(info, text, chat_id), { file }).then((data) => {
                }).catch(e => {
                    if (get(e, 'response.body.error_code') == 403) {
                        deleteGroup(specialGroup[i].id)
                    }
                })
            }

        },
        middleware: ({ chat_id, user }) => {
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
        selfExecuteFn: ({ chat_id, msgText, isGroup, groupChatId, user }) => {
            let list = infoData().find(item => item.id == get(user, 'notConfirmId'))
            updateData(list.id, { notConfirmMessage: msgText })
            let info = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu).infoFn({ chat_id: list.chat_id, id: get(user, 'notConfirmId') })
            let newText = `${'🔴'.repeat(10)}\n`
            let file = get(list, 'file', {})

            let subMenuId = SubMenu()[get(list, 'menu', 1)].find(item => item.name == list.subMenu)?.id
            let confirmativeList = infoPermisson().filter(item => get(get(item, 'permissonMenuAffirmative', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            let text = `${get(user, 'LastName')} ${get(user, 'FirstName')} Bajaruvchi bajarmadi ❌ ID:${list.ID}`
            for (let i = 0; i < confirmativeList.length; i++) {
                sendMessageHelper(confirmativeList[i], newText + dataConfirmText(info, text, chat_id), { file })
            }

            let executorList = infoPermisson().filter(item => get(get(item, 'permissonMenuExecutor', {}), `${get(list, 'menu')}`, []).includes(`${subMenuId}`)).map(item => item.chat_id)
            for (let i = 0; i < executorList.length; i++) {
                sendMessageHelper(executorList[i], newText + dataConfirmText(info, text, chat_id), { file })
            }

            sendMessageHelper(list.chat_id, newText + dataConfirmText(info, text, chat_id), { file })
            updateUser(chat_id, { confirmationStatus: false, user_step: 1 })

            // group
            let groups = infoGroup().filter(item => get(item, 'permissions', {})[get(list, 'menu')]?.length)
            let subMenuIdGroup = SubMenu()[get(list, 'menu')]?.find(item => item.name == get(list, 'subMenu'))
            let specialGroup = groups.filter(item => get(item, 'permissions', {})[get(list, 'menu')].find(el => el == get(subMenuIdGroup, 'id', 0)))

            for (let i = 0; i < specialGroup.length; i++) {
                sendMessageHelper(specialGroup[i].id, newText + dataConfirmText(info, text, chat_id), { file }).then((data) => {
                }).catch(e => {
                    if (get(e, 'response.body.error_code') == 403) {
                        deleteGroup(specialGroup[i].id)
                    }
                })
            }

            if (isGroup) {
                sendMessageHelper(groupChatId, `Jo'natildi`)
                return
            }
        },
        middleware: ({ chat_id, isGroup, groupChatId, user }) => {
            if (isGroup) {
                adminStep['5000'].next = {}
            }
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
    "9000": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            updateBack(chat_id, { text: `Boshlanish sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')}`, btn: empDynamicBtn(), step: 9000 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 9000
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                msgText = msgText.replace(`Boshlanish sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.split(' ').filter(item => item).join('')
                const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                const dateToCheck = moment(msgText.replace(/\D/g, '')).format();
                const isValid = isValidDate(dateToCheck);
                let isV = new Date(moment(new Date()).format('L')) >= new Date(moment(dateToCheck).format('L'))

                if (isValid && msgText.replace(/\D/g, '').length == 8 && isV) {
                    updateUser(chat_id, { excelStart: msgText })
                    updateStep(chat_id, 9001)
                    return `Tugash sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')}`
                }
                return `Data formatida xatolik bor Qaytadan kiriting`
            },
            btn: async ({ chat_id, msgText }) => {
                return empDynamicBtn()
            },
        },
    },
    "9001": {
        selfExecuteFn: async ({ chat_id, msgText, user }) => {
            updateBack(chat_id, { text: `Tugash sanasi Yil.Oy.Kun : ${moment().format('YYYY.MM.DD')}`, btn: empDynamicBtn(), step: 9001 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 9001
        },
        next: {
            text: async ({ chat_id, msgText, user }) => {
                msgText = msgText.replace(`Tugash sanasi Yil.Oy.Kun :`, '')
                msgText = msgText.split(' ').filter(item => item).join('')
                const isValidDate = (...val) => !Number.isNaN(new Date(...val).valueOf());
                const dateToCheck = moment(msgText.replace(/\D/g, '')).format();
                const isValid = isValidDate(dateToCheck);
                let isV = new Date(moment(get(user, 'excelStart', '').replace(/\D/g, '')).format('L')) <= new Date(moment(dateToCheck).format('L'))
                if (isValid && msgText.replace(/\D/g, '').length == 8 && isV) {
                    updateUser(chat_id, { excelEnd: msgText })
                    updateStep(chat_id, 9002)

                    const startDate = parseDate(get(user, 'excelStart', ''));
                    const endDate = parseDate(msgText);
                    let data = infoData().filter(item => {
                        let creationDate = parseDate(moment(item.creationDate).format('YYYY.MM.DD'))
                        return (creationDate >= startDate && creationDate <= endDate)
                    }
                    )

                    if (data.length == 0) {
                        return 'Mavjud emas'
                    }
                    let { objects, schema } = excelFnFormatData({ main: data })
                    writeXlsxFile(objects, {
                        schema,
                        filePath: path.join(process.cwd(), "data.xlsx")
                    }).then(data => {
                        bot.sendDocument(chat_id, path.join(process.cwd(), "data.xlsx"))
                    }).catch(e => {
                        return "Exelga yuklashda muommo"
                    })

                    return `Boshlanish sanasi : ${moment(get(user, 'excelStart', '').replace(/\D/g, '')).format('L')}\nTugash sanasi : ${moment(msgText.replace(/\D/g, '')).format('L')}`
                }
                return `Data formatida xatolik bor Qaytadan kiriting`
            },
            btn: async ({ chat_id, msgText }) => {
                return empDynamicBtn()
            },
        },
    },
    "8000": {
        selfExecuteFn: async ({ chat_id, msgText }) => {
            updateBack(chat_id, { text: "Asosiy Menu", btn: adminKeyboard, step: 1 })
        },
        middleware: ({ chat_id, user }) => {
            return user.user_step == 8000
        },
        next: {
            text: async ({ chat_id, msgText }) => {
                return `Foydalanuvchilar ro'yxati`
            },
            btn: async ({ chat_id, msgText }) => {

                let user = infoUser().filter(item => item.JobTitle !== 'Admin' && (`${item.LastName.toLowerCase()} ${item.FirstName.toLowerCase()}`.includes(msgText.toLowerCase()) || item.MobilePhone.includes(msgText)))
                return dataConfirmBtnEmp(chat_id, user.map(item => {
                    return {
                        name: `${item.LastName} ${item.FirstName}`, id: item.chat_id
                    }
                }), 1, 'adminUsers')
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