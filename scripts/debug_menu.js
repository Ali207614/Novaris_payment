
const { connectDB, disconnectDB } = require('../src/database/mongoose.module');
const permissionStore = require('../src/helpers/permissionStore');
const { Menu } = require('../src/credentials');
const _ = require('lodash');

async function debug() {
    await connectDB();
    await permissionStore.syncFromMongo();

    const p = permissionStore.infoPermisson().find(i => i.chat_id == 8641624618);
    const pme = Object.fromEntries(Object.entries(_.get(p, 'permissonMenuEmp', {})).filter(i => i[1]?.length));
    
    console.log("Permission Keys:", Object.keys(pme));
    
    const menuArr = Menu();
    console.log("Menu Array length:", menuArr.length);
    
    const filteredMenu = menuArr.filter(item => Object.keys(pme).includes(String(item.id)) && item.isDelete == false && item.status == true);
    console.log("Filtered Menu length:", filteredMenu.length);
    console.log("Button names:", filteredMenu.map(item => item.name));
    
    await disconnectDB();
    process.exit();
}
debug();
