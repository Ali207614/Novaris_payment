const fs = require("fs");
const path = require("path");
const { connectDB, disconnectDB } = require("../mongoose.module");
const User = require("../models/user.model");
const BotState = require("../models/bot-state.model");
const Request = require("../models/request.model");
const Permission = require("../models/permission.model");
const Menu = require("../models/menu.model");
const SubMenu = require("../models/sub-menu.model");
const TelegramChat = require("../models/telegram-chat.model");
const Account = require("../models/account.model");
const AccountPermission = require("../models/account-permission.model");
const SapSession = require("../models/sap-session.model");
const { mapLegacyRequestToMongo, mapLegacyPermissionToMongoList } = require("../../helpers/mongoLegacyMapper");

const DB_DIR = path.join(process.cwd(), "data", "db");
const BATCH_SIZE = Number(process.env.MONGODB_MIGRATION_BATCH_SIZE || 500);

function readJson(fileName, fallback) {
  const filePath = path.join(DB_DIR, fileName);
  if (!fs.existsSync(filePath)) return fallback;

  const raw = fs.readFileSync(filePath, "utf-8").trim();
  return raw ? JSON.parse(raw) : fallback;
}

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function buildUserDocument(row) {
  const chatId = finiteNumber(row.chat_id);
  if (!chatId) return null;

  return {
    telegram: {
      chatId,
      firstName: row.FirstName,
      lastName: row.LastName,
      phone: row.MobilePhone
    },
    employee: {
      employeeId: finiteNumber(row.EmployeeID),
      firstName: row.FirstName,
      lastName: row.LastName,
      mobilePhone: row.MobilePhone,
      jobTitle: row.JobTitle,
      salesPersonCode: finiteNumber(row.SalesPersonCode)
    },
    role: {
      current: row.currentUserRole,
      roles: Array.isArray(row.roles) ? row.roles.map(String) : [],
      isAdmin: row.JobTitle === "Admin"
    },
    status: {
      isActive: row.is_active !== false,
      confirmationStatus: Boolean(row.confirmationStatus),
      extraWaiting: Boolean(row.extraWaiting),
      waitingUpdateStatus: Boolean(row.waitingUpdateStatus)
    },
    legacy: {
      rawEmployeeId: finiteNumber(row.EmployeeID),
      rawChatId: chatId,
      raw: row
    }
  };
}

function buildBotStateDocument(row) {
  const chatId = finiteNumber(row.chat_id);
  if (!chatId) return null;

  return {
    chatId,
    current: {
      step: finiteNumber(row.user_step) || 1,
      dataId: row.currentDataId,
      role: row.currentUserRole
    },
    navigation: {
      backStack: Array.isArray(row.back) ? row.back.map((item) => ({
        step: finiteNumber(item.step),
        text: item.text,
        buttonSnapshot: item.btn
      })) : []
    },
    lastMessage: {
      messageId: finiteNumber(row.lastMessageId)
    },
    lastFile: row.lastFile || undefined,
    adminFlow: {
      selectedAdminUserChatId: finiteNumber(row.selectedAdminUserChatId),
      selectedAdminUserStatus: row.selectedAdminUserStatus,
      selectedMenuId: row.selectMenuId,
      selectedGroup: row.selectGroup,
      updateMenu: row.updateMenu
    },
    flags: {
      update: Boolean(row.update),
      waitingUpdateStatus: Boolean(row.waitingUpdateStatus),
      extraWaiting: Boolean(row.extraWaiting)
    }
  };
}

async function bulkWriteInBatches(model, operations) {
  let written = 0;
  for (let index = 0; index < operations.length; index += BATCH_SIZE) {
    const batch = operations.slice(index, index + BATCH_SIZE);
    if (!batch.length) continue;
    const result = await model.bulkWrite(batch, { ordered: false });
    written += (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.insertedCount || 0);
  }
  return written;
}

async function migrateUsers() {
  const rows = readJson("user.json", []);
  const userOperations = [];
  const stateOperations = [];

  rows.forEach((row) => {
    const user = buildUserDocument(row);
    const state = buildBotStateDocument(row);
    if (!user || !state) return;

    userOperations.push({
      updateOne: {
        filter: { "telegram.chatId": user.telegram.chatId },
        update: { $set: user },
        upsert: true
      }
    });

    stateOperations.push({
      updateOne: {
        filter: { chatId: state.chatId },
        update: { $set: state },
        upsert: true
      }
    });
  });

  return {
    users: await bulkWriteInBatches(User, userOperations),
    botStates: await bulkWriteInBatches(BotState, stateOperations)
  };
}

async function migrateRequests() {
  const rows = readJson("data.json", []);
  const operations = rows
    .map(mapLegacyRequestToMongo)
    .filter((doc) => doc && doc.publicId)
    .map((doc) => ({
      updateOne: {
        filter: { publicId: doc.publicId },
        update: { $set: doc },
        upsert: true
      }
    }));

  return await bulkWriteInBatches(Request, operations);
}

