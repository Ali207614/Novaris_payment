const { get } = require('lodash');

const isAdminUser = (user = {}) => {
    if (get(user, 'is_active') === false) return false;

    return get(user, 'JobTitle') === 'Admin'
        || get(user, 'role.isAdmin') === true
        || get(user, 'isAdmin') === true
        || get(user, 'currentUserRole') === 'Admin';
};

const normalizeId = (value) => `${value}`;

const uniqueIds = (ids = []) => [...new Set(ids.filter(Boolean).map(normalizeId))];

const adminChatIds = (users = []) => uniqueIds(
    users
        .filter(isAdminUser)
        .map(item => get(item, 'chat_id'))
);

const permissionChatIds = ({ users = [], permissions = [], permissionKey, menuId, subMenuId }) => {
    const permittedIds = permissions
        .filter(item => get(get(item, permissionKey, {}), normalizeId(menuId), []).map(normalizeId).includes(normalizeId(subMenuId)))
        .map(item => get(item, 'chat_id'));

    return uniqueIds([...permittedIds, ...adminChatIds(users)]);
};

const hasPermissionOrAdmin = ({ users = [], permissions = [], chat_id, permissionKey, menuId, subMenuId }) => {
    const user = users.find(item => normalizeId(get(item, 'chat_id')) === normalizeId(chat_id));

    if (isAdminUser(user)) {
        return true;
    }

    return permissionChatIds({ users, permissions, permissionKey, menuId, subMenuId }).includes(normalizeId(chat_id));
};

const permittedSubMenuNames = ({ user = {}, permission = {}, permissionKey, menuId, subMenus = [] }) => {
    if (isAdminUser(user)) {
        return subMenus.map(item => item.name);
    }

    return get(permission, permissionKey, {})[menuId]?.map(el => subMenus.find(s => s.id == el)?.name) || [];
};

module.exports = {
    isAdminUser,
    permissionChatIds,
    hasPermissionOrAdmin,
    permittedSubMenuNames
};
