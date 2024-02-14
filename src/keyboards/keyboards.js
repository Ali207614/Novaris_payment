const option = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "Telefon raqam jo'natish",
                    request_contact: true,
                },
            ],
            ["Bekor qilish"],
        ],
    },
};


const empKeyboard = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "So'rov Yuborish",
                },
                {
                    text: "Kutilayotgan so’rovlar",
                },
            ],
            [
                {
                    text: "Tasdiqlangan so’rovlar",
                },
                {
                    text: "Rad etilgan so'rovlar",
                },
            ],
        ],
    },
};

const empMenuKeyboard = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "Xorijiy xarid",
                },
                {
                    text: "Mahalliy xarid",
                },
                {
                    text: "To'lov/Xarajat",
                },
            ],
            [

                {
                    text: "Shartnoma",
                },
                {
                    text: "Narx chiqarish",
                },
                {
                    text: "Boshqa",
                },
            ],
            [
                {
                    text: "Orqaga",
                },
            ],
        ],
    },
};



const executorKeyboard = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "Bajarilgan",
                },
            ],
        ],
    },
};

const affirmativeKeyboard = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "Tasdiqlangan",
                },
            ],
        ],
    },
};

const adminKeyboard = {
    parse_mode: "Markdown",
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [
                {
                    text: "Foydalanuvchilar",
                },
                {
                    text: "Ma'lumotlar",
                }
            ],
            [
                {
                    text: "Menular"
                }
            ]
        ],
    },
};


let jobMenu = {
    'Xodim': empKeyboard,
    'Tasdiqlovchi': affirmativeKeyboard,
    'Bajaruvchi': executorKeyboard,
    'Admin': adminKeyboard
}

module.exports = { option, jobMenu, empKeyboard, empMenuKeyboard, adminKeyboard }