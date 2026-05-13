const fs = require('fs');
let txt = fs.readFileSync('src/credentials/index.js', 'utf8');

const menuOld = `let Menu = () => {
    return [
        {
            name: 'Xorijiy xarid',
            status: true, isDelete: false,
            id: 1
        },
        {
            name: 'Mahalliy xarid',
            status: true, isDelete: false,
            id: 2
        },
        {
            name: "To'lov/Xarajat",
            status: true, isDelete: false,
            id: 3
        },
        {
            name: "Shartnoma",
            status: true, isDelete: false,
            id: 4
        },
        {
            name: "Narx chiqarish",
            status: true, isDelete: false,
            id: 5
        },
        {
            name: "Boshqa",
            status: true, isDelete: false,
            id: 6
        },
        ...infoMenu()
    ]
}`;

const menuNew = `let Menu = () => {
    let baseMenus = [
        {
            name: 'Xorijiy xarid',
            status: true, isDelete: false,
            id: 1
        },
        {
            name: 'Mahalliy xarid',
            status: true, isDelete: false,
            id: 2
        },
        {
            name: "To'lov/Xarajat",
            status: true, isDelete: false,
            id: 3
        },
        {
            name: "Shartnoma",
            status: true, isDelete: false,
            id: 4
        },
        {
            name: "Narx chiqarish",
            status: true, isDelete: false,
            id: 5
        },
        {
            name: "Boshqa",
            status: true, isDelete: false,
            id: 6
        }
    ];
    let baseIds = new Set(baseMenus.map(m => String(m.id)));
    return [
        ...baseMenus,
        ...infoMenu().filter(m => !baseIds.has(String(m.id)))
    ];
}`;

const subMenuOld = `    return {
        ...Object.fromEntries(Object.entries(menuCred).map(item => [item[0], item[1].map((el, i) => {
            return {
                ...el, id: i + 1, menuId: Number(item[0])
            }
        })])),
        ...newSubMenus
    }`;

const subMenuNew = `    let result = {
        ...Object.fromEntries(Object.entries(menuCred).map(item => [item[0], item[1].map((el, i) => {
            return {
                ...el, id: i + 1, menuId: Number(item[0])
            }
        })]))
    };
    for (let key in newSubMenus) {
        if (!result[key]) {
            result[key] = newSubMenus[key];
        } else {
            const existingIds = new Set(result[key].map(i => String(i.id)));
            result[key] = [...result[key], ...newSubMenus[key].filter(i => !existingIds.has(String(i.id)))];
        }
        result[key].sort((a, b) => a.id - b.id);
    }
    return result;`;

if (txt.includes(menuOld)) {
    txt = txt.replace(menuOld, menuNew);
    console.log("Menu replaced");
} else {
    console.log("menuOld not found");
}

if (txt.includes(subMenuOld)) {
    txt = txt.replace(subMenuOld, subMenuNew);
    console.log("SubMenu replaced");
} else {
    console.log("subMenuOld not found");
}

fs.writeFileSync('src/credentials/index.js', txt);
