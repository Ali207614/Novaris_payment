const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getManageableAdminUsers,
    searchManageableAdminUsers,
    toAdminUserButtonList
} = require('../src/helpers/adminUserDirectory');

test('admin user directory excludes admins from management lists', () => {
    const users = [
        { chat_id: 1, FirstName: 'Admin', JobTitle: 'Admin' },
        { chat_id: 2, LastName: 'Aliyev', FirstName: 'Vali', JobTitle: 'User' }
    ];

    assert.deepEqual(getManageableAdminUsers(users), [users[1]]);
});

test('admin user directory searches by name and normalized phone safely', () => {
    const users = [
        { chat_id: 1, LastName: 'Admin', FirstName: 'User', JobTitle: 'Admin', MobilePhone: '+998901111111' },
        { chat_id: 2, LastName: 'Karimov', FirstName: 'Aziz', JobTitle: 'User', MobilePhone: '+998 90 222 22 22' },
        { chat_id: 3, LastName: null, FirstName: 'Madina', JobTitle: null, MobilePhone: '998933333333' }
    ];

    assert.deepEqual(searchManageableAdminUsers(users, 'kari').map((user) => user.chat_id), [2]);
    assert.deepEqual(searchManageableAdminUsers(users, '90 222').map((user) => user.chat_id), [2]);
    assert.deepEqual(searchManageableAdminUsers(users, 'madina').map((user) => user.chat_id), [3]);
    assert.deepEqual(searchManageableAdminUsers(users, 'admin'), []);
});

test('admin user directory builds inline button rows only for selectable users', () => {
    const users = [
        { chat_id: 2, LastName: 'Karimov', FirstName: 'Aziz' },
        { LastName: 'No', FirstName: 'Chat' }
    ];

    assert.deepEqual(toAdminUserButtonList(users), [
        { id: 2, name: 'Karimov Aziz' }
    ]);
});
