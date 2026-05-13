const { get } = require("lodash");

const CUSTOMER_SEARCH_STEP = 3001;
const CUSTOMER_SELECT_STEP = 3002;

const CUSTOMER_MENU_NAMES = [
    "Shartnoma",
    "Boshqa",
    "Tovarlarni qaytarish",
    "Tovar o'chirish",
    "Pul o'tkazmani 1ga 1 tasdiqlatish",
    "Mijozga qarz",
    "Noodatiy o'zgarishlarni tasdiqlatish",
];

const normalizeText = (value = "") => `${value || ""}`.trim().toLowerCase();

const shouldAskCustomer = (data = {}) => {
    const menuName = get(data, "menuName", "");
    const subMenu = get(data, "subMenu", "");

    if (CUSTOMER_MENU_NAMES.includes(menuName)) {
        return true;
    }

    return false;
};

const getCustomerSelectionText = (data = {}, defaultText = "") => {
    if (shouldAskCustomer(data) && !get(data, "customerCode")) {
        return "Mijoz ismini yozing";
    }

    return defaultText;
};

const getSelectedCustomer = (data = {}) => {
    const customerCode = get(data, "customerCode", get(data, "customerId", ""));
    const customer = get(data, "customerList", []).find((item) => item.id == customerCode);

    return {
        code: customerCode,
        name: get(data, "customerName", get(customer, "customerName", get(customer, "name", ""))),
    };
};

module.exports = {
    CUSTOMER_SEARCH_STEP,
    CUSTOMER_SELECT_STEP,
    getCustomerSelectionText,
    getSelectedCustomer,
    shouldAskCustomer,
};
