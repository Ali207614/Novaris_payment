const fs = require("fs");
const { get } = require("lodash");
const path = require("path");

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




function writeUser(userData) {
    let users = infoUser();
    fs.writeFileSync(
        path.join(process.cwd(), "database", "user.json"),
        JSON.stringify([...users, userData], null, 4)
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
    fs.writeFileSync(
        path.join(process.cwd(), "database", "permisson.json"),
        JSON.stringify(main, null, 4)
    );
}

function writePermisson(data) {
    let main = infoPermisson();
    let { ID } = infoID()
    fs.writeFileSync(
        path.join(process.cwd(), "database", "permisson.json"),
        JSON.stringify([...main, data], null, 4)
    );
    updateID(+ID + 1)
}

function infoData() {
    let docs = fs.readFileSync(
        path.join(process.cwd(), "database", "data.json"),
        "UTF-8"
    );
    docs = docs ? JSON.parse(docs) : [];
    return docs;
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
    fs.writeFileSync(
        path.join(process.cwd(), "database", "data.json"),
        JSON.stringify([...main, { ...data, full: false, is_delete: false, ID }], null, 4)
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


module.exports = {
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
    writePermisson
}