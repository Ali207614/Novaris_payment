const TelegramAPi = require("node-telegram-bot-api");
let token = `7191276212:AAG0J_K5UwoZLBqHn67gpZ8dsH6NKHGyS-Q`
//let token = `5902250488:AAEXcOm02e6PohBxNLL-s-7rczUrrcpLTEI`
// 192.168.1.3
// 66.45.245.130
let conn_params = {
    serverNode: '192.168.1.3:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};
let jiraToken = 'ATATT3xFfGF06F4pe8yWqSjhAc7gRxLyVHc7QMqB4-NEJwzTCYCIr-z0VOm_aaOZkvdr1Ywb4_ziWS04kuo9wEslSELRfszUonQJVAbUX8NvU43WKSEpDfuMTN2DGIFDJH-QCKUKzI0GWNTNQwm53F2DptiRbecmoDFadZ98FA_QUDdkn4QFb7I=4A9D8431'

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = '561932032'

module.exports = { bot, personalChatId, conn_params, jiraToken }


