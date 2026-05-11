const { get } = require("lodash");

const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

const isSamePhone = (left = '', right = '') => {
    const normalizedLeft = normalizePhone(left);
    const normalizedRight = normalizePhone(right);

    if (!normalizedLeft || !normalizedRight) {
        return false;
    }

    return normalizedLeft === normalizedRight ||
        normalizedLeft.endsWith(normalizedRight) ||
        normalizedRight.endsWith(normalizedLeft);
};

const getLocalUserFullName = (user = {}) => {
    return `${get(user, 'LastName', '')} ${get(user, 'FirstName', '')}`.trim() || "Noma'lum foydalanuvchi";
};

const findLocalUserByVerifixEmployee = (users = [], employee = {}) => {
    const employeeId = get(employee, 'EmployeeID');
    const phone = get(employee, 'MobilePhone', '');

    if (employeeId) {
        const byEmployeeId = users.find(item => `${get(item, 'EmployeeID', '')}` == `${employeeId}`);

        if (byEmployeeId) {
            return byEmployeeId;
        }
    }

    if (!phone) {
        return undefined;
    }

    return users.find(item => isSamePhone(get(item, 'MobilePhone', ''), phone));
};

const buildVerifixAccessRevocationPatch = (adminChatId) => ({
    is_active: false,
    user_step: 0,
    currentDataId: '',
    currentUserRole: '',
    back: [],
    update: false,
    confirmationStatus: false,
    waitingUpdateStatus: false,
    extraWaiting: false,
    deactivatedAt: new Date(),
    deactivatedBy: adminChatId,
    deactivatedSource: 'verifix_employee_delete'
});

const buildEmptyPermissionPatch = () => ({
    roles: [],
    permissonMenuEmp: {},
    permissonMenuAffirmative: {},
    permissonMenuExecutor: {}
});

const buildVerifixDeleteNotificationText = ({ employeeId, adminName } = {}) => {
    return [
        "Siz Verifix tizimidan chiqarildingiz.",
        "",
        employeeId ? `Employee ID: ${employeeId}` : null,
        adminName ? `Amalni bajargan admin: ${adminName}` : null,
        "",
        "Shu sabab botdagi barcha rollar va menular bo'yicha kirish huquqlaringiz o'chirildi.",
        "Savollar bo'lsa admin bilan bog'laning."
    ].filter(line => line !== null).join('\n');
};

module.exports = {
    normalizePhone,
    isSamePhone,
    getLocalUserFullName,
    findLocalUserByVerifixEmployee,
    buildVerifixAccessRevocationPatch,
    buildEmptyPermissionPatch,
    buildVerifixDeleteNotificationText
};
