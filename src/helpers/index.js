const fs = require("fs");
const { get } = require("lodash");
const path = require("path");
const { bot } = require('../config')

function infoUser() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "user.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs;
}

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

function writeUser(userData) {
    let users = infoUser();
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
        JSON.stringify([...users, { ...userData, creationDate: new Date() }], null, 4)
    );
}
function infoGroup() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "group.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : {};
    return docs
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

function updateUser(chat_id, userData) {
    let users = infoUser();
    let index = users.findIndex((item) => item.chat_id === chat_id);
    users[index] = { ...users[index], ...userData };
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
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


function updateBack(chat_id, userData) {
    let users = infoUser();
    let index = users.findIndex((item) => item.chat_id === chat_id);
    let last = users[index].back.slice(-1)[0]
    if (!last || (last.step != userData.step)) {
        users[index].back = [...users[index]?.back, userData];
    }
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
        JSON.stringify(users, null, 4)
    );
}

function deleteBack(chat_id, step) {
    let users = infoUser();
    let index = users.findIndex((item) => item.chat_id === chat_id);
    users[index].back = get(users[index], 'back', []).filter(item => item.step != step);
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
        JSON.stringify(users, null, 4)
    );
}

function updateStep(chat_id = '', user_step = 1) {
    let users = infoUser();
    let index = users.findIndex((item) => item.chat_id == chat_id);
    users[index].user_step = user_step;
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
        JSON.stringify(users, null, 4)
    );
}

function infoPermisson() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "permisson.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs;
}

function updatePermisson(id, data) {
    let main = infoPermisson();
    let index = main.findIndex((item) => item.chat_id == id);
    if (index != -1) {
        main[index] = { ...main[index], ...data };
    }
    else {
        main.push({ chat_id: id, ...data })
    }
    fs.writeFileSync(
        path.join(process.cwd(), "database", "permisson.json"),
        JSON.stringify(main, null, 4)
    );
}

function writePermisson(data) {
    let main = infoPermisson();
    fs.writeFileSync(
        path.join(process.cwd(), "database", "permisson.json"),
        JSON.stringify([...main, data], null, 4)
    );
}

function infoData() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "data.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs;
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


function updateData(id, data) {
    let main = infoData();
    let index = main.findIndex((item) => item.id === id);
    main[index] = { ...main[index], ...data };
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify(main, null, 4)
    );
}

function writeData(data) {
    let main = infoData();
    let { ID } = infoID()
    let currentDate = new Date();
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify([...main, { ...data, creationDate: formatLocalDateToISOString(currentDate), full: false, is_delete: false, ID }], null, 4)
    );
    updateID(+ID + 1)
}

function deleteData({ id }) {
    let main = infoData();
    main = main.filter(item => item.id != id)
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify(main, null, 4)
    );
}

function deleteAllInvalidData({ chat_id }) {
    let main = infoData();
    let data = main.filter(item => item.chat_id == chat_id && !item.full).map(item => item.id)
    main = main.filter(item => !data.includes(item.id))
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify(main, null, 4)
    );
}

function confirmativeListFn() {
    return infoUser().filter(item => item.JobTitle == 'Tasdiqlovchi')
}
function executerListFn() {
    return infoUser().filter(item => item.JobTitle == 'Bajaruvchi')
}

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // Date.UTC yil, oy (0-indexed), kun
}

async function sendMessageHelper(...arg) {
    let file = arg.find(item => get(item, 'file'))
    if (file && get(file, 'file.send') && get(file, 'file.document')) {
        let [chat_id, text, btn] = arg.filter(item => !get(item, 'file'))
        return await bot.sendDocument(chat_id, get(file, 'file.document.file_id'), {
            caption: text,
            reply_markup: btn?.reply_markup
        })
    }

    return await bot.sendMessage(...arg)
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
    executerListFn,
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
    sendMessageHelper
}