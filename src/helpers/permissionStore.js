const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(process.cwd(), "data", "db", "permisson.json");

class PermissionStore {
    constructor() {
        this.cache = null;
        this.mongoConnected = false;
        this.jsonFallbackEnabled = false;
    }

    async syncFromMongo() {
        try {
            const permissionRepository = require('../database/repositories/permission.repository');
            const { mapToLegacyPermission } = require('./mongoLegacyMapper');

            console.log('[PermissionStore] Syncing from MongoDB...');
            const mongoPermissions = await permissionRepository.find({});

            // Group by chatId
            const grouped = {};
            mongoPermissions.forEach(p => {
                const chatId = p.subject.chatId;
                if (!grouped[chatId]) grouped[chatId] = [];
                grouped[chatId].push(p);
            });

            this.cache = Object.keys(grouped).map(chatId => {
                return mapToLegacyPermission(grouped[chatId], Number(chatId));
            });

            this.mongoConnected = true;
            this.jsonFallbackEnabled = false;
            console.log(`[PermissionStore] Synced permissions for ${this.cache.length} users from MongoDB.`);
        } catch (error) {
            console.error('[PermissionStore] Failed to sync from MongoDB:', error.message);
            this.jsonFallbackEnabled = true;
            this._loadOnce();
        }
    }

    _loadOnce() {
        if (this.cache && this.mongoConnected) return this.cache;
        if (!this.jsonFallbackEnabled) {
            this.cache = [];
            return this.cache;
        }
        this.cache = this._readJson();
        return this.cache;
    }

    enableJsonFallback() {
        this.mongoConnected = false;
        this.jsonFallbackEnabled = true;
        this.cache = null;
        return this._loadOnce();
    }

    _readJson() {
        try {
            const raw = fs.readFileSync(FILE_PATH, "utf-8");
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    infoPermisson() {
        return this._loadOnce();
    }

    updatePermisson(id, data) {
        const main = this._loadOnce();
        const index = main.findIndex((item) => item.chat_id == id);
        if (index != -1) {
            main[index] = { ...main[index], ...data };
            data = main[index];
        } else {
            data = { chat_id: id, ...data };
            main.push(data);
        }
        
        fs.writeFileSync(FILE_PATH, JSON.stringify(main, null, 4));
        this._syncToMongo(id, data);
        return true;
    }

    writePermisson(data) {
        const main = this._loadOnce();
        main.push(data);
        fs.writeFileSync(FILE_PATH, JSON.stringify(main, null, 4));
        this._syncToMongo(data.chat_id, data);
        return true;
    }

    _syncToMongo(chatId, data) {
        if (!this.mongoConnected) return;
        
        try {
            const permissionRepository = require('../database/repositories/permission.repository');
            const { mapLegacyPermissionToMongoList } = require('./mongoLegacyMapper');
            const legacyPermission = { ...data, chat_id: chatId };
            const permissions = mapLegacyPermissionToMongoList(legacyPermission);

            permissionRepository.replaceUserPermissions(Number(chatId), permissions).catch((error) => {
                console.error('[PermissionStore] MongoDB permission sync failed:', error.message);
            });
        } catch (error) {
            console.error('[PermissionStore] MongoDB permission sync setup failed:', error.message);
        }
    }
}

module.exports = new PermissionStore();
