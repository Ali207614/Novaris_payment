# MongoDB Architecture and Migration Guide

This repository contains a professional MongoDB layer intended to gradually replace the legacy raw JSON databases (`data.json`, `user.json`, etc.).

The goal is to maintain backward compatibility while slowly transitioning to structured schemas using Mongoose.

## 1. Environment Configuration

Create a `.env` file in the root directory and configure the database connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/telegram_bot_db
MONGODB_DB_NAME=telegram_bot_db
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000
```

*Note: Never commit your actual `.env` file containing secrets.*

## 2. Models & Collections

12 collections have been carefully planned and implemented based on the `DATABASE_PLAN.md` strategy:

1. **`users`** - Employee identity and Telegram linking.
2. **`bot_states`** - Extracted from `user.json` to handle temporary Telegram conversational states.
3. **`menus`** - Flattened menu structures (`menu.json`).
4. **`sub_menus`** - Flow and steps for submenus (`subMenu.json`).
5. **`requests`** - Replaces `data.json`. Complex workflows and payment/purchases.
6. **`permissions`** - Normalized user access replacing `permisson.json`.
7. **`accounts`** - Flattened SAP/accounting structures replacing `accounts.json`.
8. **`account_permissions`** - Access control for accounts replacing `accountsPermisson.json`.
9. **`telegram_chats`** - Replaces `group.json` for supergroup/channel administration.
10. **`sap_sessions`** - Replaces `session.json` (encrypted).
11. **`audit_logs`** - New collection to track user actions, state changes, etc.
12. **`outbox`** - Reliable job queue for dispatching Telegram or SAP requests out-of-band.

## 3. Usage & Testing

### Running Tests

We use Node's native test runner. Tests evaluate environment parsing, connection handling, and schema validation.

```bash
npm run db:mongo:test
```

### Health Check

Ping the configured MongoDB database to ensure the connection works:

```bash
npm run db:mongo:check
```

### Initializing Indexes

Mongoose automatically handles indexes, but to be sure, you can run:

```bash
npm run db:mongo:indexes
```

## 4. Reusable Repositories

Avoid invoking Mongoose models (`User.find()`) directly in your business logic. Use the provided Repository pattern in `src/database/repositories/`.

Example usage:

```javascript
const userRepository = require('./src/database/repositories/user.repository');

// Fetch a user
const user = await userRepository.findByChatId(123456);
```

## 5. Migration Strategy

The folder `src/database/migration/` contains scaffolding for gradually importing JSON data.

**Rules:**
- **Do not** aggressively delete legacy `.json` files.
- The `legacy` field in each MongoDB schema safely retains the raw original JSON data so you don't lose unstructured metadata.
- Convert timestamps to `Date` and numeric currency to `mongoose.Types.Decimal128` during migration.
- `data.json` IDs are mapped to `requestNo` / `publicId` fields in the `requests` collection.
