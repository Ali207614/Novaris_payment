const { bot, personalChatId, conn_params } = require("./config");
const botController = require("./controllers/botController");
const b1Controller = require("./controllers/b1Controller")
const hanaClient = require("@sap/hana-client");


const start = async () => {
    try {
        bot.setMyCommands([
            { command: "/start", description: "start" },
            { command: "/info", description: "info" },
        ]);
        const connection = hanaClient.createConnection();
        connection.connect(conn_params, async (err) => {
            if (err) {
                bot.sendMessage("561932032", `Connection error ${err}`);
            } else {

                bot.on("text", async (msg) => {
                    let chat_id = msg.chat.id;
                    await botController.text(msg, chat_id)
                });

                bot.on("callback_query", async (msg) => {
                    try {
                        let chat_id = msg.message.chat.id;
                        let data = msg.data.split("#");
                        await botController.callback_query(msg, data, chat_id)
                    } catch (err) {
                        bot.sendMessage(personalChatId, `${err} err callback`);
                    }
                });

                bot.on("contact", async (msg) => {
                    try {
                        let chat_id = msg.chat.id;
                        await botController.contact(msg, chat_id)
                    } catch (err) {
                        bot.sendMessage(personalChatId, `${err} err contact`);
                    }
                });
            }
        });
        global.connection = connection;



    } catch (err) {
        bot.sendMessage(personalChatId, `${err} katta`);
    }
};

start();

