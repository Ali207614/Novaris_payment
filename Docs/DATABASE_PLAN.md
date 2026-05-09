Below is the **professional MongoDB schema plan** I would use for this Telegram bot migration.

Your uploaded audit shows these JSON databases:

`data.json` → 20,953 records
`user.json` → 391 records
`menu.json` → 11 records
`subMenu.json` → 33 records
`permisson.json` → 410 records
plus `accounts.json`, `accountsPermisson.json`, `group.json`, and `session.json` 

The biggest problem is that the old JSON files mix **business data**, **Telegram state**, **permissions**, **SAP data**, **files**, **menus**, and **temporary UI state** together. MongoDB should not copy that mess directly. We should redesign it cleanly.

---

# Recommended MongoDB Collections

## 1. `users`

Stores real employees / bot users.

This replaces most of `user.json`.

```ts
users {
  _id: ObjectId,

  telegram: {
    chatId: Number,              // unique
    username?: String,
    firstName?: String,
    lastName?: String,
    phone?: String
  },

  employee: {
    employeeId: Number,          // from EmployeeID
    firstName: String,
    lastName: String,
    jobTitle?: String | null,
    mobilePhone: String,
    mobilePhoneNormalized: String,
    salesPersonCode?: Number | null
  },

  role: {
    current: String,             // currentUserRole
    roles: [String],
    isAdmin: Boolean,
    adminType?: String
  },

  status: {
    isActive: Boolean,
    confirmationStatus: Boolean,
    extraWaiting: Boolean,
    waitingUpdateStatus: Boolean
  },

  preferences: {
    selectedInfoMenu?: String
  },

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "user.json",
    rawEmployeeId: Number,
    rawChatId: Number
  }
}
```

### Indexes

```js
db.users.createIndex({ "telegram.chatId": 1 }, { unique: true });
db.users.createIndex({ "employee.employeeId": 1 }, { unique: true });
db.users.createIndex({ "employee.mobilePhoneNormalized": 1 });
db.users.createIndex({ "role.current": 1 });
db.users.createIndex({ "status.isActive": 1 });
```

---

## 2. `bot_states`

This is very important.

Do **not** keep things like `user_step`, `back`, `lastFile`, `lastMessageId`, `pagination`, `currentDataId`, `selectedMenuId`, etc. inside `users`.

Those are not user profile data. They are **temporary Telegram conversation state**.

```ts
bot_states {
  _id: ObjectId,

  chatId: Number,                // unique
  userId: ObjectId,

  current: {
    step: Number,
    menuId?: ObjectId,
    subMenuId?: ObjectId,
    dataId?: ObjectId,
    role?: String
  },

  navigation: {
    backStack: [
      {
        step: Number,
        text?: String,
        buttonSnapshot?: Object,
        createdAt: Date
      }
    ]
  },

  pagination: {
    prev?: Number | String,
    next?: Number
  },

  lastMessage: {
    messageId?: Number,
    text?: String,
    replyMarkup?: Object
  },

  lastFile: {
    fileId?: String,
    fileUniqueId?: String,
    fileName?: String,
    mimeType?: String,
    size?: Number,
    currentDataId?: ObjectId
  },

  adminFlow?: {
    selectedAdminUserChatId?: Number,
    selectedAdminUserStatus?: String,
    selectedMenuId?: String,
    selectedGroup?: {
      menu?: String,
      subMenu?: String
    },
    updateMenu?: Object
  },

  flags: {
    update: Boolean,
    waitingUpdateStatus: Boolean,
    extraWaiting: Boolean
  },

  expiresAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```js
db.bot_states.createIndex({ chatId: 1 }, { unique: true });
db.bot_states.createIndex({ userId: 1 });
db.bot_states.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

Use TTL only if old inactive bot states can safely disappear.

---

## 3. `menus`

Replaces `menu.json`.

