const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(process.cwd(), "data", "db");

function readJson(fileName, fallback) {
    const filePath = path.join(DB_DIR, fileName);
    try {
        const raw = fs.readFileSync(filePath, "utf-8").trim();
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(fileName, data) {
    const filePath = path.join(DB_DIR, fileName);
    const tmpPath = `${filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 4), "utf-8");
    fs.renameSync(tmpPath, filePath);
}

function mapMenu(doc) {
    const raw = doc.legacy?.raw || {};
    return {
        ...raw,
        id: doc.legacyId,
        name: doc.name,
        status: doc.status?.isActive,
        isDelete: doc.status?.isDeleted,
        creationDate: raw.creationDate || doc.createdAt
    };
}

function mapSubMenu(doc) {
    const raw = doc.legacy?.raw || {};
    return {
        ...raw,
        id: doc.legacyId,
        menuId: doc.legacyMenuId || raw.menuId,
        name: doc.name,
        comment: doc.comment,
        update: raw.update || (doc.flow?.steps || []).map((step) => ({
            id: step.legacyId,
            name: step.name,
            message: step.message,
            btn: step.button,
            step: step.step
        })),
        updateLine: doc.flow?.updateLine ?? raw.updateLine,
        lastStep: doc.flow?.lastStep ?? raw.lastStep,
        infoFn: doc.infoFunction || raw.infoFn,
        status: doc.status?.isActive,
        isDelete: doc.status?.isDeleted,
        creationDate: raw.creationDate || doc.createdAt
    };
}

function mapGroup(doc) {
    const raw = doc.legacy?.raw || {};
    return {
        ...raw,
        id: doc.chatId,
        title: doc.title,
        type: doc.type,
        permissions: raw.permissions || (doc.permissions || {}).reduce((acc, permission) => {
            acc[permission.legacyMenuId] = permission.subMenuIds || [];
            return acc;
        }, {})
    };
}

class LegacyStore {
    constructor() {
        this.mongoConnected = false;
        this.fallbackToJson = false;
        this.cache = {
            menu: [],
            subMenu: [],
            group: [],
            accountList: {},
            accountPermission: {},
            session: {},
            id: { ID: 1 }
        };
    }

    async syncFromMongo() {
        try {
            const menuRepository = require("../database/repositories/menu.repository");
            const subMenuRepository = require("../database/repositories/sub-menu.repository");
            const telegramChatRepository = require("../database/repositories/telegram-chat.repository");
            const accountRepository = require("../database/repositories/account.repository");
            const accountPermissionRepository = require("../database/repositories/account-permission.repository");
            const sapSessionRepository = require("../database/repositories/sap-session.repository");

            const [menus, subMenus, groups, accountSnapshots, accountPermissionSnapshots, sapSessions] = await Promise.all([
                menuRepository.find({}),
                subMenuRepository.find({}),
                telegramChatRepository.find({ type: { $in: ["group", "supergroup", "channel"] } }),
                accountRepository.find({ source: "legacy_snapshot" }, { createdAt: -1 }, 1),
                accountPermissionRepository.find({ "legacy.rawPath": "accountsPermisson.json" }, { createdAt: -1 }, 1),
                sapSessionRepository.find({ provider: "sap_b1", "status.isActive": true }, { createdAt: -1 }, 1)
            ]);

            this.cache.menu = menus.map(mapMenu);
            this.cache.subMenu = subMenus.map(mapSubMenu);
            this.cache.group = groups.map(mapGroup);
            this.cache.accountList = accountSnapshots[0]?.legacy?.raw || {};
            this.cache.accountPermission = accountPermissionSnapshots[0]?.legacy?.raw || {};
            this.cache.session = sapSessions[0] ? {
                Cookie: sapSessions[0].cookiesEncrypted ? JSON.parse(sapSessions[0].cookiesEncrypted) : [],
                SessionId: sapSessions[0].sessionId
            } : {};
            this.cache.id = { ID: await this._resolveNextRequestId() };

            this.mongoConnected = true;
            this.fallbackToJson = false;
            console.log("[LegacyStore] Synced legacy helper caches from MongoDB.");
        } catch (error) {
            console.error("[LegacyStore] MongoDB sync failed, enabling JSON fallback:", error.message);
            this.loadJsonFallback();
        }
    }

    async _resolveNextRequestId() {
        try {
            const requestRepository = require("../database/repositories/request.repository");
            const rows = await requestRepository.find({}, { requestNo: -1 }, 1);
            const current = Number(rows[0]?.requestNo || 0);
            return current > 0 ? current + 1 : 1;
        } catch {
            return 1;
        }
    }

    loadJsonFallback() {
        this.mongoConnected = false;
        this.fallbackToJson = true;
        this.cache.menu = readJson("menu.json", []);
        this.cache.subMenu = readJson("subMenu.json", []);
        this.cache.group = readJson("group.json", []);
        this.cache.accountList = readJson("accounts.json", {});
        this.cache.accountPermission = readJson("accountsPermisson.json", {});
        this.cache.session = readJson("session.json", {});
        this.cache.id = readJson("id.json", { ID: 1 });
    }

    shouldWriteJson() {
        return this.fallbackToJson;
    }

    infoMenu(includeDeleted = false) {
        return this.cache.menu.filter((item) => includeDeleted ? !item.isDelete : item?.status && !item?.isDelete);
    }

    infoSubMenu(includeDeleted = false) {
        return this.cache.subMenu.filter((item) => includeDeleted ? !item.isDelete : item?.status && !item?.isDelete);
    }

    infoGroup() {
        return this.cache.group;
    }

    infoAccountList() {
        return this.cache.accountList;
    }

    infoAccountPermission() {
        return this.cache.accountPermission;
    }

    infoSession() {
        return this.cache.session;
    }

    infoID() {
        return this.cache.id;
    }

    updateID(id) {
        this.cache.id = { ID: id };
        if (this.shouldWriteJson()) writeJson("id.json", this.cache.id);
    }

    saveSession(cookie) {
        this.cache.session = cookie;
        if (this.shouldWriteJson()) writeJson("session.json", cookie);
        if (!this.mongoConnected) return;

        try {
            const sapSessionRepository = require("../database/repositories/sap-session.repository");
            sapSessionRepository.updateOne(
                { provider: "sap_b1" },
                {
                    sessionId: cookie.SessionId || "unknown",
                    cookiesEncrypted: JSON.stringify(cookie.Cookie || []),
                    status: { isActive: true },
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] SAP session sync failed:", error.message));
        } catch (error) {
            console.error("[LegacyStore] SAP session sync setup failed:", error.message);
        }
    }

    writeGroup(userData) {
        this.cache.group.push({ ...userData });
        if (this.shouldWriteJson()) writeJson("group.json", this.cache.group);
        this._syncGroup(userData);
    }

    updateGroup(id, userData) {
        const index = this.cache.group.findIndex((item) => item.id == id);
        if (index !== -1) {
            this.cache.group[index] = { ...this.cache.group[index], ...userData };
            if (this.shouldWriteJson()) writeJson("group.json", this.cache.group);
            this._syncGroup(this.cache.group[index]);
        }
    }

    deleteGroup(id) {
        this.cache.group = this.cache.group.filter((item) => item.id != id);
        if (this.shouldWriteJson()) writeJson("group.json", this.cache.group);
        if (!this.mongoConnected) return;
        try {
            const telegramChatRepository = require("../database/repositories/telegram-chat.repository");
            telegramChatRepository.updateOne({ chatId: Number(id) }, { "status.isActive": false }).catch(() => {});
        } catch {}
    }

    _syncGroup(group) {
        if (!this.mongoConnected) return;
        try {
            const telegramChatRepository = require("../database/repositories/telegram-chat.repository");
            telegramChatRepository.updateOne(
                { chatId: Number(group.id) },
                {
                    chatId: Number(group.id),
                    title: group.title,
                    type: group.type || "supergroup",
                    permissions: Object.entries(group.permissions || {}).map(([legacyMenuId, subMenuIds]) => ({
                        legacyMenuId: String(legacyMenuId),
                        subMenuIds: Array.isArray(subMenuIds) ? subMenuIds.map(String) : [],
                        actions: ["notify"]
                    })),
                    status: { isActive: true },
                    legacy: { raw: group }
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] Group sync failed:", error.message));
        } catch {}
    }

    writeMenu(data) {
        const id = this.cache.menu.length ? Math.max(...this.cache.menu.map((item) => Number(item.id) || 0)) + 1 : 7;
        const row = { ...data, status: true, isDelete: false, creationDate: new Date(), id };
        this.cache.menu.push(row);
        if (this.shouldWriteJson()) writeJson("menu.json", this.cache.menu);
        this._syncMenu(row);
    }

    updateMenu(id, data) {
        const index = this.cache.menu.findIndex((item) => item.id == id);
        if (index === -1) return;
        this.cache.menu[index] = { ...this.cache.menu[index], ...data };
        if (this.shouldWriteJson()) writeJson("menu.json", this.cache.menu);
        this._syncMenu(this.cache.menu[index]);
    }

    _syncMenu(row) {
        if (!this.mongoConnected) return;
        try {
            const menuRepository = require("../database/repositories/menu.repository");
            menuRepository.updateOne(
                { legacyId: Number(row.id) },
                {
                    legacyId: Number(row.id),
                    name: row.name,
                    status: { isActive: row.status !== false, isDeleted: Boolean(row.isDelete) },
                    sortOrder: Number(row.id) || 0,
                    legacy: { raw: row }
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] Menu sync failed:", error.message));
        } catch {}
    }

    writeSubMenu(data) {
        const id = this.cache.subMenu.length ? Math.max(...this.cache.subMenu.map((item) => Number(item.id) || 0)) + 1 : 1;
        const row = { ...data, isDelete: false, status: true, id, creationDate: new Date() };
        this.cache.subMenu.push(row);
        if (this.shouldWriteJson()) writeJson("subMenu.json", this.cache.subMenu);
        this._syncSubMenu(row);
    }

    updateSubMenu(id, data) {
        const index = this.cache.subMenu.findIndex((item) => item.id == id);
        if (index === -1) return;
        this.cache.subMenu[index] = { ...this.cache.subMenu[index], ...data };
        if (data?.comment) {
            this.cache.subMenu[index] = {
                ...this.cache.subMenu[index],
                update: [{ ...this.cache.subMenu[index].update?.[0], message: data.comment }]
            };
        }
        if (this.shouldWriteJson()) writeJson("subMenu.json", this.cache.subMenu);
        this._syncSubMenu(this.cache.subMenu[index]);
    }

    _syncSubMenu(row) {
        if (!this.mongoConnected) return;
        try {
            const subMenuRepository = require("../database/repositories/sub-menu.repository");
            subMenuRepository.updateOne(
                { legacyId: Number(row.id) },
                {
                    legacyId: Number(row.id),
                    legacyMenuId: String(row.menuId),
                    name: row.name,
                    comment: row.comment,
                    infoFunction: row.infoFn,
                    flow: {
                        lastStep: row.lastStep,
                        updateLine: row.updateLine,
                        steps: (row.update || []).map((item) => ({
                            legacyId: item.id,
                            step: item.step,
                            name: item.name,
                            message: item.message,
                            button: item.btn
                        }))
                    },
                    status: { isActive: row.status !== false, isDeleted: Boolean(row.isDelete) },
                    legacy: { raw: row }
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] SubMenu sync failed:", error.message));
        } catch {}
    }

    writeAccountPermission(data) {
        this.cache.accountPermission = data;
        if (this.shouldWriteJson()) writeJson("accountsPermisson.json", data);
        this._syncAccountPermissionSnapshot(data);
    }

    writeAccountList(data) {
        this.cache.accountList = data;
        if (this.shouldWriteJson()) writeJson("accounts.json", data);
        this._syncAccountSnapshot(data);
    }

    _syncAccountSnapshot(data) {
        if (!this.mongoConnected) return;
        try {
            const accountRepository = require("../database/repositories/account.repository");
            accountRepository.updateOne(
                { source: "legacy_snapshot", "account.legacyId": "accounts.json" },
                {
                    source: "legacy_snapshot",
                    account: { legacyId: "accounts.json", name: "accounts.json" },
                    legacy: { sourceFile: "accounts.json", raw: data }
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] Account snapshot sync failed:", error.message));
        } catch {}
    }

    _syncAccountPermissionSnapshot(data) {
        if (!this.mongoConnected) return;
        try {
            const accountPermissionRepository = require("../database/repositories/account-permission.repository");
            accountPermissionRepository.updateOne(
                { "legacy.rawPath": "accountsPermisson.json" },
                {
                    subject: { type: "role" },
                    actions: { view: true, select: true, approve: true },
                    legacy: { rawPath: "accountsPermisson.json", raw: data }
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).catch((error) => console.error("[LegacyStore] Account permission snapshot sync failed:", error.message));
        } catch {}
    }
}

module.exports = new LegacyStore();
