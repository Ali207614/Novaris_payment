const { get } = require("lodash");

const SAP_UNAVAILABLE_USER_MESSAGE = [
    "SAP bazasi bilan aloqa vaqtincha mavjud emas.",
    "Iltimos, birozdan keyin qayta urinib ko'ring yoki admin bilan bog'laning."
].join("\n");

const SAP_CONNECTION_ERROR_PATTERNS = [
    "No Connection Available",
    "Connection failed",
    "connect failed",
    "SAP HANA Connection error",
    "System call 'connect' failed"
];

function getErrorMessage(error) {
    return get(error, "message") || String(error || "");
}

function isSapConnectionError(error) {
    const message = getErrorMessage(error);
    return SAP_CONNECTION_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

function buildAdminNotifierMessage(error, context = {}) {
    const message = getErrorMessage(error);
    const chatId = get(context, "chatId", "unknown");
    const handler = get(context, "handler", "unknown");

    if (isSapConnectionError(error)) {
        return [
            "SAP HANA ulanishida muammo.",
            `Handler: ${handler}`,
            `Chat ID: ${chatId}`,
            `Xatolik: ${message}`
        ].join("\n");
    }

    return `${message} err ${handler}`;
}

function getUserNotifierMessage(error) {
    if (isSapConnectionError(error)) {
        return SAP_UNAVAILABLE_USER_MESSAGE;
    }

    return "";
}

module.exports = {
    buildAdminNotifierMessage,
    getUserNotifierMessage,
    isSapConnectionError,
    SAP_UNAVAILABLE_USER_MESSAGE
};
