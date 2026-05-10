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
const GlobalConfig = require("../models/global-config.model");
const {
  mapLegacyRequestToMongo,
  mapLegacyPermissionToMongoList
} = require("../../helpers/mongoLegacyMapper");

const inputDir = process.argv[2] || process.env.JSON_IMPORT_DIR || path.join("data", "db");
const DB_DIR = path.isAbsolute(inputDir) ? inputDir : path.join(process.cwd(), inputDir);
const BATCH_SIZE = Number(process.env.MONGODB_IMPORT_BATCH_SIZE || 500);
const EXCLUDED_FILES = new Set(["clone.data.json"]);

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizePhone(value) {
  if (!value) return undefined;
  const digits = String(value).replace(/\D/g, "");
  return digits || undefined;
}

function readJson(fileName, fallback) {
  const filePath = path.join(DB_DIR, fileName);

  if (EXCLUDED_FILES.has(fileName)) {
    console.log(`[Import] Skipped ${fileName}`);
    return fallback;
  }

  if (!fs.existsSync(filePath)) {
    console.warn(`[Import] File not found: ${fileName}`);
    return fallback;
  }

  const raw = fs.readFileSync(filePath, "utf8").trim();
  return raw ? JSON.parse(raw) : fallback;
}

function buildUserOperations() {
  return readJson("user.json", [])
    .map((row) => {
      const chatId = finiteNumber(row.chat_id);
      if (!chatId) return null;

      return {
        updateOne: {
          filter: { "telegram.chatId": chatId },
          update: {
            $set: {
              telegram: {
                chatId,
                username: row.username,
                firstName: row.FirstName,
                lastName: row.LastName,
                phone: row.MobilePhone
              },
              employee: {
                employeeId: finiteNumber(row.EmployeeID),
                firstName: row.FirstName,
                lastName: row.LastName,
                ...(row.JobTitle !== undefined && row.JobTitle !== null && row.JobTitle !== ""
                  ? { jobTitle: row.JobTitle }
                  : {}),
                mobilePhone: row.MobilePhone,
                mobilePhoneNormalized: normalizePhone(row.MobilePhone),
                salesPersonCode: finiteNumber(row.SalesPersonCode)
              },
              role: {
                current: row.currentUserRole,
                roles: Array.isArray(row.roles) ? row.roles.map(String) : [],
                ...(row.JobTitle !== undefined && row.JobTitle !== null && row.JobTitle !== ""
                  ? { isAdmin: row.JobTitle === "Admin" || row.currentUserRole === "Admin" }
                  : {}),
                adminType: row.adminType
              },
              status: {
                isActive: row.is_active !== false,
                confirmationStatus: Boolean(row.confirmationStatus),
                extraWaiting: Boolean(row.extraWaiting),
                waitingUpdateStatus: Boolean(row.waitingUpdateStatus)
              },
              preferences: {
                selectedInfoMenu: row.selectedInfoMenu
              },
              legacy: {
                sourceFile: "user.json",
                rawEmployeeId: finiteNumber(row.EmployeeID),
                rawChatId: chatId,
                raw: row
              }
            }
          },
          upsert: true
        }
      };
    })
    .filter(Boolean);
}

function buildBotStateOperations() {
  return readJson("user.json", [])
    .map((row) => {
      const chatId = finiteNumber(row.chat_id);
      if (!chatId) return null;

      return {
        updateOne: {
          filter: { chatId },
          update: {
            $set: {
              chatId,
              current: {
                step: finiteNumber(row.user_step) || 1,
                dataId: row.currentDataId,
                role: row.currentUserRole
              },
              navigation: {
                backStack: Array.isArray(row.back)
                  ? row.back.map((item) => ({
                      step: finiteNumber(item.step),
                      text: item.text,
                      buttonSnapshot: item.btn
                    }))
                  : []
              },
              pagination: {
                prev: row.prev,
                next: finiteNumber(row.next)
              },
              lastMessage: {
                messageId: finiteNumber(row.lastMessageId)
              },
              lastFile: row.lastFile,
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
            }
          },
          upsert: true
        }
      };
    })
    .filter(Boolean);
}

