const { get, update } = require("lodash")
const b1Controller = require("../controllers/b1Controller")
const { infoUser, infoData, formatterCurrency, updateData, infoMenu, infoSubMenu, infoPermisson } = require("../helpers")
const { empDynamicBtn } = require("../keyboards/function_keyboards")
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards")
let moment = require('moment')
let Menu = () => {
    return [
        {
            name: 'Xorijiy xarid',
            status: true, isDelete: false,
            id: 1
        },
        {
            name: 'Mahalliy xarid',
            status: true, isDelete: false,
            id: 2
        },
        {
            name: "To'lov/Xarajat",
            status: true, isDelete: false,
            id: 3
        },
        {
            name: "Shartnoma",
            status: true, isDelete: false,
            id: 4
        },
        {
            name: "Narx chiqarish",
            status: true, isDelete: false,
            id: 5
        },
        {
            name: "Boshqa",
            status: true, isDelete: false,
            id: 6
        },
        ...infoMenu()
    ]
}

let newMenu = [
    {
        name: 'Xorijiy xarid',
        status: true, isDelete: false,
        id: 1
    },
    {
        name: 'Mahalliy xarid',
        status: true, isDelete: false,
        id: 2
    },
    {
        name: "To'lov/Xarajat",
        status: true, isDelete: false,
        id: 3
    },
    {
        name: "Shartnoma",
        status: true, isDelete: false,
        id: 4
    },
    {
        name: "Narx chiqarish",
        status: true, isDelete: false,
        id: 5
    },
    {
        name: "Boshqa",
        status: true, isDelete: false,
        id: 6
    },
]

let payType50 = [
    { name: 'Naqd', id: 'Naqd' },
    { name: 'Karta', id: 'Karta' },
    // { name: 'Terminal', id: 'Terminal' }, 
    // { name: `O'tkazma`, id: `O'tkazma` }
]

