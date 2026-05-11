const test = require('node:test');
const assert = require('node:assert/strict');
const {
    findLocalUserByVerifixEmployee,
    buildVerifixAccessRevocationPatch,
    buildEmptyPermissionPatch,
    buildVerifixDeleteNotificationText
} = require('../src/helpers/verifixDeleteAccess');

test('local user is resolved by Verifix EmployeeID first', () => {
    const users = [
        { chat_id: 10, EmployeeID: 100, MobilePhone: '+998901111111' },
        { chat_id: 20, EmployeeID: 200, MobilePhone: '+998902222222' }
    ];

    const found = findLocalUserByVerifixEmployee(users, {
        EmployeeID: 200,
        MobilePhone: '+998901111111'
    });

    assert.equal(found.chat_id, 20);
});

test('local user is resolved by matching phone suffix when EmployeeID is absent', () => {
    const users = [
        { chat_id: 10, MobilePhone: '+998901111111' },
        { chat_id: 20, MobilePhone: '998902222222' }
    ];

    const found = findLocalUserByVerifixEmployee(users, {
        MobilePhone: '902222222'
    });

    assert.equal(found.chat_id, 20);
});

test('Verifix removal revokes bot access and every menu tool permission', () => {
    const userPatch = buildVerifixAccessRevocationPatch(999);
    const permissionPatch = buildEmptyPermissionPatch();

    assert.equal(userPatch.is_active, false);
    assert.equal(userPatch.user_step, 0);
    assert.equal(userPatch.currentUserRole, '');
    assert.deepEqual(userPatch.back, []);
    assert.equal(userPatch.deactivatedBy, 999);
    assert.equal(userPatch.deactivatedSource, 'verifix_employee_delete');
    assert.deepEqual(permissionPatch, {
        roles: [],
        permissonMenuEmp: {},
        permissonMenuAffirmative: {},
        permissonMenuExecutor: {}
    });
});

test('Verifix removal notification is Uzbek and explains access removal', () => {
    const text = buildVerifixDeleteNotificationText({
        employeeId: 123,
        adminName: 'Admin User'
    });

    assert.match(text, /Siz Verifix tizimidan chiqarildingiz/);
    assert.match(text, /Employee ID: 123/);
    assert.match(text, /barcha rollar va menular bo'yicha kirish huquqlaringiz o'chirildi/);
});
