const { bot, personalChatId, conn_params } = require("./config");
const botController = require("./controllers/botController");
const b1Controller = require("./controllers/b1Controller")
const hanaClient = require("@sap/hana-client");
let tls = require('tls');
const { sendMessageHelper } = require("./helpers");

const start = async () => {
    try {
        bot.setMyCommands([
            { command: "/start", description: "start" },
            { command: "/info", description: "info" },
        ]);

        tls.DEFAULT_MIN_VERSION = 'TLSv1';
        const connection = hanaClient.createConnection();
        connection.connect(conn_params, async (err) => {
            if (err) {
                sendMessageHelper("561932032", `Connection error ${err}`);
            } else {
                bot.on("text", async (msg) => {
                    try {
                        let chat_id = msg.chat.id;
                        await botController.text(msg, chat_id)
                    } catch (err) {
                        sendMessageHelper(personalChatId, `${err} err text`);
                    }
                });

                bot.on("document", async (msg) => {
                    try {
                        let chat_id = msg.chat.id;
                        await botController.document(msg, chat_id)
                    } catch (err) {
                        sendMessageHelper(personalChatId, `${err} err file`);
                    }
                });

                bot.on("callback_query", async (msg) => {
                    try {
                        let chat_id = msg.message.chat.id;
                        let data = msg.data.split("#");
                        await botController.callback_query(msg, data, chat_id)
                    } catch (err) {
                        sendMessageHelper(personalChatId, `${err} err callback`);
                    }
                });

                bot.on("contact", async (msg) => {
                    try {
                        let chat_id = msg.chat.id;
                        await botController.contact(msg, chat_id)
                    } catch (err) {
                        sendMessageHelper(personalChatId, `${err} err contact`);
                    }
                });
            }
        });
        global.connection = connection;



    } catch (err) {
        sendMessageHelper(personalChatId, `${err} katta`);
    }
};

start();


