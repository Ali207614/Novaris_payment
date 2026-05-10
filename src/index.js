const { bot, personalChatId, conn_params } = require("./config");
const botController = require("./controllers/botController");
const b1Controller = require("./controllers/b1Controller")
const verifixController = require("./controllers/verifixController");
const hanaClient = require("@sap/hana-client");
let tls = require('tls');
const { sendMessageHelper, deleteData, updateUser } = require("./helpers");

const { connectDB } = require("./database/mongoose.module");
const loggerService = require("./services/loggerService");

const start = async () => {
    try {
        // Initialize MongoDB without blocking the main bot logic initially
        connectDB().then(async () => {
            const { userStore } = require("./helpers/userStore");
            const permissionStore = require("./helpers/permissionStore");
            await Promise.all([
                userStore.syncFromMongo(),
                permissionStore.syncFromMongo()
            ]);
            console.log("MongoDB synchronization complete.");
        }).catch(err => {
            console.error("MongoDB init error:", err);
            loggerService.logError(err, { source: 'migration', action: 'DB_CONNECT' });
        });


        bot.setMyCommands([
            { command: "/start", description: "start" },
            { command: "/info", description: "info" },
        ]);

        tls.DEFAULT_MIN_VERSION = 'TLSv1';
        const connection = hanaClient.createConnection();
        
        // Attempt SAP HANA connection
        connection.connect(conn_params, async (err) => {
            if (err) {
                console.error("SAP HANA Connection error:", err);
                sendMessageHelper(personalChatId, `SAP Connection error: ${err.message || err}`);
                loggerService.logError(err, { source: 'sap_sync', action: 'SAP_CONNECT' });
            } else {
                console.log("SAP HANA connected successfully.");
                loggerService.logSystemAction('sap_sync', 'SAP_CONNECT_SUCCESS');
                deleteData({ id: 'K9lonOcgG3' });
            }
        });

        // Attempt Verifix connection
        verifixController.auth().then(result => {
            if (result.status) {
                console.log("Verifix authenticated successfully.");
                loggerService.logSystemAction('verifix_sync', 'VERIFIX_AUTH_SUCCESS');
            } else {
                console.warn("Verifix Authentication failed:", result.message);
                loggerService.logError(new Error(result.message), { source: 'verifix_sync', action: 'VERIFIX_AUTH_FAILURE' });
            }
        }).catch(err => {
            console.error("Verifix Connection error:", err);
            loggerService.logError(err, { source: 'verifix_sync', action: 'VERIFIX_CONNECT_ERROR' });
        });

        global.connection = connection;

        // Register bot listeners independently of SAP connection
        bot.on("text", async (msg) => {
            try {
                let chat_id = msg.chat.id;
                await botController.text(msg, chat_id);
            } catch (err) {
                console.error("Bot text handler error:", err);
                sendMessageHelper(personalChatId, `${err} err text`);
                loggerService.logError(err, { 
                    source: 'telegram_bot', 
                    action: 'TEXT_HANDLER_ERROR',
                    metadata: { chatId: msg.chat.id }
                });
            }
        });

        bot.on("document", async (msg) => {
            try {
                let chat_id = msg.chat.id;
                await botController.document(msg, chat_id);
            } catch (err) {
                console.error("Bot document handler error:", err);
                sendMessageHelper(personalChatId, `${err} err file`);
                loggerService.logError(err, { 
                    source: 'telegram_bot', 
                    action: 'DOCUMENT_HANDLER_ERROR',
                    metadata: { chatId: msg.chat.id }
                });
            }
        });

        bot.on("callback_query", async (msg) => {
            let chat_id = msg.message.chat.id;
            let data = msg.data.split("#");
            try {
                if (data.length) {
                    data = data.map(item => item.trim());
                }
                await botController.callback_query(msg, data, chat_id);
            } catch (err) {
                console.error("Bot callback_query handler error:", err);
                sendMessageHelper(personalChatId, `${err} err callback`);
                loggerService.logError(err, { 
                    source: 'telegram_bot', 
                    action: 'CALLBACK_QUERY_ERROR',
                    metadata: { chatId: chat_id }
                });
            }
        });

        bot.on("contact", async (msg) => {
            try {
                let chat_id = msg.chat.id;
                await botController.contact(msg, chat_id);
            } catch (err) {
                console.error("Bot contact handler error:", err);
                sendMessageHelper(personalChatId, `${err} err contact`);
                loggerService.logError(err, { 
                    source: 'telegram_bot', 
                    action: 'CONTACT_ERROR',
                    metadata: { chatId: msg.chat.id }
                });
            }
        });



    } catch (err) {
        sendMessageHelper(personalChatId, `${err} katta`);
    }
};

start();