async function bulkWriteInBatches(model, operations, label) {
  if (!operations.length) {
    console.log(`[Import] ${label}: 0`);
    return 0;
  }

  let written = 0;

  for (let index = 0; index < operations.length; index += BATCH_SIZE) {
    const batch = operations.slice(index, index + BATCH_SIZE);
    const result = await model.bulkWrite(batch, { ordered: false });

    written +=
      (result.upsertedCount || 0) +
      (result.modifiedCount || 0) +
      (result.insertedCount || 0);

    if (operations.length > BATCH_SIZE) {
      const done = Math.min(index + batch.length, operations.length);
      process.stdout.write(`\r[Import] ${label}: ${done}/${operations.length}`);
    }
  }

  if (operations.length > BATCH_SIZE) process.stdout.write("\n");
  console.log(`[Import] ${label}: ${written}`);
  return written;
}

function buildMenuOperations() {
  return readJson("menu.json", []).map((row) => ({
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
          legacy: {
            sourceFile: "menu.json",
            raw: row
          }
        }
      },
      upsert: true
    }
  }));
}

function buildSubMenuOperations() {
  return readJson("subMenu.json", []).map((row) => ({
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
            steps: Array.isArray(row.update)
              ? row.update.map((item) => ({
                  legacyId: finiteNumber(item.id),
                  step: item.step,
                  name: item.name,
                  message: item.message,
                  button: item.btn
                }))
              : []
          },
          status: {
            isActive: row.status !== false,
            isDeleted: Boolean(row.isDelete)
          },
          legacy: {
            sourceFile: "subMenu.json",
            raw: row
          }
        }
      },
      upsert: true
    }
  }));
}

function buildGroupOperations() {
  return readJson("group.json", [])
    .filter((row) => finiteNumber(row.id))
    .map((row) => ({
      updateOne: {
        filter: { chatId: Number(row.id) },
        update: {
          $set: {
            chatId: Number(row.id),
            type: row.type || "supergroup",
            title: row.title,
            group: {
              allMembersAreAdministrators: row.all_members_are_administrators,
              isForum: row.is_forum
            },
            permissions: Object.entries(row.permissions || {}).map(([legacyMenuId, subMenuIds]) => ({
              legacyMenuId: String(legacyMenuId),
              subMenuIds: Array.isArray(subMenuIds) ? subMenuIds.map(String) : [],
              actions: ["notify"]
            })),
            status: { isActive: true },
            legacy: {
              sourceFile: "group.json",
              raw: row
            }
          }
        },
        upsert: true
      }
    }));
}

function buildPermissionOperations() {
  const operations = [];

  readJson("permisson.json", []).forEach((row) => {
    mapLegacyPermissionToMongoList(row).forEach((permission) => {
      operations.push({
        updateOne: {
          filter: {
            "subject.chatId": permission.subject.chatId,
            permissionType: permission.permissionType,
            "scope.legacyMenuId": permission.scope.legacyMenuId
          },
          update: {
            $set: {
              ...permission,
              legacy: {
                ...permission.legacy,
                sourceFile: "permisson.json"
              }
            }
          },
          upsert: true
        }
      });
    });
  });

  return operations;
}

function buildRequestOperations() {
  return readJson("data.json", [])
    .map(mapLegacyRequestToMongo)
    .filter((doc) => doc && doc.publicId)
    .map((doc) => ({
      updateOne: {
        filter: { publicId: doc.publicId },
        update: {
          $set: {
            ...doc,
            legacy: {
              ...doc.legacy,
              sourceFile: "data.json"
            }
          }
        },
        upsert: true
      }
    }));
}

