const test = require('node:test');
const assert = require('node:assert/strict');
const {
    findMessageBackSubMenu,
    runMessageBackFlow
} = require('../src/helpers/messageBackFlow');

const createHarness = ({ users, data, permissions, menus, subMenusByMenu }) => {
    const sent = [];

    return {
        sent,
        deps: {
            Menu: () => menus,
            SubMenu: () => subMenusByMenu,
            infoPermisson: () => permissions,
            infoData: () => data,
            updateUser: (chatId, patch) => {
                const user = users.find((item) => item.chat_id == chatId);
                Object.assign(user, patch);
            },
            updateStep: (chatId, step) => {
                const user = users.find((item) => item.chat_id == chatId);
                user.user_step = step;
            },
            updateBack: (chatId, backItem) => {
                const user = users.find((item) => item.chat_id == chatId);
                user.back = [...(user.back || []), backItem];
            },
            updateData: (id, patch) => {
                const row = data.find((item) => item.id == id);
                Object.assign(row, patch);
            },
            writeData: (row) => {
                data.push(row);
            },
            sendMessageHelper: async (chatId, text, btn) => {
                sent.push({ chatId, text, btn });
                return { message_id: sent.length };
            },
            randomId: () => 'generated-id'
        }
    };
};

test('message-back submenu lookup uses current menu and permissions for duplicate names', () => {
    const subMenusByMenu = {
        6: [
            { id: 1, name: "Tovar o'chirish", source: 'static' },
            { id: 9999, name: "Tovar o'chirish", source: 'dynamic' }
        ],
        8: [
            { id: 1, name: "Tovar o'chirish", source: 'wrong-menu' }
        ]
    };

    const resolved = findMessageBackSubMenu({
        msgText: "Tovar o'chirish",
        subMenusByMenu,
        menuId: 6,
        user: { chat_id: 1, JobTitle: 'User' },
        permission: { permissonMenuEmp: { 6: ['9999'], 8: ['1'] } }
    });

    assert.equal(resolved.source, 'dynamic');
});

test('message-back runs a DB-backed main menu command when no static flow matched', async () => {
    const users = [{ chat_id: 1, user_step: 10, JobTitle: 'User', back: [] }];
    const data = [];
    const permissions = [{ chat_id: 1, permissonMenuEmp: { 6: ['9999'] } }];
    const menus = [{ id: 6, name: 'Boshqa', status: true, isDelete: false }];
    const subMenusByMenu = {
        6: [{ id: 9999, name: "Tovar o'chirish", comment: 'dynamic comment', status: true, isDelete: false }]
    };
    const { sent, deps } = createHarness({ users, data, permissions, menus, subMenusByMenu });

    const handled = await runMessageBackFlow({
        msgText: 'Boshqa',
        chat_id: 1,
        user: users[0],
        ...deps
    });

    assert.equal(handled, true);
    assert.equal(users[0].user_step, 60);
    assert.equal(users[0].currentDataId, 'generated-id');
    assert.deepEqual(data[0], { id: 'generated-id', menu: 6, menuName: 'Boshqa', chat_id: 1 });
    assert.equal(sent[0].text, 'Boshqa');
    assert.equal(sent[0].btn.reply_markup.keyboard[0][0].text, "Tovar o'chirish");
});

test('message-back runs a DB-backed submenu command and preserves the submenu id', async () => {
    const users = [{ chat_id: 1, user_step: 60, currentDataId: 'req-1', JobTitle: 'User', back: [] }];
    const data = [{ id: 'req-1', menu: 6, menuName: 'Boshqa', chat_id: 1 }];
    const permissions = [{ chat_id: 1, permissonMenuEmp: { 6: ['9999'] } }];
    const menus = [{ id: 6, name: 'Boshqa', status: true, isDelete: false }];
    const subMenusByMenu = {
        6: [
            { id: 1, name: "Tovar o'chirish", comment: 'static comment', status: true, isDelete: false },
            { id: 9999, name: "Tovar o'chirish", comment: 'dynamic comment', status: true, isDelete: false }
        ]
    };
    const { sent, deps } = createHarness({ users, data, permissions, menus, subMenusByMenu });

    const handled = await runMessageBackFlow({
        msgText: "Tovar o'chirish",
        chat_id: 1,
        user: users[0],
        ...deps
    });

    assert.equal(handled, true);
    assert.equal(data[0].subMenu, "Tovar o'chirish");
    assert.equal(data[0].subMenuId, 9999);
    assert.equal(users[0].user_step, 3001);
    assert.equal(sent[0].text, 'Mijoz ismini yozing');
});