```ts
menus {
  _id: ObjectId,

  legacyId: Number,
  name: String,

  status: {
    isActive: Boolean,
    isDeleted: Boolean
  },

  sortOrder: Number,

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```js
db.menus.createIndex({ legacyId: 1 }, { unique: true });
db.menus.createIndex({ "status.isActive": 1 });
```

---

## 4. `sub_menus`

Replaces `subMenu.json`.

```ts
sub_menus {
  _id: ObjectId,

  legacyId: Number,
  menuId: ObjectId,
  legacyMenuId: String,

  name: String,
  comment: String,

  infoFunction: String,

  flow: {
    lastStep: Number,
    updateLine: Number,
    steps: [
      {
        legacyId: Number,
        step: String,
        name: String,
        message: String,
        button?: String
      }
    ]
  },

  status: {
    isActive: Boolean,
    isDeleted: Boolean
  },

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```js
db.sub_menus.createIndex({ legacyId: 1 }, { unique: true });
db.sub_menus.createIndex({ menuId: 1 });
db.sub_menus.createIndex({ legacyMenuId: 1 });
db.sub_menus.createIndex({ "status.isActive": 1 });
```

---

## 5. `requests`

This is the most important collection.

It replaces `data.json`.

Your `data.json` is not just “data”. It contains payment records, purchase records, SAP/Jira flags, confirmation state, executor state, files, accounts, vendors, comments, menu references, and workflow statuses.

So I would model it as a generic business workflow document called `requests`.

```ts
requests {
  _id: ObjectId,

  requestNo: Number,             // old ID
  publicId: String,              // old id string

  type: String,                  // payment | purchase | sap | ticket | generic
  source: String,                // telegram_bot

  creator: {
    chatId: Number,
    userId?: ObjectId
  },

  menu: {
    menuId?: ObjectId,
    legacyMenuId: Number,
    menuName: String,

    subMenuId?: ObjectId,
    legacySubMenuId?: String,
    subMenuName?: String
  },

  financial: {
    isPayment: Boolean,
    isPurchase: Boolean,

    amount?: Decimal128,
    rawAmount?: String,

    currency?: String,
    currencyRate?: Decimal128,
    rawCurrencyRate?: String,

    payType?: String,
    accountType?: String,
    point?: String,

    startDate?: Date,
    endDate?: Date,
    documentType?: Boolean
  },

  accounts: {
    accountCode?: String,
    accountCodeOther?: String,

    selectedAccounts?: [
      {
        accountId?: ObjectId,
        legacyId?: String,
        name?: String,
        num?: Number,
        source?: String
      }
    ],

    dds?: {
      code?: String,
      list?: [
        {
          legacyId?: String,
          name: String
        }
      ]
    }
  },

  vendor: {
    vendorId?: String,
    selectedVendors?: [
      {
        legacyId?: String,
        name?: String,
        num?: Number
      }
    ]
  },

  customer: {
    customerId?: String,
    customerCode?: String,
    customerName?: String,
    selectedCustomers?: [
      {
        legacyId?: String,
        name?: String,
        customerName?: String,
        num?: Number
      }
    ]
  },

  workflow: {
    isFull: Boolean,
    isDeleted: Boolean,

    confirmative: {
      chatId?: Number,
      userId?: ObjectId,
      status: Boolean,
      date?: Date
    },

    executor: {
      chatId?: Number,
      userId?: ObjectId,
      status: Boolean,
      date?: Date
    },

    confirmativeSendList: [
      {
        chatId: Number,
        messageId?: Number
      }
    ]
  },

  sap: {
    enabled: Boolean,
    sapB1: Boolean,
    jira: Boolean,

    jiraMessage?: String,
    errorMessage?: String
  },

  ticket: {
    ticketNo?: String,
    isAdded?: Boolean,
    status?: {
      comment?: String | Number
    }
  },

  purchaseOrder: {
    purchaseEntry?: String,

    orders?: [
      {
        docEntry?: Number,
        docNum?: Number,
        docStatus?: String,
        docType?: String,
        cardCode?: String,
        cardName?: String,
        currency?: String,
        itemCode?: String,
        lineNum?: Number,
        numAtCard?: String,
        price?: Decimal128,
        quantity?: Decimal128,
        rate?: Decimal128,
        canceled?: String,

        raw?: Object
      }
    ]
  },

  files: [
    {
      fileId: String,
      fileUniqueId?: String,
      fileName?: String,
      mimeType?: String,
      size?: Number,

      thumbnail?: {
        fileId?: String,
        fileUniqueId?: String,
        size?: Number,
        width?: Number,
        height?: Number
      },

      isActive: Boolean,
      isSent: Boolean
    }
  ],

  comment: String,
  notConfirmMessage?: String,

  timestamps: {
    createdAt: Date,
    updatedAt?: Date,
    confirmativeAt?: Date,
    executorAt?: Date
  },

  legacy: {
    sourceFile: "data.json",
    rawId: String,
    rawID: Number,
    raw: Object
  }
}
```

### Indexes

```js
db.requests.createIndex({ requestNo: 1 }, { unique: true });
db.requests.createIndex({ publicId: 1 }, { unique: true });

db.requests.createIndex({ "creator.chatId": 1 });
db.requests.createIndex({ "creator.userId": 1 });

db.requests.createIndex({ type: 1 });
db.requests.createIndex({ "menu.legacyMenuId": 1 });
db.requests.createIndex({ "menu.legacySubMenuId": 1 });

db.requests.createIndex({ "workflow.isDeleted": 1 });
db.requests.createIndex({ "workflow.confirmative.status": 1 });
db.requests.createIndex({ "workflow.executor.status": 1 });

db.requests.createIndex({ "sap.enabled": 1 });
db.requests.createIndex({ "sap.sapB1": 1 });
db.requests.createIndex({ "ticket.ticketNo": 1 });

db.requests.createIndex({ "timestamps.createdAt": -1 });
db.requests.createIndex({ "financial.startDate": 1, "financial.endDate": 1 });
```

---

## 6. `permissions`

Replace `permisson.json`.

Also fix the spelling: **permission**, not `permisson`.

Old structure:

```js
permissonMenuEmp: {
  "1": [...],
  "3": [...],
  "11": [...]
}
```

This is hard to query professionally.

Use normalized permission records instead.

```ts
permissions {
  _id: ObjectId,

  subject: {
    type: "user" | "role" | "group",
    userId?: ObjectId,
    chatId?: Number,
    role?: String,
    groupId?: ObjectId
  },

  scope: {
    menuId?: ObjectId,
    legacyMenuId: String,
    subMenuIds: [String]
  },

  permissionType: "employee" | "executor" | "affirmative" | "admin",

  actions: {
    view: Boolean,
    create: Boolean,
    update: Boolean,
    delete: Boolean,
    confirm: Boolean,
    execute: Boolean
  },

  status: {
    isActive: Boolean
  },

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "permisson.json",
    rawKey?: String,
    raw: Object
  }
}
```

### Indexes

```js
db.permissions.createIndex({
  "subject.type": 1,
  "subject.chatId": 1,
  permissionType: 1
});

db.permissions.createIndex({
  "scope.legacyMenuId": 1,
  permissionType: 1
});

db.permissions.createIndex({
  "subject.role": 1,
  "scope.legacyMenuId": 1
});
```

---

## 7. `accounts`

Replaces `accounts.json`.

Do **not** store accounts as:

```js
accounts50.Naqd.USD[]
accounts50.Karta.UZS[]
accounts94.Qarz[]
```

Flatten it.

```ts
accounts {
  _id: ObjectId,

  source: "43" | "50" | "94",

  category: String,              // Naqd, Karta, Terminal, Qarz, Tovar qabuli...
  paymentType?: String,          // Naqd, Karta, Terminal, O'tkazma
  currency?: String,             // UZS, USD

  account: {
    legacyId?: String,
    code?: String,
    name: String,
    num?: Number
  },

  status: {
    isActive: Boolean
  },

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "accounts.json",
    path: String,                // accounts50.Naqd.USD
    raw: Object
  }
}
```

### Indexes

```js
db.accounts.createIndex({ source: 1 });
db.accounts.createIndex({ category: 1 });
db.accounts.createIndex({ paymentType: 1, currency: 1 });
db.accounts.createIndex({ "account.legacyId": 1 });
db.accounts.createIndex({ "account.num": 1 });
```

---

## 8. `account_permissions`

Replaces `accountsPermisson.json`.

```ts
account_permissions {
  _id: ObjectId,

  subject: {
    type: "user" | "role" | "group",
    chatId?: Number,
    userId?: ObjectId,
    role?: String,
    groupId?: ObjectId
  },

  scope: {
    menuId?: ObjectId,
    legacyMenuId: String,
    subMenuId?: String
  },

  accountIds: [ObjectId],

  actions: {
    view: Boolean,
    select: Boolean,
    approve: Boolean
  },

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "accountsPermisson.json",
    rawPath: String,
    raw: Object
  }
}
```

### Indexes

```js
db.account_permissions.createIndex({
  "subject.type": 1,
  "subject.chatId": 1
});

db.account_permissions.createIndex({
  "scope.legacyMenuId": 1,
  "scope.subMenuId": 1
});
```

---

## 9. `telegram_chats`

Replaces `group.json`, but can also support private chats if needed.

```ts
telegram_chats {
  _id: ObjectId,

  chatId: Number,                // Telegram chat/group/channel ID
  type: "private" | "group" | "supergroup" | "channel",
  title?: String,

  group: {
    allMembersAreAdministrators?: Boolean,
    isForum?: Boolean
  },

  permissions: [
    {
      legacyMenuId: String,
      subMenuIds: [String],
      actions?: [String]
    }
  ],

  status: {
    isActive: Boolean
  },

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "group.json",
    raw: Object
  }
}
```

### Indexes

```js
db.telegram_chats.createIndex({ chatId: 1 }, { unique: true });
db.telegram_chats.createIndex({ type: 1 });
db.telegram_chats.createIndex({ title: "text" });
```

---

## 10. `sap_sessions`

Replaces `session.json`.

But be careful: this probably contains sensitive SAP cookies/session tokens.

```ts
sap_sessions {
  _id: ObjectId,

  provider: "sap_b1",

  sessionId: String,
  cookiesEncrypted: String,

  status: {
    isActive: Boolean
  },

  expiresAt: Date,

  createdAt: Date,
  updatedAt: Date,

  legacy: {
    sourceFile: "session.json"
  }
}
```

### Indexes

```js
db.sap_sessions.createIndex({ provider: 1 });
db.sap_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

Do **not** store raw SAP cookies unencrypted.

---

## 11. `audit_logs`

For professional debugging.

```ts
audit_logs {
  _id: ObjectId,

  actor: {
    userId?: ObjectId,
    chatId?: Number,
    role?: String
  },

  action: String,
  entity: {
    type: String,
    id?: ObjectId
  },

  before?: Object,
  after?: Object,

  metadata: {
    source: "telegram_bot" | "migration" | "admin_panel" | "sap_sync",
    requestId?: String,
    ip?: String
  },

  createdAt: Date
}
```

### Indexes

```js
db.audit_logs.createIndex({ "actor.chatId": 1 });
db.audit_logs.createIndex({ "entity.type": 1, "entity.id": 1 });
db.audit_logs.createIndex({ createdAt: -1 });
```

---

## 12. `outbox`

This is for reliable Telegram/SAP operations.

Instead of directly sending Telegram messages or SAP requests and losing them on crash, save pending jobs here.

```ts
outbox {
  _id: ObjectId,

  type: "telegram_message" | "sap_request" | "jira_request",

  status: "pending" | "processing" | "sent" | "failed" | "cancelled",

  payload: Object,

  attempts: Number,
  maxAttempts: Number,

  error?: {
    message: String,
    stack?: String,
    code?: String
  },

  scheduledAt: Date,
  processedAt?: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```js
db.outbox.createIndex({ status: 1, scheduledAt: 1 });
db.outbox.createIndex({ type: 1, status: 1 });
db.outbox.createIndex({ createdAt: -1 });
```

---

# Final Database Structure

```txt
telegram_bot_db
│
├── users
├── bot_states
├── menus
├── sub_menus
├── requests
├── permissions
├── accounts
├── account_permissions
├── telegram_chats
├── sap_sessions
├── audit_logs
└── outbox
```

---

# Migration Mapping

| Old JSON file            | New MongoDB collection                |
| ------------------------ | ------------------------------------- |
| `user.json`              | `users`, `bot_states`                 |
| `data.json`              | `requests`                            |
| `menu.json`              | `menus`                               |
| `subMenu.json`           | `sub_menus`                           |
| `permisson.json`         | `permissions`                         |
| `accounts.json`          | `accounts`                            |
| `accountsPermisson.json` | `account_permissions`                 |
| `group.json`             | `telegram_chats`, maybe `permissions` |
| `session.json`           | `sap_sessions`                        |

---

# Important Type Normalization Rules

Your audit shows many mixed types, so migration must normalize them.

## `currencyRate`

Old:

```txt
string / number
```

New:

```ts
currencyRate: Decimal128
rawCurrencyRate: String
```

## `summa`

Old:

```txt
string
```

New:

```ts
amount: Decimal128
rawAmount: String
```

## `ddsList[].id`

Old:

```txt
number / string
```

New:

```ts
legacyId: String
```

Convert everything to string for external legacy IDs.

## `pagination.prev`

Old:

```txt
number / string
```

New:

```ts
prev: String | Number
```

Better:

```ts
prevRaw: String
prevNumber?: Number
```

## Dates

Old:

```txt
creationDate: string
startDate: string
endDate: string
stateTime.create: string
```

New:

```ts
createdAt: Date
startDate: Date
endDate: Date
```

Keep the raw value during migration:

```ts
legacy.rawDates.creationDate
```

---

# Mongoose Model Priority

If you are using Node.js, I would implement models in this order:

1. `User`
2. `BotState`
3. `Menu`
4. `SubMenu`
5. `Request`
6. `Permission`
7. `Account`
8. `AccountPermission`
9. `TelegramChat`
10. `SapSession`
11. `AuditLog`
12. `Outbox`

Start with `users`, `menus`, `sub_menus`, and `accounts`, because `requests` and `permissions` will reference them.

---

# Recommended Migration Strategy

## Phase 1 — Import raw backup

Before transforming anything, import every old JSON document into backup collections:

```txt
legacy_user_json
legacy_data_json
legacy_menu_json
legacy_submenu_json
legacy_permisson_json
legacy_accounts_json
legacy_accounts_permisson_json
legacy_group_json
legacy_session_json
```

This gives you rollback safety.

---

## Phase 2 — Normalize base collections

Import:

```txt
menus
sub_menus
accounts
users
telegram_chats
```

These are relatively stable.

---

## Phase 3 — Migrate `data.json` into `requests`

For every old `data.json` record:

1. Convert `ID` to `requestNo`.
2. Convert `id` to `publicId`.
3. Convert `chat_id` to `creator.chatId`.
4. Resolve `creator.userId` by matching `users.telegram.chatId`.
5. Convert `menu` and `subMenu`.
6. Normalize dates.
7. Normalize `summa`, `currencyRate`, prices, quantities.
8. Move file metadata into `files`.
9. Move SAP/Jira fields into `sap`.
10. Keep the full old record inside `legacy.raw`.

---

## Phase 4 — Migrate permissions

Old permission objects should be transformed from this:

```js
{
  chat_id: 123,
  permissonMenuEmp: {
    "11": ["1", "2", "3"]
  }
}
```

into this:

```js
{
  subject: {
    type: "user",
    chatId: 123
  },
  scope: {
    legacyMenuId: "11",
    subMenuIds: ["1", "2", "3"]
  },
  permissionType: "employee",
  actions: {
    view: true,
    create: true
  }
}
```

---

## Phase 5 — Move active user session fields into `bot_states`

From `user.json`, move these fields to `bot_states`:

```txt
user_step
back
currentDataId
lastFile
lastMessageId
pagination
selectedInfoMenu
notConfirmId
lastAdminSteps
selectMenuId
selectedAdminUserChatId
updateMenu
waitingUpdateStatus
extraWaiting
```

Keep `users` clean.

---

# Production Rules

## Use soft delete

Do not physically delete important business records.

```ts
status: {
  isDeleted: Boolean,
  deletedAt?: Date,
  deletedBy?: ObjectId
}
```

## Keep legacy fields temporarily

During migration, every collection should have:

```ts
legacy: {
  sourceFile: String,
  raw: Object
}
```

After 2–3 months of stable production, you can remove raw legacy payloads or move them to archive storage.

## Validate with Zod before saving

Use Mongoose for database schema, but use Zod for runtime validation.

Recommended structure:

```txt
src/
├── database/
│   ├── mongoose.module.ts
│   └── indexes.ts
├── users/
│   ├── user.schema.ts
│   ├── user.repository.ts
│   └── user.service.ts
├── bot-state/
├── requests/
├── permissions/
├── accounts/
├── menus/
├── migration/
│   ├── import-legacy.ts
│   ├── migrate-users.ts
│   ├── migrate-requests.ts
│   └── migrate-permissions.ts
```

---

# My Strong Recommendation

Do **not** migrate old JSON files 1:1 into MongoDB.

The professional design should be:

```txt
users        = real employee/user identity
bot_states   = temporary Telegram flow state
requests     = business workflow records from data.json
menus        = main menu definitions
sub_menus    = submenu + step flow definitions
permissions  = normalized access rules
accounts     = flattened SAP/accounting accounts
outbox       = reliable Telegram/SAP/Jira sending queue
audit_logs   = debugging and accountability
```

This will make the bot much easier to maintain, query, debug, and extend later.
