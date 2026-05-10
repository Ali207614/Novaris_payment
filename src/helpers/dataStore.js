const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(process.cwd(), "data", "db");
const FILE_PATH = path.join(DB_DIR, "data.json");
const ID_PATH = path.join(DB_DIR, "id.json");
const DEBOUNCE_MS = Number(process.env.DATASTORE_DEBOUNCE_MS || 200);

class DataStore {
    constructor() {
        this.cache = null;
        this.dirty = false;
        this.flushTimer = null;
        this.flushing = false;
        this.pendingResolves = [];
        this.pendingRejects = [];
        this.mongoConnected = false;
        this.jsonFallbackEnabled = false;
    }

    // --- Helpers ---

    async syncFromMongo() {
        try {
            const requestRepository = require("../database/repositories/request.repository");
            const { mapToLegacyRequest } = require("./mongoLegacyMapper");

            console.log("[DataStore] Syncing requests from MongoDB...");
            const mongoRequests = await requestRepository.find(
                { "workflow.isDeleted": { $ne: true } },
                { "timestamps.createdAt": 1 }
            );

            this.cache = this._normalizeData(mongoRequests.map(mapToLegacyRequest).filter(Boolean));
            this.dirty = false;
            this.mongoConnected = true;
            this.jsonFallbackEnabled = false;
            console.log(`[DataStore] Synced ${this.cache.length} requests from MongoDB.`);
        } catch (error) {
            this.mongoConnected = false;
            this.jsonFallbackEnabled = true;
            console.error("[DataStore] Failed to sync from MongoDB, falling back to JSON:", error.message);
            this._loadOnce();
        }
    }

    enableJsonFallback() {
        this.mongoConnected = false;
        this.jsonFallbackEnabled = true;
        this.cache = null;
        return this._loadOnce();
    }

    _syncRowToMongo(row) {
        if (!this.mongoConnected || !row) return;

        try {
            const requestRepository = require("../database/repositories/request.repository");
            const { mapLegacyRequestToMongo } = require("./mongoLegacyMapper");
            const mongoRequest = mapLegacyRequestToMongo(row);

            if (!mongoRequest || !mongoRequest.publicId) return;

            requestRepository.upsertLegacyRequest(mongoRequest.publicId, mongoRequest).catch((error) => {
                console.error("[DataStore] MongoDB request sync failed:", error.message);
            });
        } catch (error) {
            console.error("[DataStore] MongoDB request sync setup failed:", error.message);
        }
    }

    _markDeletedInMongo(id) {
        if (!this.mongoConnected || id == null) return;

        try {
            const requestRepository = require("../database/repositories/request.repository");
            requestRepository.markDeletedByPublicId(String(id)).catch((error) => {
                console.error("[DataStore] MongoDB request delete sync failed:", error.message);
            });
        } catch (error) {
            console.error("[DataStore] MongoDB request delete setup failed:", error.message);
        }
    }

    _ensureDir() {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
    }

    _safeBackup(filePath) {
        try {
            if (!fs.existsSync(filePath)) return null;
            const backupPath = `${filePath}.broken.${Date.now()}`;
            fs.copyFileSync(filePath, backupPath);
            return backupPath;
        } catch {
            return null;
        }
    }

    _readJsonFile(filePath, fallbackValue) {
        this._ensureDir();

        if (!fs.existsSync(filePath)) {
            return fallbackValue;
        }

        const raw = fs.readFileSync(filePath, "utf-8").trim();

        if (!raw) {
            return fallbackValue;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            const backupPath = this._safeBackup(filePath);
            console.error(`[DataStore] Invalid JSON in ${filePath}`, error);
            if (backupPath) {
                console.error(`[DataStore] Broken file backed up to: ${backupPath}`);
            }
            return fallbackValue;
        }
    }

