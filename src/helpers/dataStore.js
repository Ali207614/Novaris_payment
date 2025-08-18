// dataStore.js
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(process.cwd(), "database", "data.json");
const ID_PATH = path.join(process.cwd(), "database", "id.json");
const DEBOUNCE_MS = Number(process.env.DATASTORE_DEBOUNCE_MS || 200);

class DataStore {
    constructor() {
        this.cache = null;
        this.dirty = false;
        this.flushTimer = null;
        this.flushing = false;
        this.pendingResolves = [];
    }

    // --- Helpers ---

    _loadOnce() {
        if (this.cache) return this.cache;
        const raw = fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, "utf-8") : "";
        this.cache = raw ? JSON.parse(raw) : [];
        return this.cache;
    }

    _readID() {
        const raw = fs.existsSync(ID_PATH) ? fs.readFileSync(ID_PATH, "utf-8") : "";
        if (!raw) return 1;
        try {
            const obj = JSON.parse(raw);
            const n = Number(obj && obj.ID);
            return Number.isFinite(n) && n > 0 ? n : 1;
        } catch {
            return 1;
        }
    }

    _writeID(next) {
        fs.writeFileSync(ID_PATH, JSON.stringify({ ID: next }), "utf-8");
    }

    _formatLocalDateToISOString(d) {
        const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
        const local = new Date(d.getTime() - tzOffsetMs);
        return local.toISOString().slice(0, 19);
    }

    _markDirtyAndScheduleFlush() {
        this.dirty = true;
        if (this.flushTimer) return;
        this.flushTimer = setTimeout(() => this._flush(), DEBOUNCE_MS);
    }

    async _flush() {
        if (!this.dirty || this.flushing) {
            this.flushTimer = null;
            return;
        }
        this.flushTimer = null;
        this.flushing = true;

        const data = this.cache || [];
        const tmp = `${FILE_PATH}.tmp`;

        try {
            await fs.promises.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
            await fs.promises.rename(tmp, FILE_PATH);

            this.dirty = false;
            this.flushing = false;
            const pending = this.pendingResolves.splice(0);
            pending.forEach((r) => r());
        } catch (e) {
            this.flushing = false;
            try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch { }
            throw e;
        }
    }

    async flushNow() {
        if (!this.dirty) return;
        await new Promise((resolve) => {
            this.pendingResolves.push(resolve);
            if (!this.flushTimer) this._flush();
        });
    }

    // --- Public API ---

    infoData() {
        return this._loadOnce();
    }

    add(row) {
        const data = this._loadOnce();
        const ID = this._readID();
        const now = new Date();

        data.push({
            ...row,
            creationDate: this._formatLocalDateToISOString(now),
            full: false,
            is_delete: false,
            ID,
        });

        this._writeID(ID + 1);
        this._markDirtyAndScheduleFlush();
    }

    update(id, newData) {
        const data = this._loadOnce();
        const index = data.findIndex((item) => item.id === id);
        if (index === -1) return false;
        data[index] = { ...data[index], ...newData };
        this._markDirtyAndScheduleFlush();
        return true;
    }

    delete(id) {
        let data = this._loadOnce();
        const before = data.length;
        this.cache = data.filter((item) => item.id != id);
        this._markDirtyAndScheduleFlush();
        return this.cache.length < before;
    }

    deleteAllInvalid(chat_id) {
        let data = this._loadOnce();
        const toDelete = data.filter((item) => item.chat_id == chat_id && !item.full).map((i) => i.id);
        this.cache = data.filter((item) => !toDelete.includes(item.id));
        this._markDirtyAndScheduleFlush();
        return toDelete.length;
    }
}

// Singleton
const dataStore = new DataStore();


module.exports = {
    dataStore,
};