let SubMenu = () => {
    let newSubMenus = {}
    let subMenuList = infoSubMenu()
    for (let i = 0; i < subMenuList.length; i++) {
        let item = subMenuList[i]
        if (newSubMenus[item.menuId]?.length) {
            newSubMenus[item.menuId].push({
                ...item, menuId: Number(item.menuId), infoFn: eval(item.infoFn), update: [{ ...item.update[0], btn: eval(item.update[0].btn) }]
            })
        }
        else {
            newSubMenus[item.menuId] = [{
                ...item, infoFn: eval(item.infoFn), update: [{ ...item.update[0], btn: eval(item.update[0].btn) }]
            }]
        }
    }
    let menuCred = {
        1: [
            {
                name: 'Xorijiy xarid konteyner buyurtmasi',
                comment: "Transport buyurtma.\n1) Ticket raqami: \n2) Sana:\n3) Yetkazib beruvchi\n4) Tovar nomi:\n5) Tovar ortilish reja sanasi:\n\n6) Alternative-1 (Lisa):\n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: Yurishdan oldin;\n3) Yurish Muddati: 20-25.05.2021; \n\n7) Alternative-2 (Lancy): \n1) To'lov summasi: xyz Yuan;\n2)  To'lov muddati: 01.06.2021 Yetib kelgandan keyin; \n3) Yurish Muddati: May boshi (aniq etmayapti)\n\n8) Alternative-3 (Misha):\n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: 10.05.2021\n\n9) Izoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#kontener\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Transport buyurtma.\n1) Ticket raqami: \n2) Sana:\n3) Yetkazib beruvchi\n4) Tovar nomi:\n5) Tovar ortilish reja sanasi:\n\n6) Alternative-1 (Lisa):\n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: Yurishdan oldin;\n3) Yurish Muddati: 20-25.05.2021; \n\n7) Alternative-2 (Lancy): \n1) To'lov summasi: xyz Yuan;\n2)  To'lov muddati: 01.06.2021 Yetib kelgandan keyin; \n3) Yurish Muddati: May boshi (aniq etmayapti)\n\n8) Alternative-3 (Misha):\n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: 10.05.2021\n\n9) Izoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#kontener\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "Ticket raqami",
                        message: 'Ticket raqamini kiriting',
                        btn: () => empDynamicBtn(),
                        step: '12'
                    },
                    {
                        id: 3,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                jira: {
                    statusId: '10032',
                    transitionId: '11',
                    operationsList: { comment: true, transition: true, date: false }
                },
                updateLine: 2,
                lastStep: 14,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'Ticket raqami', message: data?.ticket }, { name: 'Izoh', message: data?.comment }]

                    return info
                }
            },
            {
                name: 'Xorijiy xarid mashina buyurtmasi',
                comment: "AvtoTransport buyurtma.\n1) Ticket raqami: \n2) Sana:\n3) Yetkazib beruvchi\n4) Tovar Kodi :  (80851)\n5) Tovar ortilish reja sanasi:\n\n6) Yetkazib beruvchi ( Baliq Urumchi ):\n1) To'lov summasi: xyz Yuan;\n2) Tovar og'irligi: \n3) Bir tonna uchun kelishilgan narx : \n4) Paddonlar soni : \n5) Yetkazib berish Manzil : (乌鲁木齐市天山区延安路662号边疆宾馆海关监管库888库房7区 ) Ali aka sklad\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `AvtoTransport buyurtma.\n1) Ticket raqami: \n2) Sana:\n3) Yetkazib beruvchi\n4) Tovar Kodi :  (80851)\n5) Tovar ortilish reja sanasi:\n\n6) Yetkazib beruvchi ( Baliq Urumchi ):\n1) To'lov summasi: xyz Yuan;\n2) Tovar og'irligi: \n3) Bir tonna uchun kelishilgan narx : \n4) Paddonlar soni : \n5) Yetkazib berish Manzil : (乌鲁木齐市天山区延安路662号边疆宾馆海关监管库888库房7区 ) Ali aka sklad\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "Ticket raqami",
                        message: 'Ticket raqamini kiriting',
                        btn: () => empDynamicBtn(),
                        step: '12'
                    },
                    {
                        id: 3,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                jira: {
                    statusId: '10031',
                    transitionId: '81',
                    operationsList: { comment: true, transition: true, date: false }
                },
                updateLine: 2,
                lastStep: 14,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'Ticket raqami', message: data?.ticket }, { name: 'Izoh', message: data?.comment }]
                    return info
                }
            },
            {
                name: 'Xorijiy xarid tovar buyurtmasi',
                comment: "1) Sana:\n2) Zakaz nomeri: \n3) Yetkazib beruvchi:\n4) Tovar nomi:\n5) Zaklad summasi:\n6) Tovar summasi:\n7) To'lov kelishuv sharti: \n8) Tayyor bo'lish muddati:\n9) Buyurtma necha kunda qilingan:\n10) Brend qilinishi yoki qilinmasligi: FERRO/TISCO\n11) To'lov usuli: RMB / USD\n\n12) Izoh: \n\n#zakaz\n#24462IO(zakaz nomeri)",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `1) Sana:\n2) Zakaz nomeri: \n3) Yetkazib beruvchi:\n4) Tovar nomi:\n5) Zaklad summasi:\n6) Tovar summasi:\n7) To'lov kelishuv sharti: \n8) Tayyor bo'lish muddati:\n9) Buyurtma necha kunda qilingan:\n10) Brend qilinishi yoki qilinmasligi: FERRO/TISCO\n11) To'lov usuli: RMB/USD\n\n12) Izoh:\n\n#zakaz\n#24462IO(zakaz nomeri)`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "Ticket raqami",
                        message: 'Ticket raqamini kiriting',
                        btn: () => empDynamicBtn(),
                        step: '12'
                    },
                    {
                        id: 3,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 2,
                lastStep: 14,
                jira: {
                    statusId: '10009',
                    transitionId: '31',
                    operationsList: { comment: true, transition: true, date: true }
                },
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'Ticket raqami', message: data?.ticket }, { name: 'Izoh', message: data?.comment }]
                    return info
                }
            },
            {
                name: "Xorijiy xarid to'lovi",
                comment: `Tovar nomi:\nZakaz nomeri:\nTo'lov turi: (zaklad, tovar uchun, kontener uchun, rasxod uchun kabi)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#tolov\n#21059MY(Zakaz nomeri)\n`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '20'
                    },
                    // {
                    //     id: 2,
                    //     name: "Hujjat turi (Hisob,Yetkazib beruvchi)",
                    //     message: 'Hujjat turi ni tanlang',
                    //     btn: () => empDynamicBtn([`Hisob`, `Yetkazib beruvchi`], 2),
                    //     step: '21'
                    // },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '23'
                    },
                    {
                        id: 4,
                        name: "Ticket raqami",
                        message: `Ticket raqamini kiriting`,
                        btn: () => empDynamicBtn(),
                        step: '24'
                    },
                    {
                        id: 5,
                        name: "43% Hisob",
                        message: `Hisob (qayerdan)`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let b1Account43 = await b1Controller.getAccount43()
                            let accountList43 = b1Account43.map((item, i) => {
                                return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                            })
                            updateData(user?.currentDataId, { accountList43 })
                            return await dataConfirmBtnEmp(chat_id, accountList43.sort((a, b) => a.id - b.id), 1, 'account')
                        },
                        step: '25'
                    },
                    {
                        id: 6,
                        name: "Valyuta",
                        message: `Valyutani tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency'),
                        step: '26'
                    },
                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate('CNY', get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '28'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '27'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `Tovar nomi:\nZakaz nomeri:\nTo'lov turi: (zaklad, tovar uchun, kontener uchun, rasxod uchun kabi)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#tolov\n#21059MY(Zakaz nomeri)\n`,
                        btn: () => empDynamicBtn(),
                        step: '29'
                    },
                    {
                        id: 10,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                jira: {
                    operationsList: { comment: true, transition: false, date: false }
                },
                b1: {
                    status: true,
                    supplier: true
                },
                updateLine: 3,
                lastStep: 30,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))

                    let paymentType = get(data, 'payment', true) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                    let accountName = get(data, 'accountList43', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    // accountCodeOther
                    let namesType = get(data, 'documentType') ? (get(data, 'accountList43', []).find(item => item.id == get(data, 'accountCodeOther'))?.name) : vendorName
                    let purchase = get(data, 'purchase') ? get(data, 'purchaseOrders', []).find(item => item.DocEntry == get(data, 'purchaseEntry')) : {}
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: get(data, 'documentType') ? 'Hisob (qayerga)' : 'Yetkazib beruvchi', message: namesType }, { name: 'Zakupka', message: `${get(purchase, 'NumAtCard', '')} - ${get(purchase, 'DocNum', '')}` }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: 'Ticket raqami', message: data?.ticket }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, data?.currency) }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Izoh', message: data?.comment }]
                    if (!get(purchase, 'DocEntry')) {
                        info = info.filter(item => item.name != 'Zakupka')
                    }
                    return info
                }
            },
            {
                name: "Chetga pul chiqarish",
                comment: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '90'
                    },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '44'
                    },

                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate('UZS', get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, 'UZS'), id: 'UZS' }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '49'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '48'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):`,
                        btn: () => empDynamicBtn(),
                        step: '50'
                    },
                    {
                        id: 10,
                        name: "Hisob Nuqtasi",
                        message: `Hisob Nuqtasini tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'),
                        step: '51'
                    },
                    {
                        id: 4,
                        name: "To'lov usullari , Valyuta , Hisob",
                        message: `To'lov usullarini tanlang`,
                        btn: async ({ chat_id }) => {
                            let btnList = payType50
                            return await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                        },
                        step: '45'
                    },
                    {
                        id: 11,
                        name: "Statya DDS",
                        message: `Statya DDS ni tanlang`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(list, 'accountCodeOther', ''))).map((item, i) => {
                                return { name: item, id: i }
                            })

                            let ddsList = isDds.length ? isDds : ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))
                            return await dataConfirmBtnEmp(chat_id,
                                ddsList, 2, 'dds')
                        },
                        step: '52'
                    },
                    {
                        id: 12,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                b1: {
                    status: true,
                    type: 'account',
                    cashFlow: true,
                },
                updateLine: 2,
                lastStep: 52,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let ddsList = Object.keys(DDS)?.filter(item => DDS[item].map(item => item.toString()).includes(get(data, 'accountCodeOther', '')))
                    if (!ddsList.includes(get(data, 'dds'))) {

                        data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    }

                    let paymentType = get(data, 'payment', false) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
                    let namesType = (get(data, 'accountList', []).find(item => item.id == get(data, 'accountCodeOther'))?.name)

                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Hisob (qayerga)', message: namesType }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, 'UZS') }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: get(data, 'dds', '❌') }, { name: 'Izoh', message: data?.comment },]
                    return info
                }
            },
            {
                name: "Chetga pul chiqarish (Bank)",
                comment: "Sana:\nNaqd to'lov.\n-To'lov/Harajat sababi:\n-Yetkazib beruvchi:\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi: Bahodir aka\n-To'lov/Harajat jami summasi:\n-To'lov summasi: \n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#tolov\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nNaqd to'lov.\n-To'lov/Harajat sababi:\n-Yetkazib beruvchi:\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi: Bahodir aka\n-To'lov/Harajat jami summasi:\n-To'lov summasi: \n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#tolov\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 14,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                },
            }
        ],
        2: [
            {
                name: 'Mahalliy xarid buyurtmasi',
                comment: "Sana:\n\nMahalliy Buyurtma\n- Buyurtma raqami:\n-Yetkazib beruvchi:\n-Tovar nomi:\n-Bo’nak(zaklad) summasi: Yo'q/1000$.\nBo’nak to’lov sanasi:\n-Tovar summasi: 12000$.\n- Tovar to’lov sanasi:\n-To'lov kelishuv sharti: Oldindan to’lov/Kechiktirilgan to’lov\n#mbuyurtma\n#21059AT(Buyurtma raqami)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n- Tasdiqlovchi: ",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\n\nMahalliy Buyurtma\n- Buyurtma raqami:\n-Yetkazib beruvchi:\n-Tovar nomi:\n-Bo’nak(zaklad) summasi: Yo'q/1000$.\nBo’nak to’lov sanasi:\n-Tovar summasi: 12000$.\n- Tovar to’lov sanasi:\n-To'lov kelishuv sharti: Oldindan to’lov/Kechiktirilgan to’lov\n#mbuyurtma\n#21059AT(Buyurtma raqami)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n- Tasdiqlovchi: `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 42,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Mahalliy xarid to'lovi",
                comment: `Sana: 23.12.2021\nMahalliy to'lov\n-Buyurtma raqami:\n-Yetkazib beruvchi: \n-Tovar nomi:\n-To'lovchi: Bolter/Rasul aka \n-Bo’nak (zaklad) summasi: Yo'q/1000$. 
                Bo’nak to’lov sanasi: \n-Tovar summasi: 12000$. Tovar to’lov sanasi:\n-To'lov summasi: \n#mtolov\n#21059MY(Buyurtma raqami)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '41'
                    },
                    {
                        id: 2,
                        name: "Yetkazib beruvchi",
                        message: 'Yetkazib beruvchi ni ismini yozing',
                        btn: () => empDynamicBtn(),
                        step: '42'
                    },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '44'
                    },

                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate('UZS', get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, 'UZS'), id: 'UZS' }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '49'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '48'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `Sana: 23.12.2021\nMahalliy to'lov\n-Buyurtma raqami:\n-Yetkazib beruvchi: \n-Tovar nomi:\n-To'lovchi: Bolter/Rasul aka \n-Bo’nak (zaklad) summasi: Yo'q/1000$. 
                        Bo’nak to’lov sanasi: \n-Tovar summasi: 12000$. Tovar to’lov sanasi:\n-To'lov summasi: \n#mtolov\n#21059MY(Buyurtma raqami)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n`,
                        btn: () => empDynamicBtn(),
                        step: '50'
                    },
                    {
                        id: 10,
                        name: "Hisob Nuqtasi",
                        message: `Hisob Nuqtasini tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'),
                        step: '51'
                    },
                    {
                        id: 4,
                        name: "To'lov usullari , Valyuta , Hisob",
                        message: `To'lov usullarini tanlang`,
                        btn: async ({ chat_id }) => {
                            let btnList = payType50
                            return await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                        },
                        step: '45'
                    },
                    {
                        id: 11,
                        name: "Statya DDS",
                        message: `Statya DDS ni tanlang`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(list, 'accountCodeOther', ''))).map((item, i) => {
                                return { name: item, id: i }
                            })
                            let ddsList = isDds.length ? isDds : ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))
                            return await dataConfirmBtnEmp(chat_id,
                                ddsList, 2, 'dds')
                        },
                        step: '52'
                    },
                    {
                        id: 12,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                b1: {
                    status: true,
                    type: 'supplier',
                    cashFlow: true,
                },
                updateLine: 2,
                lastStep: 52,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))

                    let paymentType = get(data, 'payment', true) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                    let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')

                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Yetkazib beruvchi', message: vendorName }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, 'UZS') }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: `Mahalliy yetkazib beruvchilarga to'lov` }, { name: 'Izoh', message: data?.comment },]
                    return info
                }
            },
        ],
        3: [
            {
                name: "Bank hisobidan to'lov/xarajat",
                comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 3,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Naqd/Karta hisobidan to'lov/xarajat",
                comment: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):\n-Chek(Bor/Yo'q):`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '61'
                    },
                    // {
                    //     id: 2,
                    //     name: "Hujjat turi (Hisob,Yetkazib beruvchi)",
                    //     message: 'Hujjat turi ni tanlang',
                    //     btn: () => empDynamicBtn([`Hisob`, `Xodim`], 2),
                    //     step: '62'
                    // },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '44'
                    },

                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate(get(list, 'currency', 'UZS'), get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, get(list, 'currency', 'UZS')), id: get(list, 'currency', 'UZS') }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '49'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '48'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):\n-Chek(Bor/Yo'q):`,
                        btn: () => empDynamicBtn(),
                        step: '50'
                    },
                    {
                        id: 10,
                        name: "Hisob Nuqtasi",
                        message: `Hisob Nuqtasini tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'),
                        step: '51'
                    },
                    {
                        id: 4,
                        name: "To'lov usullari , Valyuta , Hisob",
                        message: `To'lov usullarini tanlang`,
                        btn: async ({ chat_id }) => {
                            let btnList = payType50
                            return await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                        },
                        step: '45'
                    },
                    {
                        id: 11,
                        name: "Statya DDS",
                        message: `Statya DDS ni tanlang`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(list, 'accountCodeOther', ''))).map((item, i) => {
                                return { name: item, id: i }
                            })
                            let ddsList = isDds.length ? isDds : ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))

                            return await dataConfirmBtnEmp(chat_id,
                                ddsList, 2, 'dds')
                        },
                        step: '52'
                    },
                    {
                        id: 12,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                b1: {
                    status: true,
                    cashFlow: true,
                },
                updateLine: 2,
                lastStep: 52,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))

                    let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(data, 'accountCodeOther', ''))).map((item, i) => {
                        return { name: item, id: i }
                    })
                    let ddsList = isDds.length ? isDds : ((get(data, "DDS") ? [{ name: get(data, 'DDS'), id: '-3' }] : (get(data, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))
                    if (!ddsList.includes(get(data, 'dds'))) {
                        // updateData((id ? id : user.currentDataId), { dds: ddsList?.length == 1 ? ddsList[0].name : false })
                        data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    }

                    let paymentType = get(data, 'payment', false) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                    let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
                    let docType = get(data, 'documentType') ? 'Hisob' : 'Xodim'
                    let namesType = get(data, 'documentType') ? (get(data, 'accountList', []).find(item => item.id == get(data, 'accountCodeOther'))?.name) : vendorName

                    let ddsName = get(data, 'documentType') ? get(data, 'dds', '❌') : (get(data, 'payment') ? 'Qarz(Tushum)' : 'Qarz (Xarajat)')

                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Hujjat turi', message: docType }, { name: get(data, 'documentType') ? 'Hisob (qayerga)' : 'Yetkazib beruvchi', message: namesType }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, get(data, 'currency', 'UZS') == 'CNY' ? 'CNY' : "UZS") }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: ddsName }, { name: 'Izoh', message: data?.comment },]
                    return info
                }
            },
            {
                name: "Naqd/Click Bojxonaga oid xarajatlar",
                comment: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '90'
                    },
                    // {
                    //     id: 2,
                    //     name: "Hisob",
                    //     message: 'Hisob (qayerdan)',
                    //     btn: async ({ chat_id }) => {
                    //         let user = infoUser().find(item => item.chat_id == chat_id)
                    //         let list = infoData().find(item => item.id == user?.currentDataId)
                    //         if (!list?.accountList.length) {
                    //             let b1Account15 = await b1Controller.getAccount15()
                    //             let accountList15 = b1Account15?.map((item, i) => {
                    //                 return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                    //             })
                    //             list.accountList = accountList15
                    //             updateData(user?.currentDataId, { accountList: accountList15, payment: false })
                    //         }
                    //         let btn = await dataConfirmBtnEmp(chat_id, list?.accountList?.sort((a, b) => +b.id - +a.id), 1, 'othersAccount')
                    //         return btn
                    //     },
                    //     step: '64'
                    // },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '44'
                    },

                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate('UZS', get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, 'UZS'), id: 'UZS' }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '49'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '48'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):`,
                        btn: () => empDynamicBtn(),
                        step: '50'
                    },
                    {
                        id: 10,
                        name: "Hisob Nuqtasi",
                        message: `Hisob Nuqtasini tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'),
                        step: '51'
                    },
                    {
                        id: 4,
                        name: "To'lov usullari , Valyuta , Hisob",
                        message: `To'lov usullarini tanlang`,
                        btn: async ({ chat_id }) => {
                            let btnList = payType50
                            return await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                        },
                        step: '45'
                    },
                    {
                        id: 11,
                        name: "Statya DDS",
                        message: `Statya DDS ni tanlang`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(list, 'accountCodeOther', ''))).map((item, i) => {
                                return { name: item, id: i }
                            })
                            let ddsList = isDds.length ? isDds : ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))
                            return await dataConfirmBtnEmp(chat_id,
                                ddsList, 2, 'dds')
                        },
                        step: '52'
                    },
                    {
                        id: 12,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                b1: {
                    status: true,
                    type: 'account',
                    cashFlow: true,
                },
                updateLine: 2,
                lastStep: 52,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))

                    let ddsList = Object.keys(DDS)?.filter(item => DDS[item].map(item => item.toString()).includes(get(data, 'accountCodeOther', '')))
                    if (!ddsList.includes(get(data, 'dds'))) {
                        // updateData((id ? id : user.currentDataId), { dds: ddsList?.length == 1 ? ddsList[0] : false })
                        data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    }

                    let paymentType = get(data, 'payment', false) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
                    let namesType = (get(data, 'accountList', []).find(item => item.id == get(data, 'accountCodeOther'))?.name)

                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Hisob (qayerga)', message: namesType }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, 'UZS') }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: get(data, 'dds', '❌') }, { name: 'Izoh', message: data?.comment },]
                    return info
                }
            },
            {
                name: "Bank Bojxonaga oid xarajatlar",
                comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Naqd/Karta hisobiga tushum",
                comment: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):\n-Chek(Bor/Yo'q):`,
                update: [
                    {
                        id: 1,
                        name: "Sap Document",
                        message: `Hujjatni tanlang`,
                        btn: () => empDynamicBtn([`Chiquvchi to'lov`, `Kiruvchi to'lov`], 2),
                        step: '61'
                    },
                    // {
                    //     id: 2,
                    //     name: "Hujjat turi (Hisob,Yetkazib beruvchi)",
                    //     message: 'Hujjat turi ni tanlang',
                    //     btn: () => empDynamicBtn([`Hisob`, `Xodim`], 2),
                    //     step: '62'
                    // },
                    {
                        id: 3,
                        name: "Sana",
                        message: `1)To'lov sanasi Yil.Oy.Kun : 2024.01.31 \n2)Hisobot To'lov sanasi Yil.Oy.Kun  : 2024.01.31`,
                        btn: () => empDynamicBtn(),
                        step: '44'
                    },

                    {
                        id: 7,
                        name: "Valyuta kursi",
                        message: `Valyuta kursi `,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let data = await b1Controller.getCurrentRate(get(list, 'currency', 'UZS'), get(list, 'startDate', ''))
                            let rate = data[0]?.Rate
                            if (rate) {
                                updateData(user.currentDataId, { currencyRate: rate })
                            }
                            else {
                                rate = list?.currencyRate
                            }
                            let btn = rate ? await dataConfirmBtnEmp(chat_id, [{ name: formatterCurrency(+rate, get(list, 'currency', 'UZS')), id: get(list, 'currency', 'UZS') }], 1, 'rate') : empDynamicBtn()
                            return btn
                        },
                        step: '49'
                    },
                    {
                        id: 8,
                        name: "Summa",
                        message: `Summani yozing`,
                        btn: () => empDynamicBtn(),
                        step: '48'
                    },
                    {
                        id: 9,
                        name: "Izoh",
                        message: `-Yetkazib beruvchi(Kimdan sotib olinayotgani):\n-Sotib olinayotgan tovar/xizmat yoki harajat nom:\n-To'lovchi(Pulni kim berayotgani):\n-To'lov/Harajat jami summasi(Kelishilgan jami summa):\n-To'lov summasi(Ayni damda to'lanayotgan summa):\n-Chek(Bor/Yo'q):`,
                        btn: () => empDynamicBtn(),
                        step: '50'
                    },
                    {
                        id: 10,
                        name: "Hisob Nuqtasi",
                        message: `Hisob Nuqtasini tanlang`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, ocrdList, 1, 'point'),
                        step: '51'
                    },
                    {
                        id: 4,
                        name: "To'lov usullari , Valyuta , Hisob",
                        message: `To'lov usullarini tanlang`,
                        btn: async ({ chat_id }) => {
                            let btnList = payType50
                            return await dataConfirmBtnEmp(chat_id, btnList, 2, 'payType')
                        },
                        step: '45'
                    },
                    {
                        id: 11,
                        name: "Statya DDS",
                        message: `Statya DDS ni tanlang`,
                        btn: async ({ chat_id }) => {
                            let user = infoUser().find(item => item.chat_id == chat_id)
                            let list = infoData().find(item => item.id == user.currentDataId)
                            let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(list, 'accountCodeOther', ''))).map((item, i) => {
                                return { name: item, id: i }
                            })
                            let ddsList = isDds.length ? isDds : ((get(list, "DDS") ? [{ name: get(list, 'DDS'), id: '-3' }] : (get(list, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))

                            return await dataConfirmBtnEmp(chat_id,
                                ddsList, 2, 'dds')
                        },
                        step: '52'
                    },
                    {
                        id: 12,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                b1: {
                    status: true,
                    cashFlow: true,
                },
                updateLine: 2,
                lastStep: 52,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))

                    let isDds = Object.keys(DDS)?.filter(item => DDS[item].find(el => el == get(data, 'accountCodeOther', ''))).map((item, i) => {
                        return { name: item, id: i }
                    })
                    let ddsList = isDds.length ? isDds : ((get(data, "DDS") ? [{ name: get(data, 'DDS'), id: '-3' }] : (get(data, 'payment') ? [{ name: 'Qarz(Tushum)', id: '-1' }] : [{ name: 'Qarz (Xarajat)', id: '-2' }])))
                    if (!ddsList.includes(get(data, 'dds'))) {
                        // updateData((id ? id : user.currentDataId), { dds: ddsList?.length == 1 ? ddsList[0].name : false })
                        data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    }

                    let paymentType = get(data, 'payment', false) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
                    let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                    let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                    let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
                    let docType = get(data, 'documentType') ? 'Hisob' : 'Xodim'
                    let namesType = get(data, 'documentType') ? (get(data, 'accountList', []).find(item => item.id == get(data, 'accountCodeOther'))?.name) : vendorName

                    let ddsName = get(data, 'documentType') ? get(data, 'dds', '❌') : (get(data, 'payment') ? 'Qarz(Tushum)' : 'Qarz (Xarajat)')

                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Hujjat turi', message: docType }, { name: get(data, 'documentType') ? 'Hisob (qayerga)' : 'Yetkazib beruvchi', message: namesType }, { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') }, { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Hisob (qayerdan)', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, get(data, 'currency', 'UZS') == 'CNY' ? 'CNY' : "UZS") }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: ddsName }, { name: 'Izoh', message: data?.comment },]
                    return info
                }
            },
        ],
        4: [
            {
                name: "D12 Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma12\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma12\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "D64 Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma64\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma64\n\n@XusravRasulov\n@TolanovTolqin `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "D777 Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma777\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnoma777\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Distribyutsiya Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaDis\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaDis\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "DQ Shartnoma shabloni",
                comment: `Sana:\nOfisdan dogovor so'rash shabloni:\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: 
                \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaQ01\n\n@XusravRasulov\n@TolanovTolqin`,
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni:\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: 
                        \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaQ01\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },

            {
                name: "SM Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaSM\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaSM\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "AN Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaAN\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaAN\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "NM Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaNM\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaNM\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "UR Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaUR\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaUR\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "JZ Shartnoma shabloni",
                comment: "Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN: \n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaJZ\n\n@XusravRasulov\n@TolanovTolqin",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nOfisdan dogovor so'rash shabloni.\n-Firma: Bolter (Unikus)\n-Mijoz: Ismi\n-Buxgalter ismi va telefon raqami: Tel nomeri\n-INN:\n-Shartnoma turi: ochiq\n-Shartnoma summasi: ?? mln\n-Ishonchnoma summasi : ?? mln\n-Ishonchnoma nomeri va sanasi: (31.12.2021)\n-To'lov summasi:\n-Tovar narxi: (Bizni prixodga qarab)\n-Tovar nomi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#shartnomaJZ\n\n@XusravRasulov\n@TolanovTolqin`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
        ],
        5: [
            {
                name: "Narx chiqarishni tasdiqlash xitoy",
                comment: "Sana: \nNarx chiqarish.\nTovar: DYUBEL GVOZD DMAX\nJavobgar: Ibrohim\nTekshirdi: Temur\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#Chnarx \n#prixod (sana)\n#xitoy\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana: \nNarx chiqarish.\nTovar: DYUBEL GVOZD DMAX\nJavobgar: Ibrohim\nTekshirdi: Temur\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#Chnarx \n#prixod (sana)\n#xitoy\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Narx chiqarishni tasdiqlash mahalliy",
                comment: "Sana: \nNarx chiqarish.\nTovar: DYUBEL GVOZD DMAX\nJavobgar: Ne'mat\nTekshirdi: Nodirxo'ja\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: Rasul aka\n#Chnarx \n#prixod (sana)\n#mahalliy\n#M21445AT(zakaz nomeri)\n\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana: \nNarx chiqarish.\nTovar: DYUBEL GVOZD DMAX\nJavobgar: Ne'mat\nTekshirdi: Nodirxo'ja\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: Rasul aka\n#Chnarx \n#prixod (sana)\n#mahalliy\n#M21445AT(zakaz nomeri)\n\n `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            }
        ],
        6: [
            {
                name: "SAPda o'zgartirishni tasdiqlash",
                comment: "#XATO\nSababi: Tovar nomi va nima o'zgarish bo'lgani\n12 do'kon sap - 0 real - 0\n64 do'kon sap - 0 real - 0\n777 do'kon sap - 0 real - 0\nOmbor sap - 0 real - 0\nDis sap - 0 real - 0\nKim qilgan: Sklad nomi\nO'zgartirish kerak: SAP da pt/vt qilish kerak\nTasdiqlovchi:  \n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `#XATO\nSababi: Tovar nomi va nima o'zgarish bo'lgani\n12 do'kon sap - 0 real - 0\n64 do'kon sap - 0 real - 0\n777 do'kon sap - 0 real - 0\nOmbor sap - 0 real - 0\nDis sap - 0 real - 0\nKim qilgan: Sklad nomi\nO'zgartirish kerak: SAP da pt/vt qilish kerak\nTasdiqlovchi:  \n `,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Do'kon xarid",
                comment: "Kimdan:12/00 do'kondan\nTovar nomi: Anker sariq 20x200 dan 320 dona\nOlingan narx: 1.36$\nSotish narxi: 1.6$\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: Rasul aka\n#dxarid\n\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Kimdan:12/00 do'kondan\nTovar nomi: Anker sariq 20x200 dan 320 dona\nOlingan narx: 1.36$\nSotish narxi: 1.6$\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: Rasul aka\n#dxarid\n\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Chegirma",
                comment: "Sana:\nKimga: Mijoz ismi\nTovar 1: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nTovar 2: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nTovar 3: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nUmumiy buyurtma summasi: 6025$\nUmumiy chegirma summasi: 25$\n---------------------------------------\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#chegirma\n\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Sana:\nKimga: Mijoz ismi\nTovar 1: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nTovar 2: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nTovar 3: \nSotish narxi: 1.6$\nChegirma bilan narxi: 1,56$\n---------------------------------------\nUmumiy buyurtma summasi: 6025$\nUmumiy chegirma summasi: 25$\n---------------------------------------\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#chegirma\n\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            },
            {
                name: "Yangi tovar nomi",
                comment: "Shtrix kodi:\nNomi:\nAlternativ nomi:\nGuruhi:\nIchki guruh:\nTipi:\nO'lchov birligi:\nBrendi:\nRazmeri:\nPachka/Korobkasi:\nBruttosi:\nTara:\nCBN:\nSvoystva: Xitoy yoki Mahalliy\nMRP: Ha/Yo'q\nИнтервал заказа: (nechi oylik zakaz qilishi)\nВремя подготовки: (kelish vaqti)\nДопустимое отклонение в днях: 7/14 kun\"\n",
                update: [
                    {
                        id: 1,
                        name: "Izoh",
                        message: `Shtrix kodi:\nNomi:\nAlternativ nomi:\nGuruhi:\nIchki guruh:\nTipi:\nO'lchov birligi:\nBrendi:\nRazmeri:\nPachka/Korobkasi:\nBruttosi:\nTara:\nCBN:\nSvoystva: Xitoy yoki Mahalliy\nMRP: Ha/Yo'q\nИнтервал заказа: (nechi oylik zakaz qilishi)\nВремя подготовки: (kelish vaqti)\nДопустимое отклонение в днях: 7/14 kun\"\n`,
                        btn: () => empDynamicBtn(),
                        step: '13'
                    },
                    {
                        id: 2,
                        name: "File",
                        message: `File jo'natasizmi ?`,
                        btn: async ({ chat_id }) => await dataConfirmBtnEmp(chat_id, [
                            {
                                name: 'Ha', id: 1
                            },
                            { name: "Yo'q", id: 2 },
                        ], 2, 'isSendFile'),
                        step: true
                    }
                ],
                updateLine: 1,
                lastStep: 62,
                infoFn: ({ chat_id, id }) => {
                    let user = infoUser().find(item => item.chat_id == chat_id)
                    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
                    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                    return info
                }
            }
        ],
    }
    return {
        ...Object.fromEntries(Object.entries(menuCred).map(item => [item[0], item[1].map((el, i) => {
            return {
                ...el, id: i + 1, menuId: Number(item[0])
            }
        })])),
        ...newSubMenus
    }
}




let DDS = {
    "-": [5011, 5012, 5021, 5031, 5042, 5041,
        5044, 5051, 5061, 5071, 5081,
        5091, 3120, 5010, 5020, 5030,
        5040, 5043, 5060, 5062, 5070,
        5080, 5090, 5026, 5036, 5035, 5025,
        5611, 5072, 5063, 5054, 5053,
        5052, 5050],
    "Agentlar yo'lkirasi": [9229, 9230, 9231, 9232, 9234, 9236, 9238],
    "Boshqa xarajat": [9499, 9437],
    "Asosiy vosita haridi": ["0820", "0830"],
    "Bojxona xarajati": [1511],
    "Yuk tushirish xarajati": [1512, 1514],
    "Deklarant xarajati": [1513],
    "Logistika xarajati": [1514],
    "Qarz (Xarajat)": [6820, 4730, 4790, 4890, 7820],
    "Qarz(Tushum)": [6820, 4730, 4790, 4890, 7820],
    "Xorijiy yetkazib beruvchilarga to'lov": [5530],
    "Inventarizaatsiya": [5910],
    "Kassa farqi": [5930, 5931, 5934, 5935, 5936, 9465, 5937, 5938, 5933, 5939, 5941],
    "Mahalliy yetkazib beruvchilarga to'lov": [6010],
    "Soliq(Xarajat)": [6410, 6411, 6412, 6413, 6414, 6415],
    "Oylik(Xarajat)": [6710, 9456],
    "Dividend(Xarajat)": [8710],
    "Bonus xodimlar(Xarajat)": [9150],
    "Yetkazib berish xarajati": [9160, 9220, 9221, 9222, 9223, 9228, 9227, 9226, 9225, 9224, 9226, 9227, 9233, 9235, 9237],
    "Asosiy vosita chiqib ketishidan foyda": [9310],
    "Boshqa tushumlar(Tushum)": [9390],
    "Adminstrativ xarajat": [9440],
    "Bank xizmati(Xarajat)": [9441],
    "Ijara korxona(Xarajat)": [9444],
    "Ijara xodimlarga(Xarajat)": [9445],
    "Internet xarajati": [9446],
    "Joriy Remont(Xarajat)": [9447],
    "Kapital Remont(Xarajat)": [9448],
    "Kommunal xarajatlar": [9449],
    "Marketing xarajati": [9450],
    "Mehmondorchilik(Xarajat)": [9451],
    "Aloqa xizmati": [9452],
    "Moddiy yordam(Xarajat)": [9453],
    "Operatsion xarajatlar": [9454],
    "Ovqat(Xarajat)": [9455],
    "Dastur xarajati": [9457],
    "Pul o'tkazish xarajati": [9458],
    "Texnik xizmat(Xarajat)": [9459],
    "TMB sotuvi(Tushum)": [9460],
    "TMB xaridi(Xarajat)": [9460],
    "Xizmat safari xarajati": [9461],
    "Yoqilg'i(Xarajat)": [9462],
    "Kurs farqi": [9540, 9620],
    "Naqd(Tushum)": [5020, 5021, 5031, 5040, 5041, 5042, 5060, 5061, 5080, 5081, 5090, 5091, 5026, 5036, 5025, 5030, 5075, 5076, 5085, 5086, 5095, 5096],
    "Karta(Tushum)": [5020, 5030, 5040, 5060, 5080, 5090, 5056, 5057, 5058],
    "Terminal(Tushum)": [5022, 5032, 5045, 5064, 5082, 5092, 5027, 5037, 5097, 5077, 5087],
    "O'tkazmalar(Tushum)": [5023, 5034, 5046, 5065, 5083, 5093, 5028, 5038, 5098, 5088, 5078],
}

let accounts43 = []

for (let i = 31; i <= 99; i++) {
    accounts43.push(`43${i}`)
}

let accounts50 = {
    'Naqd': {
        'USD': [5011, 5012, 5021, 5031, 5041, 5044, 5051, 5061, 5071, 5081, 5091, 3120, 5026, 5036, 5076, 5086, 5096],
        'UZS': [5010, 5020, 5030, 5040, 5042, 5043, 5060, 5062, 5070, 5080, 5090, 5025, 5030, 5075, 5085, 5035, 5095, 5073],
        'CNY': accounts43
    },
    'Karta': {
        'UZS': [5050, 5052, 5053, 5054, 5063, 5072, 5056, 5057, 5058, 5055],
    },
    'Terminal': {
        'UZS': [5022, 5032, 5045, 5064, 5082, 5092, 5027, 5037, 5077, 5087, 5097]
    },
    "O'tkazma": {
        'UZS': [5023, 5034, 5046, 5065, 5083, 5093, 5028, 5038, 5078, 5088, 5098]
    }
}
let subAccounts50 = {
    'Naqd': [5011, 5012, 5021, 5031, 5041, 5042, 5044, 5051, 5061, 5071, 5081, 5091, 3120, 5010, 5020, 5030, 5040, 5043, 5060, 5062, 5070, 5080, 5090, 5026, 5036, 5035, 5025, 5076, 5086, 5075, 5085, 5096, 5095, 5073],
    'Karta': [5050, 5052, 5053, 5054, 5063, 5072, 5056, 5057, 5058, 5055],
    'Terminal': [5022, 5032, 5045, 5064, 5082, 5092, 5027, 5037, 5077, 5087, 5097],
    "O'tkazma": [5023, 5034, 5046, 5065, 5083, 5093, 5028, 5038, 5078, 5088, 5098]
}

let ocrdList = [
    {
        id: '12',
        name: "12-do'kon"
    },
    {
        id: '64',
        name: "64-do'kon"
    },
    {
        id: '777',
        name: "777-DO'KON"
    },
    {
        id: 'D',
        name: "DISTRIBYUTSIYA"
    },
    {
        id: 'KORXONA',
        name: "KORXONA"
    },
    {
        id: 'O',
        name: "Ombor"
    },
    {
        id: 'OFIS',
        name: "OFIS"
    },
    {
        id: 'Q',
        name: "Qo'qon"
    },
    {
        id: 'X',
        name: "Xitoy"
    },
    {
        id: 'AN',
        name: "Andijon"
    },
    {
        id: 'SM',
        name: "Samarqand"
    },
    {
        id: 'NM',
        name: "Namangan"
    },
    {
        id: 'UR',
        name: "Urganch"
    },
    {
        id: 'JZ',
        name: "Jizzax"
    }
]


let accounts = {
    'AV/TMB': [
        '0820',
        '0830',
        9310,
        9460
    ],
    'Kassa farq': [
        5930,
        5931,
        5934,
        5935,
        5936,
        5937,
        5938,
        5939,
        5933,
        5941
    ],
    'Oylik/Bonus': [
        6710,
        9150,
        9456
    ],
    "Qarz": [
        4730,
        4790,
        4890,
        6820,
        7820
    ],
    "Tovar qabuli": [
        1511,
        1512,
        1513,
        1514,
        5910
    ],
    "Doimiy xarajat": [
        3110,
        3120,
        5530,
        5611,
        8710,
        9390,
        9437,
        9440,
        9441,
        9444,
        9445,
        9446,
        9447,
        9448,
        9449,
        9450,
        9451,
        9452,
        9453,
        9454,
        9455,
        9457,
        9458,
        9459,
        9461,
        9462,
        9465,
        9499,
        9812,
        9810
    ],
    "Yetkazish": [
        9160,
        9220,
        9221,
        9222,
        9223,
        9226,
        9227,
        9228,
        9229,
        9230,
        9226,
        9227,
        9231,
        9232,
        9230,
        9233,
        9234,
        9235,
        9236,
        9237,
        9238
    ],
}




let selectedUserStatus = {
    'emp': 'permissonMenuEmp',
    'affirmative': 'permissonMenuAffirmative',
    'executor': 'permissonMenuExecutor'
}

let selectedUserStatusUzb = {
    'emp': 'Xodim',
    'affirmative': 'Tasdiqlovchi',
    'executor': 'Bajaruvchi'
}


const empDataCred = () => {
    let mainDataCred = {
        "Tasdiqlanishi kutilayotgan so’rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && !item?.confirmative && item.chat_id == chat_id),
        "Bajarilishi kutilaytogan so’rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && !item?.executor && get(item, 'confirmative.status') && item.chat_id == chat_id),
        "Tasdiqlangan , bajarilmagan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && !item?.executor && item.chat_id == chat_id),
        "Tasdiqlangan , bajarilgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'executor.status') && get(item, 'confirmative.status') && item.chat_id == chat_id),
        "Tasdiqlovchi rad etgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') == false && item.chat_id == chat_id),
        "Bajaruvchi rad etgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'executor.status') == false && get(item, 'confirmative.status') && item.chat_id == chat_id)
    }
    return mainDataCred
}

const execDataCred = () => {
    let mainDataCred = {
        "Bajarilmagan so'rovlar": ({ chat_id }) => {
            let permission = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonMenuExecutor = Object.fromEntries(Object.entries(get(permission, 'permissonMenuExecutor', {})).map(item => {
                return [item[0], item[1].map(el => SubMenu()[item[0]]?.find(s => s.id == el)?.name)]
            }))
            return infoData().filter(item => item?.full
                && get(item, 'confirmative.status') && !get(item, 'executor')
                && (permissonMenuExecutor[item.menu] ? permissonMenuExecutor[item.menu].includes(item?.subMenu) : false))
        },
        "Bajarilgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executor.status') && get(item, 'executor.chat_id') == chat_id),
        "Rad etilgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executor.status') == false && get(item, 'executor.chat_id') == chat_id)
    }
    return mainDataCred
}

const confDataCred = () => {
    let mainDataCred = {
        "Tasdiqlanmagan so'rovlar": ({ chat_id }) => {
            let permission = infoPermisson().find(item => item.chat_id == chat_id)
            let permissonMenuAffirmative = Object.fromEntries(Object.entries(get(permission, 'permissonMenuAffirmative', {})).map(item => {
                return [item[0], item[1].map(el => SubMenu()[item[0]]?.find(s => s.id == el)?.name)]
            }))
            return infoData().filter(item => item?.full
                && !get(item, 'confirmative')
                && (permissonMenuAffirmative[item.menu] ? permissonMenuAffirmative[item.menu].includes(item?.subMenu) : false)
            )
        },
        "Tasdiqlanib , bajarilmagan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executor.status') == false),
        "Tasdiqlanib , bajarilishi kutilayotgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && !item.executor),
        "Rad etilgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') == false),
        "Bajarilgan so'rovlar":
            ({ chat_id }) => infoData().filter(item => item.full && get(item, 'confirmative.status') && get(item, 'executor.status'))
    }
    return mainDataCred
}

const styles = {
    correct: {
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: { rgb: '00FF00' } // Green
        },
        font: {
            color: { rgb: 'FFFFFF' } // White text
        }
    },
    incorrect: {
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: { rgb: 'FF0000' } // Red
        },
        font: {
            color: { rgb: 'FFFFFF' } // White text
        }
    }
};

