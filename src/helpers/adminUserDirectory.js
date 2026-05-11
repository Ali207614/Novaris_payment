const { get } = require("lodash");

const normalizeText = (value = '') => String(value || '').trim().toLowerCase();
const normalizePhone = (value = '') => String(value || '').replace(/\D/g, '');

const getAdminUserFullName = (user = {}) => {
    return `${get(user, 'LastName', '')} ${get(user, 'FirstName', '')}`.trim() || "Noma'lum foydalanuvchi";
};

const isManageableAdminUser = (user = {}) => {
    return get(user, 'JobTitle') !== 'Admin';
};

const getManageableAdminUsers = (users = []) => {
    return (Array.isArray(users) ? users : []).filter(isManageableAdminUser);
};

const searchManageableAdminUsers = (users = [], query = '') => {
    const normalizedQuery = normalizeText(query);
    const phoneQuery = normalizePhone(query);

    if (!normalizedQuery && !phoneQuery) {
        return [];
    }

    return getManageableAdminUsers(users).filter((user) => {
        const name = normalizeText(getAdminUserFullName(user));
        const phone = normalizePhone(get(user, 'MobilePhone', ''));

        return name.includes(normalizedQuery) ||
            (phoneQuery && phone.includes(phoneQuery));
    });
};

const toAdminUserButtonList = (users = []) => {
    return (Array.isArray(users) ? users : []).map((user) => ({
        name: getAdminUserFullName(user),
        id: get(user, 'chat_id')
    })).filter((user) => user.id !== undefined && user.id !== null && user.id !== '');
};

module.exports = {
    getAdminUserFullName,
    getManageableAdminUsers,
    searchManageableAdminUsers,
    toAdminUserButtonList
};
