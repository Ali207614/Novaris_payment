const TelegramAPi = require("node-telegram-bot-api");
// let token = `6702098246:AAFblR28Gk0xJkrTkvBxutjSkD1ev9dSJvk`
let token = `5902250488:AAEXcOm02e6PohBxNLL-s-7rczUrrcpLTEI`
// 192.168.1.3
let conn_params = {
    serverNode: '66.45.245.130:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};
let jiraToken = 'ATATT3xFfGF07HpGwaRH3zDiYxJJ3DTYa6y4vxLP3EN7eijyQdrG90NitT3ZCtU4ees0TxlW60VG00FW8d_9ujKziHy7KQhFqdPgjamm2x9qyPC9q21MUN7HClluixc8lZO5dXdXHVUUPxBtUk7_m4FAjEahno1Z-6NbxBiQt-5TdUHWpUF0sCA=6FDB20C2'

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = '561932032'

module.exports = { bot, personalChatId, conn_params, jiraToken }
