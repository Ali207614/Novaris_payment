const TelegramAPi = require("node-telegram-bot-api");
require("dotenv").config();

let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set in .env");
}

// 192.168.1.3
// 66.45.245.130
let conn_params = {
    serverNode: '192.168.1.3:30015',
    uid: 'SYSTEM',
    pwd: 'GrvYL8YX',
};
let jiraToken = process.env.JIRA_TOKEN || '';
let sapConnectionRequired = ['true', '1', 'yes', 'on'].includes(
    String(process.env.SAP_CONNECTION_REQUIRED || '').trim().toLowerCase()
);

let bot = new TelegramAPi(token, {
    polling: true,
});

let personalChatId = process.env.PERSONAL_CHAT_ID || '561932032'

module.exports = { bot, personalChatId, conn_params, jiraToken, sapConnectionRequired }