    _writeJsonFileSyncAtomic(filePath, value) {
        this._ensureDir();
        const tmpPath = `${filePath}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2), "utf-8");
        fs.renameSync(tmpPath, filePath);
    }

    async _writeJsonFileAtomic(filePath, value) {
        this._ensureDir();
        const tmpPath = `${filePath}.tmp`;
        await fs.promises.writeFile(tmpPath, JSON.stringify(value, null, 2), "utf-8");
        await fs.promises.rename(tmpPath, filePath);
    }

    _normalizeRow(row) {
        if (!row || typeof row !== "object") return row;

        const normalized = { ...row };

        if (normalized.id == null && normalized.ID != null) {
            normalized.id = normalized.ID;
        }

        if (normalized.ID == null && normalized.id != null) {
            normalized.ID = normalized.id;
        }

        return normalized;
    }

    _normalizeData(data) {
        if (!Array.isArray(data)) return [];
        return data.map((item) => this._normalizeRow(item));
    }

    _loadOnce() {
        if (this.cache) return this.cache;
        if (!this.jsonFallbackEnabled) {
            this.cache = [];
            return this.cache;
        }

        const parsed = this._readJsonFile(FILE_PATH, []);
        this.cache = this._normalizeData(parsed);

        // Agar JSON buzilgan bo‘lsa yoki array bo‘lmasa, valid holatda saqlab qo‘yamiz
        if (!Array.isArray(parsed)) {
            this.dirty = true;
            this._markDirtyAndScheduleFlush();
        }

        return this.cache;
    }

    _readID() {
        const parsed = this._readJsonFile(ID_PATH, { ID: 1 });
        const n = Number(parsed && parsed.ID);
        return Number.isFinite(n) && n > 0 ? n : 1;
    }

    _writeID(next) {
        this._writeJsonFileSyncAtomic(ID_PATH, { ID: next });
    }

    _formatLocalDateToISOString(d) {
        const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
        const local = new Date(d.getTime() - tzOffsetMs);
        return local.toISOString().slice(0, 19);
    }

    _resolvePending() {
        const resolves = this.pendingResolves.splice(0);
        this.pendingRejects.splice(0);
        resolves.forEach((resolve) => resolve());
    }

    _rejectPending(error) {
        this.pendingResolves.splice(0);
        const rejects = this.pendingRejects.splice(0);
        rejects.forEach((reject) => reject(error));
    }

    _markDirtyAndScheduleFlush() {
        this.dirty = true;

        if (this.flushTimer) return;

        this.flushTimer = setTimeout(() => {
            this._flush().catch((error) => {
                console.error("[DataStore] Flush failed:", error);
            });
        }, DEBOUNCE_MS);
    }

    async _flush() {
        if (this.flushing) return;
        if (!this.dirty) {
            this.flushTimer = null;
            return;
        }

        this.flushTimer = null;
        this.flushing = true;

        try {
            const data = Array.isArray(this.cache) ? this.cache : [];
            await this._writeJsonFileAtomic(FILE_PATH, data);
            this.dirty = false;
            this._resolvePending();
        } catch (error) {
            this._rejectPending(error);
            throw error;
        } finally {
            this.flushing = false;
        }

        // Flush paytida yangi o‘zgarish kelgan bo‘lsa, yana flush qilish
        if (this.dirty && !this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this._flush().catch((error) => {
                    console.error("[DataStore] Flush retry failed:", error);
                });
            }, DEBOUNCE_MS);
        }
    }

    async flushNow() {
        if (!this.dirty) return;

        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        await new Promise((resolve, reject) => {
            this.pendingResolves.push(resolve);
            this.pendingRejects.push(reject);
            this._flush().catch(reject);
        });
    }

    _matchId(item, id) {
        return String(item?.id) === String(id) || String(item?.ID) === String(id);
    }

    // --- Public API ---

    infoData() {
        return this._loadOnce();
    }

    add(row) {
        const data = this._loadOnce();
        const nextID = this._readID();
        const now = new Date();
        const rowId = row?.id ?? row?.ID ?? nextID;
        const displayID = row?.ID ?? nextID;

        const newRow = this._normalizeRow({
            ...row,
            creationDate: this._formatLocalDateToISOString(now),
            full: false,
            is_delete: false,
            id: rowId,
            ID: displayID,
        });

        data.push(newRow);

        this._writeID(nextID + 1);
        this._markDirtyAndScheduleFlush();
        this._syncRowToMongo(newRow);

        return newRow;
    }

    update(id, newData) {
        const data = this._loadOnce();
        const index = data.findIndex((item) => this._matchId(item, id));

        if (index === -1) return false;

        data[index] = this._normalizeRow({
            ...data[index],
            ...newData,
            id: data[index].id ?? data[index].ID,
            ID: data[index].ID ?? data[index].id,
        });

        this._markDirtyAndScheduleFlush();
        this._syncRowToMongo(data[index]);
        return true;
    }

    delete(id) {
        const data = this._loadOnce();
        const before = data.length;

        this.cache = data.filter((item) => !this._matchId(item, id));

        if (this.cache.length !== before) {
            this._markDirtyAndScheduleFlush();
            this._markDeletedInMongo(id);
            return true;
        }

        return false;
    }

    deleteAllInvalid(chat_id) {
        const data = this._loadOnce();

        const toDeleteIds = data
            .filter((item) => String(item.chat_id) === String(chat_id) && !item.full)
            .map((item) => item.id ?? item.ID);

        if (!toDeleteIds.length) {
            return 0;
        }

        this.cache = data.filter(
            (item) => !(String(item.chat_id) === String(chat_id) && !item.full)
        );

        this._markDirtyAndScheduleFlush();
        toDeleteIds.forEach((id) => this._markDeletedInMongo(id));
        return toDeleteIds.length;
    }
}

const dataStore = new DataStore();

module.exports = {
    dataStore,
};
