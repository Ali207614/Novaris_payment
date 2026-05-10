const test = require('node:test');
const assert = require('node:assert/strict');
const {
    isAdminUser,
    permissionChatIds,
    hasPermissionOrAdmin,
    permittedSubMenuNames
} = require('../src/helpers/adminPermissions');

test('active admins are treated as allowed management users', () => {
    const users = [
        { chat_id: 'admin-1', JobTitle: 'Admin', is_active: true },
        { chat_id: 'admin-2', JobTitle: 'Admin', is_active: false },
        { chat_id: 'manager-1', JobTitle: 'User' }
    ];
    const permissions = [
        {
            chat_id: 'manager-1',
            permissonMenuAffirmative: { 3: [7] }
        }
    ];

    assert.equal(isAdminUser(users[0]), true);
    assert.deepEqual(
        permissionChatIds({
            users,
            permissions,
            permissionKey: 'permissonMenuAffirmative',
            menuId: 3,
            subMenuId: 7
        }).sort(),
        ['admin-1', 'manager-1']
    );
    assert.equal(
        hasPermissionOrAdmin({
            users,
            permissions,
            chat_id: 'admin-1',
            permissionKey: 'permissonMenuAffirmative',
            menuId: 3,
            subMenuId: 99
        }),
        true
    );
});

test('admins see all submenu names, regular users see permitted submenu names only', () => {
    const subMenus = [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' }
    ];
    const permission = {
        permissonMenuExecutor: { 4: ['2'] }
    };

    assert.deepEqual(
        permittedSubMenuNames({
            user: { JobTitle: 'Admin', is_active: true },
            permission,
            permissionKey: 'permissonMenuExecutor',
            menuId: 4,
            subMenus
        }),
        ['First', 'Second']
    );
    assert.deepEqual(
        permittedSubMenuNames({
            user: { JobTitle: 'User' },
            permission,
            permissionKey: 'permissonMenuExecutor',
            menuId: 4,
            subMenus
        }),
        ['Second']
    );
});
