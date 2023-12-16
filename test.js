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

let accounts50 = {
    'Naqd': {
        'USD': [5011, 5012,],
        'UZS': [5010,]
    },
    'Karta': {
        'UZS': [5050, 5052]
    },
    'Terminal': {
        'UZS': [5022, 5032,]
    },
    "O'tkazma": {
        'UZS': [5023, 5034]
    }
}


console.log(Object.keys(accounts50).map(item => {
    return { ...accounts50[item]['UZS'], ...accounts50[item]['USD'] }
}))