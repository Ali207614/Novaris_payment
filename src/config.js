const TelegramAPi = require("node-telegram-bot-api");
let token = `6702098246:AAFblR28Gk0xJkrTkvBxutjSkD1ev9dSJvk`

let conn_params = {
    serverNode: '66.45.245.130:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = '561932032'

module.exports = { bot, personalChatId, conn_params }