async function migratePermissions() {
  const rows = readJson("permisson.json", []);
  const operations = [];

  rows.forEach((row) => {
    const permissions = mapLegacyPermissionToMongoList(row);
    permissions.forEach((permission) => {
      operations.push({
        updateOne: {
          filter: {
            "subject.chatId": permission.subject.chatId,
            permissionType: permission.permissionType,
            "scope.legacyMenuId": permission.scope.legacyMenuId
          },
          update: { $set: permission },
          upsert: true
        }
      });
    });
  });

  return await bulkWriteInBatches(Permission, operations);
}

async function migrateMenus() {
  const rows = readJson("menu.json", []);
  const operations = rows.map((row) => ({
    updateOne: {
      filter: { legacyId: Number(row.id) },
      update: {
        $set: {
          legacyId: Number(row.id),
          name: row.name,
          status: {
            isActive: row.status !== false,
            isDeleted: Boolean(row.isDelete)
          },
          sortOrder: Number(row.id) || 0,
          legacy: { raw: row }
        }
      },
      upsert: true
    }
  }));

  return await bulkWriteInBatches(Menu, operations);
}

async function migrateSubMenus() {
  const rows = readJson("subMenu.json", []);
  const operations = rows.map((row) => ({
    updateOne: {
      filter: { legacyId: Number(row.id) },
      update: {
        $set: {
          legacyId: Number(row.id),
          legacyMenuId: row.menuId != null ? String(row.menuId) : undefined,
          name: row.name,
          comment: row.comment,
          infoFunction: row.infoFn,
          flow: {
            lastStep: finiteNumber(row.lastStep),
            updateLine: finiteNumber(row.updateLine),
            steps: Array.isArray(row.update) ? row.update.map((item) => ({
              legacyId: finiteNumber(item.id),
              step: item.step,
              name: item.name,
              message: item.message,
              button: item.btn
            })) : []
          },
          status: {
            isActive: row.status !== false,
            isDeleted: Boolean(row.isDelete)
          },
          legacy: { raw: row }
        }
      },
      upsert: true
    }
  }));

  return await bulkWriteInBatches(SubMenu, operations);
}

async function migrateGroups() {
  const rows = readJson("group.json", []);
  const operations = rows
    .filter((row) => finiteNumber(row.id))
    .map((row) => ({
      updateOne: {
        filter: { chatId: Number(row.id) },
        update: {
          $set: {
            chatId: Number(row.id),
            type: row.type || "supergroup",
            title: row.title,
            permissions: Object.entries(row.permissions || {}).map(([legacyMenuId, subMenuIds]) => ({
              legacyMenuId: String(legacyMenuId),
              subMenuIds: Array.isArray(subMenuIds) ? subMenuIds.map(String) : [],
              actions: ["notify"]
            })),
            status: { isActive: true },
            legacy: { raw: row }
          }
        },
        upsert: true
      }
    }));

  return await bulkWriteInBatches(TelegramChat, operations);
}

async function migrateAccountSnapshots() {
  const accounts = readJson("accounts.json", {});
  const accountPermissions = readJson("accountsPermisson.json", {});

  const accountWrites = await bulkWriteInBatches(Account, [{
    updateOne: {
      filter: { source: "legacy_snapshot", "account.legacyId": "accounts.json" },
      update: {
        $set: {
          source: "legacy_snapshot",
          account: { legacyId: "accounts.json", name: "accounts.json" },
          legacy: { sourceFile: "accounts.json", raw: accounts }
        }
      },
      upsert: true
    }
  }]);

  const accountPermissionWrites = await bulkWriteInBatches(AccountPermission, [{
    updateOne: {
      filter: { "legacy.rawPath": "accountsPermisson.json" },
      update: {
        $set: {
          subject: { type: "role" },
          actions: { view: true, select: true, approve: true },
          legacy: { rawPath: "accountsPermisson.json", raw: accountPermissions }
        }
      },
      upsert: true
    }
  }]);

  return { accountSnapshots: accountWrites, accountPermissionSnapshots: accountPermissionWrites };
}

async function migrateSession() {
  const session = readJson("session.json", {});
  if (!session.SessionId) return 0;

  return await bulkWriteInBatches(SapSession, [{
    updateOne: {
      filter: { provider: "sap_b1" },
      update: {
        $set: {
          provider: "sap_b1",
          sessionId: session.SessionId,
          cookiesEncrypted: JSON.stringify(session.Cookie || []),
          status: { isActive: true },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          legacy: { sourceFile: "session.json" }
        }
      },
      upsert: true
    }
  }]);
}

async function run() {
  await connectDB();

  try {
    const result = {
      ...(await migrateUsers()),
      requests: await migrateRequests(),
      permissions: await migratePermissions(),
      menus: await migrateMenus(),
      subMenus: await migrateSubMenus(),
      groups: await migrateGroups(),
      ...(await migrateAccountSnapshots()),
      sessions: await migrateSession()
    };

    console.log("[MongoDB Migration] Complete:", result);
  } finally {
    await disconnectDB();
  }
}

run().catch(async (error) => {
  console.error("[MongoDB Migration] Failed:", error);
  try { await disconnectDB(); } catch {}
  process.exit(1);
});
