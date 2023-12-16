const { get, update } = require("lodash")
const b1Controller = require("../controllers/b1Controller")
const { infoUser, infoData, formatterCurrency, updateData } = require("../helpers")
const { empDynamicBtn } = require("../keyboards/function_keyboards")
const { dataConfirmBtnEmp } = require("../keyboards/inline_keyboards")

let Menu = [
    {
        name: 'Xorijiy xarid',
        id: 1
    },
    {
        name: 'Mahalliy xarid',
        id: 2
    },
    {
        name: "To'lov/Xarajat",
        id: 3
    },
    {
        name: "Shartnoma",
        id: 4
    },
    {
        name: "Narx chiqarish",
        id: 5
    },
    {
        name: "Boshqa",
        id: 6
    },
]

let SubMenu = {
    1: [
        {
            name: 'Xorijiy xarid transport buyurtmasi',
            comment: "Sana:\n\nTicket raqami: \nTransport buyurtma.\nYetkazib beruvchi/ Tovar nomi: \nTovar ortilish reja sanasi: \n\nAlternative - 1(Lisa): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: Yurishdan oldin;\n3) Yurish Muddati: 20 - 25.05.2021; \n\nAlternative- 2(Lancy): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: May boshi(aniq etmayapti) \n\nAlternative - 3(Misha): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: 10.05.2021\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#kontener\n",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nTicket raqami: \nTransport buyurtma.\nYetkazib beruvchi/ Tovar nomi: \nTovar ortilish reja sanasi: \n\nAlternative - 1(Lisa): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: Yurishdan oldin;\n3) Yurish Muddati: 20 - 25.05.2021; \n\nAlternative- 2(Lancy): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: May boshi(aniq etmayapti) \n\nAlternative - 3(Misha): \n1) To'lov summasi: xyz Yuan;\n2) To'lov muddati: 01.06.2021 Yetib kelgandan keyin;\n3) Yurish Muddati: 10.05.2021\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi: \n#kontener\n`,
                    btn: () => empDynamicBtn(),
                    step: '13'
                },
                {
                    id: 2,
                    name: "Ticket raqami",
                    message: 'Ticket raqamini kiriting',
                    btn: () => empDynamicBtn(),
                    step: '12'
                }
            ],
            updateLine: 2,
            lastStep: 14,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Ticket raqami', message: data.ticket }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: 'Xorijiy xarid tovar buyurtmasi',
            comment: "Sana:\n\nTicket raqami :\nXorijiy buyurtma.\nZakaz nomeri:\nYetkazib beruvchi:\nTovar nomi:\nZaklad summasi: Yo'q/1000 Yuan (to'lov sanasi bilan)\nTovar summasi: 120000 Yuan\nTo'lov kelishuv sharti: Tovar yo'lga chiqishidan oldin to'lanadi/ovar yo'lga chiqqandan keyin(..) kun ichida xto'lanadi/Tovar yetib kelgandan keyin to'lanadi.\nTayyor bo'lish muddati:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#zakaz\n#21059MY(Zakaz nomeri)",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nTicket raqami :\nXorijiy buyurtma.\nZakaz nomeri:\nYetkazib beruvchi:\nTovar nomi:\nZaklad summasi: Yo'q/1000 Yuan (to'lov sanasi bilan)\nTovar summasi: 120000 Yuan\nTo'lov kelishuv sharti: Tovar yo'lga chiqishidan oldin to'lanadi/ovar yo'lga chiqqandan keyin(..) kun ichida xto'lanadi/Tovar yetib kelgandan keyin to'lanadi.\nTayyor bo'lish muddati:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#zakaz\n#21059MY(Zakaz nomeri)`,
                    btn: () => empDynamicBtn(),
                    step: '13'
                },
                {
                    id: 2,
                    name: "Ticket raqami",
                    message: 'Ticket raqamini kiriting',
                    btn: () => empDynamicBtn(),
                    step: '12'
                }
            ],
            updateLine: 2,
            lastStep: 14,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Ticket raqami', message: data.ticket }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Xorijiy xarid to'lovi",
            comment: `Sana:\n\nTicket raqami :\nXorijiy to'lov.\nTo'lov nomeri:\nTovar nomi:\nZakaz nomeri:\nKimga (Yetkazib beruvchi):\nTo'lovchi:\nTo'lov summasi:\nTo'lov turi: (zaklad, tovar uchun, kontener uchun, rasxod uchun kabi)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#tolov\n#21059MY(Zakaz nomeri)`,
            update: [
                {
                    id: 1,
                    name: "Sap Document",
                    message: `Hujjatni tanlang`,
                    btn: () => empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2),
                    step: '20'
                },
                {
                    id: 2,
                    name: "Yetkazib beruvchi",
                    message: 'Поставщик (Yetkazib beruvchi) ni ismini yozing',
                    btn: () => empDynamicBtn(),
                    step: '21'
                },
                {
                    id: 3,
                    name: "Sana",
                    message: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`,
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
                    name: "43% schet",
                    message: `Schetni tanlang`,
                    btn: async ({ chat_id }) => {
                        let user = infoUser().find(item => item.chat_id == chat_id)
                        let b1Account43 = await b1Controller.getAccount43()
                        let accountList43 = b1Account43.map((item, i) => {
                            return { name: `${item.AcctCode} - ${item.AcctName}`, id: item.AcctCode, num: i + 1 }
                        })
                        updateData(user?.currentDataId, { accountList43 })
                        return await dataConfirmBtnEmp(accountList43.sort((a, b) => a.id - b.id), 1, 'account')
                    },
                    step: '25'
                },
                {
                    id: 6,
                    name: "Valyuta",
                    message: `Valyutani tanlang`,
                    btn: async () => await dataConfirmBtnEmp([{ name: 'CNY(yuan)', id: 'CNY' }], 2, 'currency'),
                    step: '26'
                },
                {
                    id: 7,
                    name: "Valyuta kursi",
                    message: `Valyuta kursi `,
                    btn: async ({ chat_id }) => {
                        let user = infoUser().find(item => item.chat_id == chat_id)
                        let list = infoData().find(item => item.id == user.currentDataId)
                        let data = await b1Controller.getCurrentRate('CNY')
                        let rate = data[0]?.Rate
                        updateData(user.currentDataId, { currencyRate: rate })
                        let btn = rate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+rate, 'CNY'), id: 'CNY' }], 1, 'rate') : empDynamicBtn()
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
                    message: `Sana:\n\nTicket raqami :\nXorijiy buyurtma.\nZakaz nomeri:\nYetkazib beruvchi:\nTovar nomi:\nZaklad summasi: Yo'q/1000 Yuan (to'lov sanasi bilan)\nTovar summasi: 120000 Yuan\nTo'lov kelishuv sharti: Tovar yo'lga chiqishidan oldin to'lanadi/ovar yo'lga chiqqandan keyin(..) kun ichida xto'lanadi/Tovar yetib kelgandan keyin to'lanadi.\nTayyor bo'lish muddati:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#zakaz\n#21059MY(Zakaz nomeri)`,
                    btn: () => empDynamicBtn(),
                    step: '29'
                }
            ],
            updateLine: 3,
            lastStep: 30,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                let paymentType = get(data, 'payment', true) ? `Входящий платеж(Kiruvchi to'lov)` : `Исходящий платеж(Chiquvchi to'lov)`
                let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                let accountName = get(data, 'accountList43', []).find(item => item.id == get(data, 'accountCode', 1))?.name

                let info = [{ name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Yetkazib beruvchi', message: vendorName }, { name: `Data registratsiya (To'lov To'lov sanasisi)`, message: get(data, 'startDate') }, { name: `Data otneseniya (Hisobot To'lov sanasisi)`, message: get(data, 'endDate') }, { name: 'Ticket raqami', message: data?.ticket }, { name: 'Schet', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, data?.currency) }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Izoh', message: data?.comment }]
                return info
            }
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
                }
            ],
            updateLine: 1,
            lastStep: 42,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Mahalliy xarid to'lovi",
            comment: `Sana:\n\nTicket raqami :\nXorijiy to'lov.\nTo'lov nomeri:\nTovar nomi:\nZakaz nomeri:\nKimga (Yetkazib beruvchi):\nTo'lovchi:\nTo'lov summasi:\nTo'lov turi: (zaklad, tovar uchun, kontener uchun, rasxod uchun kabi)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#tolov\n#21059MY(Zakaz nomeri)`,
            update: [
                {
                    id: 1,
                    name: "Sap Document",
                    message: `Hujjatni tanlang`,
                    btn: () => empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2),
                    step: '41'
                },
                {
                    id: 2,
                    name: "Yetkazib beruvchi",
                    message: 'Поставщик (Yetkazib beruvchi) ni ismini yozing',
                    btn: () => empDynamicBtn(),
                    step: '42'
                },
                {
                    id: 3,
                    name: "Sana",
                    message: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`,
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
                        let data = await b1Controller.getCurrentRate('USD')
                        let rate = data[0]?.Rate
                        updateData(user.currentDataId, { currencyRate: rate })
                        let btn = rate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+rate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
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
                    message: `Sana:\n\nTicket raqami :\nXorijiy to'lov.\nTo'lov nomeri:\nTovar nomi:\nZakaz nomeri:\nKimga (Yetkazib beruvchi):\nTo'lovchi:\nTo'lov summasi:\nTo'lov turi: (zaklad, tovar uchun, kontener uchun, rasxod uchun kabi)\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#tolov\n#21059MY(Zakaz nomeri)`,
                    btn: () => empDynamicBtn(),
                    step: '50'
                },
                {
                    id: 10,
                    name: "Hisob Nuqtasi",
                    message: `Hisob Nuqtasini tanlang`,
                    btn: async () => await dataConfirmBtnEmp(ocrdList, 1, 'point'),
                    step: '51'
                },
                {
                    id: 4,
                    name: "To'lov usullari , Valyuta , Schet",
                    message: `To'lov usullarini tanlang`,
                    btn: async ({ chat_id }) => {
                        let btnList = [{ name: 'Naqd', id: 'Naqd' }, { name: 'Karta', id: 'Karta' }, { name: 'Terminal', id: 'Terminal' }, { name: `O'tkazma`, id: `O'tkazma` }]
                        return await dataConfirmBtnEmp(btnList, 2, 'payType')
                    },
                    step: '45'
                },
            ],
            updateLine: 2,
            lastStep: 52,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                let paymentType = get(data, 'payment', true) ? `Входящий платеж(Kiruvchi to'lov)` : `Исходящий платеж(Chiquvchi to'lov)`
                let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')

                let info = [{ name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Yetkazib beruvchi', message: vendorName }, { name: `Data registratsiya (To'lov To'lov sanasisi)`, message: get(data, 'startDate') }, { name: `Data otneseniya (Hisobot To'lov sanasisi)`, message: get(data, 'endDate') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Schet', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, 'UZS') }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: `Mahalliy yetkazib beruvchilarga to'lov` }, { name: 'Izoh', message: data?.comment },]
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
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Naqd/Karta hisobidan to'lov/xarajat",
            comment: `Sana:\n\nNaqd to'lov:\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n-Sotib olinayotgan tovar / xizmat yoki harajat nom:\n-To'lovchi: Bahodir aka:\n- To'lov/Harajat jami summasi:\n- To'lov summasi: \n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!:\n\n#tolov`,
            update: [
                {
                    id: 1,
                    name: "Sap Document",
                    message: `Hujjatni tanlang`,
                    btn: () => empDynamicBtn([`Исходящий платеж(Chiquvchi to'lov)`, `Входящий платеж(Kiruvchi to'lov)`], 2),
                    step: '61'
                },
                {
                    id: 2,
                    name: "Document Type (Schet,Поставщик)",
                    message: 'Document type ni tanlang',
                    btn: () => empDynamicBtn([`Schet(Hisob)`, `Заказчик(Группа: Xodimlar)(Xodim)`], 2),
                    step: '62'
                },
                {
                    id: 3,
                    name: "Sana",
                    message: `1)Data registratsiya (To'lov sanasi) Yil.Oy.Kun : 2023.11.20 \n2)Data otneseniya (Hisobot To'lov sanasi) Yil.Oy.Kun  : 2023.11.20`,
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
                        let data = await b1Controller.getCurrentRate('USD')
                        let rate = data[0]?.Rate
                        updateData(user.currentDataId, { currencyRate: rate })
                        let btn = rate ? await dataConfirmBtnEmp([{ name: formatterCurrency(+rate, 'USD'), id: 'USD' }], 1, 'rate') : empDynamicBtn()
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
                    message: `Sana:\n\nNaqd to'lov:\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n-Sotib olinayotgan tovar / xizmat yoki harajat nom:\n-To'lovchi: Bahodir aka:\n- To'lov/Harajat jami summasi:\n- To'lov summasi: \n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!:\n\n#tolov`,
                    btn: () => empDynamicBtn(),
                    step: '50'
                },
                {
                    id: 10,
                    name: "Hisob Nuqtasi",
                    message: `Hisob Nuqtasini tanlang`,
                    btn: async () => await dataConfirmBtnEmp(ocrdList, 1, 'point'),
                    step: '51'
                },
                {
                    id: 4,
                    name: "To'lov usullari , Valyuta , Schet",
                    message: `To'lov usullarini tanlang`,
                    btn: async ({ chat_id }) => {
                        let btnList = [{ name: 'Naqd', id: 'Naqd' }, { name: 'Karta', id: 'Karta' }, { name: 'Terminal', id: 'Terminal' }, { name: `O'tkazma`, id: `O'tkazma` }]
                        return await dataConfirmBtnEmp(btnList, 2, 'payType')
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
                        let ddsList = get(list, 'documentType') ? Object.keys(DDS)?.filter(item => DDS[item].includes(+get(list, 'accountCodeOther'))).map((item, i) => {
                            return { name: item, id: i }
                        }) : (get(list, 'payment') ? { name: 'Qarz(Tushum)', id: 'Qarz(Tushum)' } : { name: '(Xodim) Qarz (Xarajat)', id: '(Xodim)Qarz(Xarajat)' })
                        return await dataConfirmBtnEmp(
                            ddsList, 2, 'dds')
                    },
                    step: '52'
                },
            ],
            updateLine: 2,
            lastStep: 52,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)

                let ddsList = get(data, 'documentType') ? Object.keys(DDS)?.filter(item => DDS[item].includes(+get(data, 'accountCodeOther'))) : (get(data, 'payment') ? ['Qarz(Tushum)'] : ['(Xodim) Qarz (Xarajat)'])
                if (!ddsList.includes(get(data, 'dds'))) {
                    updateData(user.currentDataId, { dds: ddsList?.length == 1 ? ddsList[0] : false })
                    data = infoData().find(item => item.id == user.currentDataId)
                }

                let paymentType = get(data, 'payment', false) ? `Входящий платеж(Kiruvchi to'lov)` : `Исходящий платеж(Chiquvchi to'lov)`
                let vendorName = get(data, 'vendorList', []).find(item => item.id == get(data, 'vendorId'))?.name
                let accountName = get(data, 'accountList50', []).find(item => item.id == get(data, 'accountCode', 1))?.name
                let pointName = get(ocrdList.find(item => item.id == data?.point), 'name', '')
                let docType = get(data, 'documentType') ? 'Schet(Hisob)' : 'Заказчик(Группа: Xodimlar)(Xodim)'
                let namesType = get(data, 'documentType') ? (get(data, 'accountList', []).find(item => item.id == get(data, 'accountCodeOther'))?.name) : vendorName

                let ddsName = get(data, 'documentType') ? get(data, 'dds', '❌') : (get(data, 'payment') ? 'Qarz(Tushum)' : '(Xodim) Qarz (Xarajat)')

                let info = [{ name: 'Menu', message: data?.menuName }, { name: 'SubMenu', message: data?.subMenu }, { name: 'SAP Document', message: paymentType }, { name: 'Document Type', message: docType }, { name: get(data, 'documentType') ? 'Schet(Hisob)' : 'Yetkazib beruvchi', message: namesType }, { name: `Data registratsiya (To'lov To'lov sanasisi)`, message: get(data, 'startDate') }, { name: `Data otneseniya (Hisobot To'lov sanasisi)`, message: get(data, 'endDate') }, { name: `To'lov Usuli`, message: data?.payType }, { name: 'Schet', message: `${accountName}` }, { name: 'Valyuta', message: data?.currency }, { name: 'Valyuta kursi', message: formatterCurrency(+data?.currencyRate, 'UZS') }, { name: 'Summa', message: formatterCurrency(+data?.summa, data?.currency) }, { name: 'Hisob Nuqtasi', message: pointName }, { name: 'Statya DDS', message: ddsName }, { name: 'Izoh', message: data?.comment },]
                return info
            }
        },
        {
            name: "Naqd Bojxonaga oid xarajatlar"
        },
        {
            name: "Click Bojxonaga oid xarajatlar"
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
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
    ],
    4: [
        {
            name: "D12 Shartnoma shabloni",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "D64 Shartnoma shabloni",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "D777 Shartnoma shabloni",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Distribyutsiya Shartnoma shabloni",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        }
    ],
    5: [
        {
            name: "Narx chiqarishni tasdiqlash xitoy",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Narx chiqarishni tasdiqlash mahalliy",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        }
    ],
    6: [
        {
            name: "SAPda o'zgartirishni tasdiqlash",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Do'kon xarid",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Chegirma",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        },
        {
            name: "Yangi tovar nomi",
            comment: "Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov",
            update: [
                {
                    id: 1,
                    name: "Izoh",
                    message: `Sana:\n\nBank to'lov.\n- To'lov/Harajat sababi:\n- Yetkazib beruvchi:\n- Sotib olinayotgan tovar / xizmat yoki harajat nom:\n- To'lovchi: Bolter\n- To'lov/Harajat jami summasi:\n- To'lov summasi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\nTasdiqlovchi:\n#btolov `,
                    btn: () => empDynamicBtn(),
                    step: '13'
                }
            ],
            updateLine: 1,
            lastStep: 62,
            infoFn: ({ chat_id }) => {
                let user = infoUser().find(item => item.chat_id == chat_id)
                let data = infoData().find(item => item.id == user.currentDataId)
                let info = [{ name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
                return info
            }
        }
    ]
}


let DDS = {
    "Asosiy vosita haridi": [0820, 0830],
    "Bojxona xarajati": [1511],
    "Yuk tushirish xarajati": [1512],
    "Deklarant xarajati": [1513],
    "Logistika xarajati/Yuk tushirish xarajati": [1514],
    "Qarz (Xarajat)/Qarz(Tushum) ": [4720, 6820],
    "Xorijiy yetkazib beruvchilarga to'lov ": [5530],
    "Inventarizaatsiya": [5910],
    "Kassa farqi": [5930, 5931, 5934, 5935, 5936],
    "Mahalliy yetkazib beruvchilarga to'lov": [6010],
    "Soliq(Xarajat)": [6410, 6411, 6412, 6413, 6414, 6415],
    "Oylik(Xarajat)": [6710],
    "Dividend(Xarajat) ": [8710],
    "Bonus xodimlar(Xarajat)": [9150],
    "Yetkazib berish xarajati": [9160, 9220, 9221, 9222, 9223, 9228],
    "Distribyutsiya xodimlar yo'lkirasi": [9229],
    "Asosiy vosita chiqib ketishidan foyda ": [9310],
    "Boshqa tushumlar(Tushum)": [9390],
    "Adminstrativ xarajat": [9440],
    "Bank xizmati (Xarajat)": [9441],
    "Ijara korxona(Xarajat) ": [9444],
    "Ijara xodimlarga(Xarajat)": [9445],
    "Internet xarajati": [9446],
    "Joriy Remont(Xarajat)": [9447],
    "Kapital Remont(Xarajat) ": [9448],
    "Kommunal xarajatlar": [9449],
    "Marketing xarajati": [9450],
    "Mehmondorchilik(Xarajat)": [9451],
    "Aloqa xizmati": [9452],
    "Moddiy yordam(Xarajat)": [9453],
    "Operatsion xarajatlar ": [9454],
    "Ovqat(Xarajat) ": [9455],
    "Dastur xarajati": [9457],
    "Pul o'tkazish xarajati": [9458],
    "Texnik xizmat(Xarajat)": [9459],
    "TMB xaridi(Xarajat)/TMB sotuvi(Tushum)": [9460],
    "Xizmat safari xarajati ": [9461],
    "Yoqilg'i(Xarajat)": [9462],
    "Kurs farqi": [9465, 9540, 9620],
    "Naqd(Tushum)": [5020, 5021, 5030, 5031, 5040, 5041, 5060, 5061, 5080, 5081, 5090, 5091],
    "Karta(Tushum)": [5020, 5030, 5040, 5060, 5080, 5090],
    "Terminal(Tushum)": [5022, 5032, 5045, 5064, 5082, 5092],
    "O'tkazmalar(Tushum)": [5023, 5034, 5046, 5065, 5083, 5093],
}

let accounts43 = []

for (let i = 31; i <= 59; i++) {
    accounts43.push(`43${i}`)
}

let accounts50 = {
    'Naqd': {
        'USD': [5011, 5012, 5021, 5031, 5041, 5044, 5051, 5061, 5071, 5081, 5091, 3120],
        'UZS': [5010, 5020, 5030, 5040, 5043, 5060, 5062, 5070, 5080, 5090]
    },
    'Karta': {
        'UZS': [5050, 5052, 5053, 5054, 5063]
    },
    'Terminal': {
        'UZS': [5022, 5032, 5045, 5064, 5082, 5092]
    },
    "O'tkazma": {
        'UZS': [5023, 5034, 5046, 5065, 5083, 5093]
    }
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
        id: 'A',
        name: "Ark-buloq"
    },
    {
        id: 'D',
        name: "DISTRIBYUTSIYA"
    },
    {
        id: 'G',
        name: "GARAJ"
    },
    {
        id: 'KORXONA',
        name: "KORXONA"
    },
    {
        id: 'M',
        name: "Misafir"
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
    }
]


let accounts = {
    'AV/TMB': [
        0820,
        0830,
        9210,
        9310,
        9460
    ],
    'Kassa farq': [
        5930,
        5931,
        5932,
        5933,
        5934,
        5935,
        5936
    ],
    'Oylik/Bonus': [
        6710,
        9150,
        9456
    ],
    "Qarz": [
        4720,
        4730,
        4790,
        4890,
        6820,
        7820
    ],
    "Tovar qabuli": [
        1510,
        1511,
        1512,
        1513,
        1514,
        9463,
        9464
    ],
    "Doimiy xarajat": [
        3120,
        5530,
        5540,
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
    ],
    "Yetkazish": [
        9160,
        9220,
        9221,
        9222,
        9223,
        9224,
        9225,
        9226,
        9227,
        9228,
        9229
    ]
}

let subAccounts50 = {
    'Naqd': [5011, 5012, 5021, 5031, 5041, 5044, 5051, 5061, 5071, 5081, 5091, 3120, 5010, 5020, 5030, 5040, 5043, 5060, 5062, 5070, 5080, 5090],
    'Karta': [5050, 5052, 5053, 5054, 5063],
    'Terminal': [5022, 5032, 5045, 5064, 5082, 5092],
    "O'tkazma": [5023, 5034, 5046, 5065, 5083, 5093]

}







module.exports = {
    Menu,
    SubMenu,
    accounts43,
    accounts50,
    ocrdList,
    accounts,
    DDS,
    subAccounts50
}

