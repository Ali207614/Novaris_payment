const { get } = require("lodash");
const { infoPermisson, infoUser } = require("../helpers");
const { empDynamicBtn } = require("./function_keyboards");

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
            [{ text: 'Orqaga' }]
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
                    text: "Bajarilmagan so'rovlar",
                },
                {
                    text: "Bajarilgan so'rovlar",
                },
            ],
            [
                {
                    text: "Rad etilgan so'rovlar",
                }
            ],
            [{ text: 'Orqaga' }]

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
                    text: "Tasdiqlanmagan so'rovlar",
                },

                {
                    text: "Tasdiqlanib , bajarilmagan so'rovlar",
                },
            ],
            [
                {
                    text: "Tasdiqlanib , bajarilishi kutilayotgan so'rovlar",
                },
            ],
            [
                {
                    text: "Rad etilgan so'rovlar",
                },
                {
                    text: "Bajarilgan so'rovlar",
                },
            ],
            [{ text: 'Orqaga' }]
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
                },
                {
                    text: "Gruppalar"
                },
                {
                    text: "Schet"
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

const mainMenuByRoles = ({ chat_id }) => {
    let user = infoUser().find(item => item.chat_id == chat_id)
    let permissons = infoPermisson().find(item => {
        return item.chat_id == `${chat_id}`
    })
    let roles = get(permissons, 'roles', [])
    if (get(user, 'JobTitle', '') == 'Admin') {
        return adminKeyboard
    }
    if (roles?.length) {
        let permissonMenuId = {
            1: 'Xodim',
            2: 'Tasdiqlovchi',
            3: 'Bajaruvchi'
        }
        let menu = empDynamicBtn(roles.map(item => permissonMenuId[item]), 2, false)
        return menu
    }
    return {
        parse_mode: "Markdown",
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    {
                        text: 'Menular mavjud emas'
                    }
                ]
            ]
        },
    };
}

module.exports = { mainMenuByRoles, option, jobMenu, empKeyboard, empMenuKeyboard, adminKeyboard, affirmativeKeyboard, executorKeyboard }