function buildAccountOperations() {
  const data = readJson("accounts.json", {});
  const operations = [];

  Object.entries(data.accounts94 || {}).forEach(([category, codes]) => {
    if (!Array.isArray(codes)) return;

    codes.forEach((code) => {
      const accountCode = String(code);
      operations.push({
        updateOne: {
          filter: {
            source: "94",
            category,
            "account.legacyId": accountCode
          },
          update: {
            $set: {
              source: "94",
              category,
              account: {
                legacyId: accountCode,
                code: accountCode,
                name: `${category} (${accountCode})`,
                num: finiteNumber(code)
              },
              status: { isActive: true },
              legacy: {
                sourceFile: "accounts.json",
                path: `accounts94.${category}`,
                raw: code
              }
            }
          },
          upsert: true
        }
      });
    });
  });

  ["accounts43", "accounts50"].forEach((sourceKey) => {
    const source = sourceKey.replace("accounts", "");

    Object.entries(data[sourceKey] || {}).forEach(([paymentType, currencies]) => {
      if (!currencies || typeof currencies !== "object" || Array.isArray(currencies)) return;

      Object.entries(currencies).forEach(([currency, codes]) => {
        if (!Array.isArray(codes)) return;

        codes.forEach((code) => {
          const accountCode = String(code);
          operations.push({
            updateOne: {
              filter: {
                source,
                paymentType,
                currency,
                "account.legacyId": accountCode
              },
              update: {
                $set: {
                  source,
                  paymentType,
                  currency,
                  account: {
                    legacyId: accountCode,
                    code: accountCode,
                    name: `${paymentType} ${currency} (${accountCode})`,
                    num: finiteNumber(code)
                  },
                  status: { isActive: true },
                  legacy: {
                    sourceFile: "accounts.json",
                    path: `${sourceKey}.${paymentType}.${currency}`,
                    raw: code
                  }
                }
              },
              upsert: true
            }
          });
        });
      });
    });
  });

  return operations;
}

function buildAccountPermissionOperations() {
  const operations = [];

  Object.entries(readJson("accountsPermisson.json", {})).forEach(([role, menus]) => {
    Object.entries(menus || {}).forEach(([legacyMenuId, accountCodes]) => {
      operations.push({
        updateOne: {
          filter: {
            "subject.type": "role",
            "subject.role": role,
            "scope.legacyMenuId": legacyMenuId
          },
          update: {
            $set: {
              subject: { type: "role", role },
              scope: { legacyMenuId },
              actions: {
                view: true,
                select: true,
                approve: true
              },
              legacy: {
                sourceFile: "accountsPermisson.json",
                rawPath: `${role}.${legacyMenuId}`,
                raw: Array.isArray(accountCodes) ? accountCodes.map(String) : accountCodes
              }
            }
          },
          upsert: true
        }
      });
    });
  });

  return operations;
}

function buildSessionOperations() {
  const session = readJson("session.json", {});
  if (!session.SessionId) return [];

  return [{
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
  }];
}

async function importIdCounter() {
  const data = readJson("id.json", {});
  const nextRequestNo = finiteNumber(data.ID);

  if (!nextRequestNo) {
    console.log("[Import] idCounter: 0");
    return 0;
  }

  await GlobalConfig.updateOne(
    { key: "next_request_no" },
    {
      $set: {
        value: nextRequestNo,
        description: "Next request number imported from data/db/id.json",
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log("[Import] idCounter: 1");
  return 1;
}

async function run() {
  const startedAt = Date.now();
  await connectDB();

  try {
    console.log("[Import] Starting data/db JSON import");
    console.log(`[Import] Source: ${DB_DIR}`);
    console.log("[Import] Excluding: clone.data.json");

    const result = {
      users: await bulkWriteInBatches(User, buildUserOperations(), "users"),
      botStates: await bulkWriteInBatches(BotState, buildBotStateOperations(), "botStates"),
      menus: await bulkWriteInBatches(Menu, buildMenuOperations(), "menus"),
      subMenus: await bulkWriteInBatches(SubMenu, buildSubMenuOperations(), "subMenus"),
      groups: await bulkWriteInBatches(TelegramChat, buildGroupOperations(), "groups"),
      permissions: await bulkWriteInBatches(Permission, buildPermissionOperations(), "permissions"),
      accounts: await bulkWriteInBatches(Account, buildAccountOperations(), "accounts"),
      accountPermissions: await bulkWriteInBatches(AccountPermission, buildAccountPermissionOperations(), "accountPermissions"),
      sessions: await bulkWriteInBatches(SapSession, buildSessionOperations(), "sessions"),
      idCounter: await importIdCounter(),
      requests: await bulkWriteInBatches(Request, buildRequestOperations(), "requests")
    };

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log("[Import] Complete");
    console.table(result);
    console.log(`[Import] Duration: ${seconds}s`);
  } finally {
    await disconnectDB();
  }
}

run().catch(async (error) => {
  console.error("[Import] Failed:", error);
  try {
    await disconnectDB();
  } catch {}
  process.exit(1);
});
