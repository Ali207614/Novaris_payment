const fs = require("fs");
const { get } = require("lodash");
const path = require("path");
const { dataStore } = require('./dataStore')
const { userStore } = require('./userStore')
const { bot } = require('../config')



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
    fs.writeFileSync(
        path.join(process.cwd(), "database", "session.json"),
        JSON.stringify(cookie, null, 4)
    );
}
function getSession() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "session.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : {};
    return docs
}


function infoGroup() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "group.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : {};
    return docs
}


function infoAccountPermisson() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "accountsPermisson.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : {};
    return docs
}

function writePermissonAccount(userData) {
    fs.writeFileSync(
        path.join(process.cwd(), "database", "accountsPermisson.json"),
        JSON.stringify(userData, null, 4)
    );
}

function writeGroup(userData) {
    let users = infoGroup();
    fs.writeFileSync(
        path.join(process.cwd(), "database", "group.json"),
        JSON.stringify([...users, { ...userData }], null, 4)
    );
}
function deleteGroup(id) {
    let users = infoGroup();
    users = users.filter((item) => item.id != id);
    fs.writeFileSync(
        path.join(process.cwd(), "database", "group.json"),
        JSON.stringify(users, null, 4)
    );
}

function updateGroup(id, userData) {
    let users = infoGroup();
    let index = users.findIndex((item) => item.id == id);
    users[index] = { ...users[index], ...userData };

    fs.writeFileSync(
        path.join(process.cwd(), "database", "group.json"),
        JSON.stringify(users, null, 4)
    );
}


function updateID(id) {
    fs.writeFileSync(
        path.join(process.cwd(), "database", "id.json"),
        JSON.stringify(
            { ID: id }
            , null, 4)
    );
}
function infoID() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "id.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : { ID: 0 };
    return docs;
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
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "accounts.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs;
}


function writeInfoAccountList(data) {
    fs.writeFileSync(
        path.join(process.cwd(), "database", "accounts.json"),
        JSON.stringify(data, null, 4)
    );
}

function writeMenu(data) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];
    fs.writeFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        JSON.stringify([...main, { ...data, status: true, isDelete: false, creationDate: new Date(), id: !main.length ? 7 : Math.max(...main.map(item => item.id)) + 1 }], null, 4)
    );
}
function updateMenu(id, data) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];
    let index = main.findIndex((item) => item.id == id);
    main[index] = { ...main[index], ...data };
    fs.writeFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        JSON.stringify(main, null, 4)
    );
}
function deleteMenu({ id }) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];;
    main = main.filter(item => item.id != id)
    fs.writeFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        JSON.stringify(main, null, 4)
    );
}

function infoMenu() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs.filter(item => item?.status && !item?.isDelete);
}

function infoAllMenu() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "menu.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs.filter(item => !item.isDelete)
}





function writeSubMenu(data) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];;
    fs.writeFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        JSON.stringify([...main, { ...data, isDelete: false, status: true, id: main?.length ? Math.max(...main.map(item => item.id)) + 1 : 1, creationDate: new Date() }], null, 4)
    );
}
function updateSubMenu(id, data) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];;
    let index = main.findIndex((item) => item.id == id);
    main[index] = { ...main[index], ...data };
    if (data?.comment) {
        main[index] = { ...main[index], update: [{ ...main[index].update[0], message: data.comment }] }
    }
    fs.writeFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        JSON.stringify(main, null, 4)
    );
}
function deleteSubMenu({ id }) {
    let main = fs.readFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        "UTF-8"
    );
    main = main ? JSON.parse(main) : [];;
    main = main.filter(item => item.id != id)
    fs.writeFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        JSON.stringify(main, null, 4)
    );
}

function infoAllSubMenu() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs.filter(item => !item.isDelete)
}
function infoSubMenu() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "subMenu.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs.filter(item => item?.status && !item?.isDelete);
}




function clone_data(data) {
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify(data, null, 4)
    );
}



function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // Date.UTC yil, oy (0-indexed), kun
}

async function sendMessageHelper(...arg) {
    try {
        let file = arg.find(item => get(item, 'file'))
        let lastFile = arg.find(item => get(item, 'lastFile'))
        if (get(lastFile, 'lastFile.file')) {
            let [chat_id, text, btn] = arg.filter(item => !get(item, 'file'))
            const mediaGroup = [
                {
                    media: get(file, 'file.document.file_id'),
                    type: 'document',
                },
                {
                    media: get(lastFile, 'lastFile.file.file_id'),
                    type: 'document',
                    caption: text,
                },
            ]
            bot.sendMediaGroup(chat_id, mediaGroup.filter(item => get(item, 'media'))).then(() => {
            }).catch(async (e) => {
                return await bot.sendMessage(chat_id, text)
            })
            return
        }
        if (file && get(file, 'file.send') && get(file, 'file.document')) {
            let [chat_id, text, btn] = arg.filter(item => !get(item, 'file'))
            return await bot.sendDocument(chat_id, get(file, 'file.document.file_id'), {
                caption: text,
                reply_markup: btn?.reply_markup
            }).then((data) => {
                return data
            }).catch(async e => {
                return await bot.sendMessage(chat_id, text)
            })
        }

        return await bot.sendMessage(...arg)
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
    dataStore.add(row);
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