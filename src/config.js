const TelegramAPi = require("node-telegram-bot-api");
let token = `5902250488:AAEXcOm02e6PohBxNLL-s-7rczUrrcpLTEI`

let conn_params = {
    serverNode: '212.129.21.11:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = '561932032'

module.exports = { bot, personalChatId, conn_params }