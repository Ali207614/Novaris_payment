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
    this.mongoConnected = false;
  }

  // --- Helpers ---

  async syncFromMongo() {
    try {
      const userRepository = require('../database/repositories/user.repository');
      const botStateRepository = require('../database/repositories/bot-state.repository');
      const { mapToLegacyUser } = require('./mongoLegacyMapper');

      console.log('[UserStore] Syncing from MongoDB...');
      const [mongoUsers, mongoBotStates] = await Promise.all([
        userRepository.find({}),
        botStateRepository.find({})
      ]);

      const botStateMap = new Map(mongoBotStates.map(s => [s.chatId, s]));
      
      this.cache = mongoUsers.map(u => {
        const state = botStateMap.get(u.telegram.chatId);
        return mapToLegacyUser(u, state);
      });
      
      this.fileMtimeMs = Date.now();
      this.dirty = false;
      this.mongoConnected = true;
      console.log(`[UserStore] Synced ${this.cache.length} users from MongoDB.`);
    } catch (error) {
      console.error('[UserStore] Failed to sync from MongoDB, falling back to JSON:', error.message);
      this._loadOnce();
    }
  }

  _updateMongo(chat_id, updateData) {
    if (!this.mongoConnected) return;

    // Fire and forget update to MongoDB
    try {
      const userRepository = require('../database/repositories/user.repository');
      const botStateRepository = require('../database/repositories/bot-state.repository');
      
      const userUpdate = {};
      const stateUpdate = {};
      
      if (updateData.FirstName) userUpdate['employee.firstName'] = updateData.FirstName;
      if (updateData.LastName) userUpdate['employee.lastName'] = updateData.LastName;
      if (updateData.JobTitle) userUpdate['employee.jobTitle'] = updateData.JobTitle;
      
      if (updateData.user_step) stateUpdate['current.step'] = updateData.user_step;
      if (updateData.currentDataId) stateUpdate['current.dataId'] = updateData.currentDataId;
      if (updateData.currentUserRole) stateUpdate['current.role'] = updateData.currentUserRole;
      if (updateData.lastMessageId) stateUpdate['lastMessage.messageId'] = updateData.lastMessageId;
      if (updateData.lastFile) stateUpdate.lastFile = updateData.lastFile;
      
      if (updateData.back) {
          stateUpdate['navigation.backStack'] = updateData.back.map(b => ({
              step: b.step,
              text: b.text,
              buttonSnapshot: b.btn
          }));
      }

      if (updateData.update !== undefined) stateUpdate['flags.update'] = updateData.update;
      if (updateData.waitingUpdateStatus !== undefined) stateUpdate['flags.waitingUpdateStatus'] = updateData.waitingUpdateStatus;
      if (updateData.extraWaiting !== undefined) stateUpdate['flags.extraWaiting'] = updateData.extraWaiting;

      if (Object.keys(userUpdate).length) {
          userRepository.updateOne({ 'telegram.chatId': Number(chat_id) }, userUpdate).catch(() => {});
      }
      if (Object.keys(stateUpdate).length) {
          botStateRepository.updateState(Number(chat_id), stateUpdate).catch(() => {});
      }
    } catch (e) {
      // Ignore errors in background sync
    }
  }

  _loadOnce() {
    const stat = fs.existsSync(FILE_PATH) ? fs.statSync(FILE_PATH) : null;

    if (this.cache) {
      if (!this.dirty && stat && this.fileMtimeMs && stat.mtimeMs !== this.fileMtimeMs && !this.mongoConnected) {
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
    
    // Sync to Mongo
    if (this.mongoConnected) {
       const userRepository = require('../database/repositories/user.repository');
       userRepository.create({
         telegram: {
           chatId: userData.chat_id,
           firstName: userData.FirstName,
           lastName: userData.LastName,
           phone: userData.MobilePhone
         },
         employee: {
           employeeId: userData.EmployeeID,
           firstName: userData.FirstName,
           lastName: userData.LastName,
           mobilePhone: userData.MobilePhone,
           jobTitle: userData.JobTitle,
           salesPersonCode: userData.SalesPersonCode
         },
         legacy: { raw: userData }
       }).catch(() => {});
    }
    
    return true;
  }

  updateUser(chat_id, userData) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id == chat_id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...userData };
    this._markDirtyAndScheduleFlush();
    this._updateMongo(chat_id, userData);
    return true;
  }

  updateStep(chat_id = "", user_step = 1) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id == chat_id);
    if (idx === -1) return false;
    users[idx].user_step = user_step;
    this._markDirtyAndScheduleFlush();
    this._updateMongo(chat_id, { user_step });
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
      this._updateMongo(chat_id, { back: users[idx].back });
      return true;
    }
    return false;
  }

  deleteBack(chat_id, step) {
    const users = this._loadOnce();
    const idx = users.findIndex((u) => u.chat_id === chat_id);
    if (idx === -1) return false;

    const back = Array.isArray(users[idx].back) ? users[idx].back : [];
    const next = back.filter((b) => b && b.step != step);
    if (next.length === back.length) return false;

    users[idx].back = next;
    this._markDirtyAndScheduleFlush();
    this._updateMongo(chat_id, { back: next });
    return true;
  }

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

module.exports = {
  userStore,
};

