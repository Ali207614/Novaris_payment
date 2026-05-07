// userStore.js
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(process.cwd(), "database", "user.json");
const DEBOUNCE_MS = Number(process.env.USERSTORE_DEBOUNCE_MS || 200);

class UserStore {
  constructor() {
    this.cache = null;          // RAM cache (array)
    this.fileMtimeMs = 0;       // tashqi o'zgarishni sezish uchun
    this.dirty = false;         // diskka yozish kerakmi
    this.flushTimer = null;     // debounced timer
    this.flushing = false;      // hozir flush ketyaptimi
    this.pendingResolves = [];  // flushNow() kutayotganlar
  }

  // --- Helpers ---

  _loadOnce() {
    const stat = fs.existsSync(FILE_PATH) ? fs.statSync(FILE_PATH) : null;

    if (this.cache) {
      if (!this.dirty && stat && this.fileMtimeMs && stat.mtimeMs !== this.fileMtimeMs) {
        const raw = fs.readFileSync(FILE_PATH, "utf-8");
        try {
          this.cache = raw ? JSON.parse(raw) : [];
          this.fileMtimeMs = stat.mtimeMs;
        } catch (e) {
          // Agar fayl buzilgan bo'lsa, eski cache bilan davom etamiz
        }
      }
      return this.cache;
    }

    const raw = fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, "utf-8") : "";
    try {
      this.cache = raw ? JSON.parse(raw) : [];
    } catch (e) {
      // Agar fayl buzilgan bo'lsa, xavfsiz default
      this.cache = [];
    }
    this.fileMtimeMs = stat ? stat.mtimeMs : 0;
    return this.cache;
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
      const stat = await fs.promises.stat(FILE_PATH);
      this.fileMtimeMs = stat.mtimeMs;
      this.dirty = false;
      this.flushing = false;
      const pending = this.pendingResolves.splice(0);
      pending.forEach((r) => r());
    } catch (e) {
      this.flushing = false;
      try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
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

  // --- Public API (drop-in mos) ---

  infoUser() {
    return this._loadOnce();
  }

  writeUser(userData) {
    const users = this._loadOnce();
    users.push({ ...userData, creationDate: new Date() });
    this._markDirtyAndScheduleFlush();
    return true;
  }

  updateUser(chat_id, userData) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id == chat_id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...userData };
    this._markDirtyAndScheduleFlush();
    return true;
    }

  updateStep(chat_id = "", user_step = 1) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id == chat_id);
    if (idx === -1) return false;
    users[idx].user_step = user_step;
    this._markDirtyAndScheduleFlush();
    return true;
  }

  updateBack(chat_id, userData) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id === chat_id);
    if (idx === -1) return false;

    const back = Array.isArray(users[idx].back) ? users[idx].back : [];
    const last = back.length ? back[back.length - 1] : null;

    if (!last || last.step !== userData.step) {
      users[idx].back = [...back, userData];
      this._markDirtyAndScheduleFlush();
      return true;
    }
    return false; // o'zgarmadi
  }

  deleteBack(chat_id, step) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id === chat_id);
    if (idx === -1) return false;

    const back = Array.isArray(users[idx].back) ? users[idx].back : [];
    const next = back.filter((b) => b && b.step != step);
    if (next.length === back.length) return false; // hech narsa o'chmadi

    users[idx].back = next;
    this._markDirtyAndScheduleFlush();
    return true;
  }

  // Faqat o'qish (filter)
  confirmativeListFn() {
    return this._loadOnce().filter((u) => u && u.JobTitle === "Tasdiqlovchi");
  }

  executorListFn() {
    return this._loadOnce().filter((u) => u && u.JobTitle === "Bajaruvchi");
  }
}

// Singleton
const userStore = new UserStore();

// Graceful shutdown
for (const ev of ["beforeExit", "exit", "SIGINT", "SIGTERM"]) {
  process.on(ev, async () => {
    try { await userStore.flushNow(); } catch {}
  });
}

// Eski funksiya nomlari bilan eksport (drop-in)


module.exports = {
  userStore,

};