let excelFnFormatData = ({ main }) => {
    let objects = []
    let schema = []
    for (let i = 0; i < main.length; i++) {
        let data = main[i]
        let paymentType = get(data, 'payment', true) ? `Kiruvchi to'lov` : `Chiquvchi to'lov`
        let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name || ''
        let accountName = [...get(data, 'accountList43', []), ...get(data, 'accountList', []), ...get(data, 'accountList50', [])].find(item => item.id == get(data, 'accountCode', 1))?.name || ''
        let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
        let accountOtherName = ([...get(data, 'accountList43', []), ...get(data, 'accountList', []), ...get(data, 'accountList50', [])].find(item => item.id == get(data, 'accountCodeOther')))
        let namesType = get(data, 'documentType') ? ([...get(data, 'accountList43', []), ...get(data, 'accountList', []), ...get(data, 'accountList50', [])].find(item => item.id == get(data, 'accountCodeOther'))?.name) : vendorName
        let purchase = get(data, 'purchase') ? get(data, 'purchaseOrders', []).find(item => item.DocEntry == get(data, 'purchaseEntry')) : {}
        let empData = infoUser().find(item => item.chat_id == get(data, 'chat_id'))
        let empName = `${get(empData, 'LastName')} ${get(empData, 'FirstName')}`
        let executor = get(data, 'executor', {})
        let confirmative = get(data, 'confirmative', {})
        let confirmUser = confirmative ? infoUser().find(item => item.chat_id == get(data, 'confirmative.chat_id')) : {}
        let executUser = executor ? infoUser().find(item => item.chat_id == get(data, 'executor.chat_id')) : {}
        let info = [
            { name: 'ID', message: data?.ID || 1 },
            { name: 'Menu', message: get(data, 'menuName', '') },
            { name: 'SubMenu', message: get(data, 'subMenu', '') },
            { name: 'Xodim', message: empName },
            { name: 'Tasdiqlovchi', message: `${get(confirmUser, 'LastName', '')} ${get(confirmUser, 'FirstName', '')} ${get(confirmative, 'status') ? "✅" : "❌"}` },
            { name: 'Bajaruvchi', message: `${get(executUser, 'LastName', '')} ${get(executUser, 'FirstName', '')} ${get(executor, 'status') ? "✅" : "❌"}` },
            { name: 'SAP Document', message: paymentType || '' },
            { name: get(data, 'documentType') ? 'Hisob' : 'Yetkazib beruvchi', message: namesType || '' },
            { name: 'Zakupka', message: `${get(purchase, 'NumAtCard', '')} - ${get(purchase, 'DocNum', '')}` },
            { name: `To'lov sanasi`, message: moment(get(data, 'startDate', '')).format('DD.MM.YYYY') },
            { name: `Hisobot To'lov sanasi`, message: moment(get(data, 'endDate', '')).format('DD.MM.YYYY') },
            { name: 'Ticket raqami', message: get(data, 'ticket', '') },
            { name: 'Hisob(qayerdan)', message: `${accountName}` },
            { name: 'Hisob(qayerga)', message: `${get(accountOtherName, 'name', '')}` },
            { name: 'Valyuta', message: get(data, 'currency', '') },
            { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, data?.currency) },
            { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) },
            { name: "Hisob Nuqtasi", message: pointName },
            { name: 'Statya DDS', message: get(data, 'dds', '❌') },
            { name: 'Izoh', message: get(data, 'comment', '') }
        ]
        if (!accountOtherName) {
            info = info.filter(item => item.name != 'Hisob(qayerga)')
        }
        if (!get(purchase, 'DocEntry')) {
            info = info.filter(item => item.name != 'Zakupka')
        }
        if (schema.length == 0) {
            info.forEach(el => {
                let obj = {
                    column: el.name,
                    type: String,
                    value: student => {
                        return `${student[el.name]}`
                    },
                    align: 'center',
                    alignVertical: 'center',
                    span: 2,
                }
                if (el.name == 'Izoh') {
                    obj['height'] = 100
                }
                schema.push(obj)
            })
        }


        let resultObj = {}
        info.forEach(el => {
            resultObj[el.name] = el.message
        })
        objects.push(resultObj)
    }
    return { objects, schema }
}
module.exports = {
    Menu,
    SubMenu,
    accounts43,
    accounts50,
    ocrdList,
    accounts,
    DDS,
    subAccounts50,
    selectedUserStatus,
    selectedUserStatusUzb,
    empDataCred,
    execDataCred,
    confDataCred,
    newMenu,
    payType50,
    excelFnFormatData
}

