const { get } = require("lodash");

const normalizeId = (value) => String(value ?? "").trim();

const listForMenu = (subMenusByMenu = {}, menuId) => {
    return subMenusByMenu[menuId] || subMenusByMenu[normalizeId(menuId)] || [];
};

const findSubMenuForRequest = (subMenusByMenu = {}, request = {}, defaultMenuId = 1) => {
    const menuId = get(request, "menu", defaultMenuId);
    const subMenus = listForMenu(subMenusByMenu, menuId);
    const subMenuId = normalizeId(get(request, "subMenuId") ?? get(request, "legacySubMenuId"));

    if (subMenuId) {
        const byId = subMenus.find((item) => normalizeId(item.id) === subMenuId || normalizeId(item.legacyId) === subMenuId);
        if (byId) return byId;
    }

    const subMenuName = get(request, "subMenu");
    return subMenus.find((item) => item.name === subMenuName);
};

const getSubMenuIdForRequest = (subMenusByMenu = {}, request = {}, defaultMenuId = 1) => {
    const found = findSubMenuForRequest(subMenusByMenu, request, defaultMenuId);
    return found?.id;
};

module.exports = {
    findSubMenuForRequest,
    getSubMenuIdForRequest,
    listForMenu
};
