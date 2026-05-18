const fs = require("fs");
const { get } = require("lodash");
const path = require("path");
const { dataStore } = require('./dataStore')
const { userStore } = require('./userStore')
const legacyStore = require('./legacyStore')
const { bot } = require('../config')
const { splitTelegramText, TELEGRAM_SAFE_CAPTION_LIMIT } = require('./telegramText')



function formatterCurrency(
    number = 0,
    currency = "UZS",
    locale = "ru",
    maximumSignificantDigits = 10
) {
    return number.toLocaleString(locale, {
        style: "currency",
        currency: currency,
        maximumSignificantDigits: maximumSignificantDigits,
    });
}


function saveSession(cookie) {
    legacyStore.saveSession(cookie);
}
function getSession() {
    return legacyStore.infoSession();
}


function infoGroup() {
    return legacyStore.infoGroup();
}


function infoAccountPermisson() {
    return legacyStore.infoAccountPermission();
}

function writePermissonAccount(userData) {
    legacyStore.writeAccountPermission(userData);
}

function writeGroup(userData) {
    legacyStore.writeGroup(userData);
}
function deleteGroup(id) {
    legacyStore.deleteGroup(id);
}

function updateGroup(id, userData) {
    legacyStore.updateGroup(id, userData);
}


function updateID(id) {
    legacyStore.updateID(id);
}
function infoID() {
    return legacyStore.infoID();
}


const permissionStore = require('./permissionStore');

function infoPermisson() {
    return permissionStore.infoPermisson();
}

function updatePermisson(id, data) {
    return permissionStore.updatePermisson(id, data);
}

function writePermisson(data) {
    return permissionStore.writePermisson(data);
}




function infoAccountList() {
    return legacyStore.infoAccountList();
}


function writeInfoAccountList(data) {
    legacyStore.writeAccountList(data);
}

function writeMenu(data) {
    legacyStore.writeMenu(data);
}
function updateMenu(id, data) {
    legacyStore.updateMenu(id, data);
}
function deleteMenu({ id }) {
    legacyStore.updateMenu(id, { isDelete: true });
}

function infoMenu() {
    return legacyStore.infoMenu();
}

function infoAllMenu() {
    return legacyStore.infoMenu(true);
}





function writeSubMenu(data) {
    legacyStore.writeSubMenu(data);
}
function updateSubMenu(id, data) {
    legacyStore.updateSubMenu(id, data);
}
function deleteSubMenu({ id }) {
    legacyStore.updateSubMenu(id, { isDelete: true });
}

function infoAllSubMenu() {
    return legacyStore.infoSubMenu(true);
}
function infoSubMenu() {
    return legacyStore.infoSubMenu();
}




function clone_data(data) {
    fs.mkdirSync(path.join(process.cwd(), "data", "db"), { recursive: true });
    fs.writeFileSync(
        path.join(process.cwd(), "data", "db", "data.json"),
        JSON.stringify(data, null, 4)
    );
}



function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // Date.UTC yil, oy (0-indexed), kun
}

async function sendSplitTelegramMessage(chat_id, text, options) {
    const chunks = splitTelegramText(String(text ?? ''));
    let lastMessage = null;

    for (let i = 0; i < chunks.length; i++) {
        const isLast = i === chunks.length - 1;
        lastMessage = await bot.sendMessage(chat_id, chunks[i] || ' ', isLast ? options : undefined);
    }

    return lastMessage;
}

async function sendMessageHelper(...arg) {
    try {
        let file = arg.find(item => get(item, 'file'))
        let lastFile = arg.find(item => get(item, 'lastFile'))
        if (get(lastFile, 'lastFile.file')) {
            let [chat_id, text, btn] = arg.filter(item => !get(item, 'file') && !get(item, 'lastFile'))
            const mediaGroup = [
                {
                    media: get(file, 'file.document.file_id'),
                    type: 'document',
                },
                {
                    media: get(lastFile, 'lastFile.file.file_id'),
                    type: 'document',
                },
            ]
            return await bot.sendMediaGroup(chat_id, mediaGroup.filter(item => get(item, 'media'))).then(async () => {
                return await sendSplitTelegramMessage(chat_id, text, btn)
            }).catch(async () => {
                return await sendSplitTelegramMessage(chat_id, text, btn)
            })
        }
        if (file && get(file, 'file.send') && get(file, 'file.document')) {
            let [chat_id, text, btn] = arg.filter(item => !get(item, 'file'))
            const textValue = String(text ?? '')
            const useCaption = textValue.length <= TELEGRAM_SAFE_CAPTION_LIMIT
            return await bot.sendDocument(chat_id, get(file, 'file.document.file_id'), {
                ...(useCaption ? { caption: textValue, reply_markup: btn?.reply_markup } : {})
            }).then((data) => {
                if (useCaption) return data
                return sendSplitTelegramMessage(chat_id, textValue, btn)
            }).catch(async () => {
                return await sendSplitTelegramMessage(chat_id, textValue, btn)
            })
        }

        const [chat_id, text, btn] = arg
        return await sendSplitTelegramMessage(chat_id, text, btn)
    } catch (e) {
        console.log(e, ' bu err bu ')
    }
}

function formatLocalDateToISOString(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    // Get the timezone offset in hours and minutes
    const offset = -date.getTimezoneOffset();
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function infoData() {
    return dataStore.infoData();
}

function writeData(row) {
    return dataStore.add(row);
}

function updateData(id, data) {
    return dataStore.update(id, data);
}

function deleteData({ id }) {
    return dataStore.delete(id);
}

function deleteAllInvalidData({ chat_id }) {
    return dataStore.deleteAllInvalid(chat_id);
}


function infoUser() {
    return userStore.infoUser();
}
function writeUser(userData) {
    return userStore.writeUser(userData);
}
function updateUser(chat_id, userData) {
    return userStore.updateUser(chat_id, userData);
}
function updateStep(chat_id = "", user_step = 1) {
    return userStore.updateStep(chat_id, user_step);
}
function updateBack(chat_id, userData) {
    return userStore.updateBack(chat_id, userData);
}
function deleteBack(chat_id, step) {
    return userStore.deleteBack(chat_id, step);
}
function confirmativeListFn() {
    return userStore.confirmativeListFn();
}
function executorListFn() {
    return userStore.executorListFn();
}

module.exports = {
    parseDate,
    updateUser,
    writeUser,
    infoUser,
    updateStep,
    updateBack,
    deleteData,
    updateData,
    infoData,
    writeData,
    deleteAllInvalidData,
    formatterCurrency,
    confirmativeListFn,
    executorListFn,
    updateID,
    infoID,
    updatePermisson,
    infoPermisson,
    writePermisson,
    deleteBack,
    writeMenu,
    infoMenu,
    updateMenu,
    deleteMenu,
    writeSubMenu,
    updateSubMenu,
    deleteSubMenu,
    infoSubMenu,
    infoAllSubMenu,
    infoAllMenu,
    saveSession,
    getSession,
    writeGroup,
    deleteGroup,
    updateGroup,
    infoGroup,
    sendMessageHelper,
    infoAccountPermisson,
    writePermissonAccount,
    infoAccountList,
    writeInfoAccountList,
    clone_data
}
