const TelegramAPi = require("node-telegram-bot-api");
let test_token = `7191276212:AAGYMDxCXFnYEnrmoZd9OH_ey3BQTblW-Ec`
let token = `5902250488:AAEXcOm02e6PohBxNLL-s-7rczUrrcpLTEI`
// 192.168.1.3
// 192.168.1.3
let conn_params = {
    serverNode: '192.168.1.3:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};
let jiraToken = 'ATATT3xFfGF03KuknJ3pr_bErcKptVcFHzSc7E-SihdqZEqlMJ3rGKSICUD8ALXkXxGagDapxfwOkk1bbNtiJqRxAz9g68XR_m_guM9j88gfx1K2bIKwchWZnM-LWUTJBlEKrM38nlbVoyT1336kN7ESxPU5sRdcl63ZJzBz6O0xIKI4mk6wa9s=829302D7'

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = '561932032'

module.exports = { bot, personalChatId, conn_params, jiraToken }


