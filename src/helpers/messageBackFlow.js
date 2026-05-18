const { get } = require("lodash");
const { empDynamicBtn } = require("../keyboards/function_keyboards");
const { CUSTOMER_SEARCH_STEP, getCustomerSelectionText, shouldAskCustomer } = require("./customerSelection");
const { isAdminUser } = require("./adminPermissions");

const MENU_STEP = 10;
const SUB_MENU_STEP = 60;
const COMMENT_STEP = 61;

const normalizeId = (value) => String(value ?? "").trim();
const normalizeText = (value) => String(value ?? "").trim();

const listForMenu = (subMenusByMenu = {}, menuId) => {
    return subMenusByMenu[menuId] || subMenusByMenu[normalizeId(menuId)] || [];
};

const getPermission = (permissions = [], chat_id) => {
    return permissions.find((item) => normalizeId(get(item, "chat_id")) === normalizeId(chat_id)) || {};
};

const employeeSubMenuIds = (permission = {}, menuId) => {
    return (get(permission, ["permissonMenuEmp", normalizeId(menuId)], []) || []).map(normalizeId);
};

const getAllowedMenus = ({ menus = [], user = {}, permission = {} }) => {
    if (isAdminUser(user)) {
        return menus.filter((item) => item && item.status !== false && item.isDelete !== true);
    }

    return menus.filter((item) => {
        return item
            && item.status !== false
            && item.isDelete !== true
            && employeeSubMenuIds(permission, item.id).length > 0;
    });
};

const getAllowedSubMenus = ({ subMenusByMenu = {}, menuId, user = {}, permission = {} }) => {
    const subMenus = listForMenu(subMenusByMenu, menuId).filter((item) => {
        return item && item.status !== false && item.isDelete !== true;
    });

    if (isAdminUser(user)) {
        return subMenus;
    }

    const allowedIds = new Set(employeeSubMenuIds(permission, menuId));
    return subMenus.filter((item) => allowedIds.has(normalizeId(item.id)));
};

const findByName = (items = [], name) => {
    const target = normalizeText(name);
    return items.find((item) => normalizeText(item.name) === target);
};

const findMessageBackMenu = ({ msgText, menus = [], user = {}, permission = {} }) => {
    return findByName(getAllowedMenus({ menus, user, permission }), msgText);
};

const findMessageBackSubMenu = ({ msgText, subMenusByMenu = {}, menuId, user = {}, permission = {} }) => {
    return findByName(getAllowedSubMenus({ subMenusByMenu, menuId, user, permission }), msgText);
};

const buildAllowedMenuButton = ({ menus = [], user = {}, permission = {} }) => {
    return empDynamicBtn(getAllowedMenus({ menus, user, permission }).map((item) => item.name), 3);
};

const buildAllowedSubMenuButton = ({ subMenusByMenu = {}, menuId, user = {}, permission = {} }) => {
    return empDynamicBtn(getAllowedSubMenus({ subMenusByMenu, menuId, user, permission }).map((item) => item.name), 2);
};

const ensureCurrentMenuData = ({
    chat_id,
    user,
    menu,
    infoData,
    updateUser,
    writeData,
    randomId
}) => {
    let dataCurUser = infoData().find((item) => item.id == user?.currentDataId);

    if (!dataCurUser || dataCurUser?.menuName !== menu.name || dataCurUser.full) {
        const id = randomId();
        dataCurUser = { id, menu: menu.id, menuName: menu.name, chat_id };
        updateUser(chat_id, { currentDataId: id });
        writeData(dataCurUser);
    }

    return dataCurUser;
};

const runMessageBackFlow = async ({
    msgText,
    chat_id,
    isGroup,
    groupChatId,
    user,
    Menu,
    SubMenu,
    infoPermisson,
    infoData,
    updateUser,
    updateStep,
    updateBack,
    updateData,
    writeData,
    sendMessageHelper,
    randomId
}) => {
    if (!user || !normalizeText(msgText) || Number(get(user, "user_step", 0)) < 1) {
        return false;
    }

    const destination = isGroup ? groupChatId : chat_id;
    const menus = Menu();
    const subMenusByMenu = SubMenu();
    const permission = getPermission(infoPermisson(), chat_id);
    const step = Number(get(user, "user_step"));

    if (step === MENU_STEP) {
        const menu = findMessageBackMenu({ msgText, menus, user, permission });
        if (!menu) return false;

        ensureCurrentMenuData({
            chat_id,
            user,
            menu,
            infoData,
            updateUser,
            writeData,
            randomId
        });

        updateStep(chat_id, SUB_MENU_STEP);
        updateBack(chat_id, {
            text: "Sub Menuni tanlang",
            btn: buildAllowedMenuButton({ menus, user, permission }),
            step: MENU_STEP
        });

        const botInfo = await sendMessageHelper(
            destination,
            menu.name,
            buildAllowedSubMenuButton({ subMenusByMenu, menuId: menu.id, user, permission })
        );
        updateUser(chat_id, { lastMessageId: botInfo?.message_id });
        return true;
    }

    if (step === SUB_MENU_STEP) {
        const dataCurUser = infoData().find((item) => item.id == user?.currentDataId);
        const menuId = get(dataCurUser, "menu");
        if (!dataCurUser || !menuId) return false;

        const subMenu = findMessageBackSubMenu({ msgText, subMenusByMenu, menuId, user, permission });
        if (!subMenu) return false;

        updateStep(chat_id, COMMENT_STEP);
        updateData(get(dataCurUser, "id"), { subMenu: subMenu.name, subMenuId: subMenu.id });
        updateBack(chat_id, {
            text: "Sub Menuni tanlang",
            btn: buildAllowedSubMenuButton({ subMenusByMenu, menuId, user, permission }),
            step: SUB_MENU_STEP
        });

        const dataAfterUpdate = {
            ...dataCurUser,
            subMenu: subMenu.name,
            subMenuId: subMenu.id
        };
        if (!get(user, "update") && shouldAskCustomer(dataAfterUpdate)) {
            updateStep(chat_id, CUSTOMER_SEARCH_STEP);
        }

        const botInfo = await sendMessageHelper(
            destination,
            getCustomerSelectionText(dataAfterUpdate, subMenu.comment || "Error"),
            empDynamicBtn()
        );
        updateUser(chat_id, { lastMessageId: botInfo?.message_id });
        return true;
    }

    return false;
};

module.exports = {
    buildAllowedMenuButton,
    buildAllowedSubMenuButton,
    findMessageBackMenu,
    findMessageBackSubMenu,
    getAllowedMenus,
    getAllowedSubMenus,
    runMessageBackFlow
};
