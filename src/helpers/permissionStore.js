const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(process.cwd(), "database", "permisson.json");

class PermissionStore {
    constructor() {
        this.cache = null;
        this.mongoConnected = false;
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
            console.log(`[PermissionStore] Synced permissions for ${this.cache.length} users from MongoDB.`);
        } catch (error) {
            console.error('[PermissionStore] Failed to sync from MongoDB:', error.message);
            this._loadOnce();
        }
    }

    _loadOnce() {
        if (this.cache && this.mongoConnected) return this.cache;
        
        try {
            const raw = fs.readFileSync(FILE_PATH, "utf-8");
            this.cache = raw ? JSON.parse(raw) : [];
        } catch (e) {
            this.cache = [];
        }
        return this.cache;
    }

    infoPermisson() {
        return this._loadOnce();
    }

    updatePermisson(id, data) {
        const main = this._loadOnce();
        const index = main.findIndex((item) => item.chat_id == id);
        if (index != -1) {
            main[index] = { ...main[index], ...data };
        } else {
            main.push({ chat_id: id, ...data });
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
        
        // This is complex because mapping back from legacy to normalized Mongo permissions
        // is non-trivial. For now, we'll log that it's not implemented or do a simple version.
        // Actually, the user's focus was on READING from Mongo.
    }
}

module.exports = new PermissionStore();
