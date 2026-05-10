# Professional Logger Plan - Implementation Summary

This plan outlines the implementation of a professional audit logging system for the Novaris Payment bot.

## 1. Objectives
- Track all user interactions with the Telegram bot.
- Log system-level events (SAP HANA connection, database connection).
- Record errors with full stack traces and context for debugging.
- Maintain a searchable audit trail in MongoDB for accountability.

## 2. Architecture

### 2.1 Database Model (`AuditLog`)
Defined in `src/database/models/audit-log.model.js`.
- `actor`: Tracks the user (chatId, userId, role).
- `action`: String identifying the event (e.g., `COMMAND_START`, `SAP_AUTH_SUCCESS`).
- `entity`: Target of the action (type and id).
- `before`/`after`: Snapshots of data states.
- `metadata`: Contextual info (source, requestId, ip).
- `createdAt`: Timestamp.

### 2.2 Repository Layer
`src/database/repositories/audit-log.repository.js`
- Handles all direct MongoDB interactions.
- Extends `BaseRepository` for standard CRUD operations.
- Added helper methods for retrieving logs by ChatID or Entity.

### 2.3 Service Layer
`src/services/loggerService.js`
- Singleton service providing high-level methods:
  - `logBotAction(msg, action, ...)`
  - `logSystemAction(source, action, ...)`
  - `logError(error, context)`

## 3. Integration Points

### 3.1 Bot Handlers (`src/index.js` & `src/controllers/botController.js`)
- **Text Messages:** Logged as `TEXT_MESSAGE`.
- **Commands:** `/start` logged as `COMMAND_START`.
- **Callbacks:** All button interactions logged as `CALLBACK_QUERY`.
- **Documents:** File uploads logged as `DOCUMENT_UPLOAD`.
- **Errors:** All handler exceptions caught and logged as `HANDLER_ERROR`.

### 3.2 SAP Integration (`src/controllers/b1Controller.js`)
- **Authentication:** Success and failure of SAP B1 Login logged.
- **Connection:** Global SAP HANA connection status logged at startup.

### 3.3 Database (`src/index.js`)
- **Connection:** MongoDB connection success/failure logged.

## 4. Usage Example
```javascript
const loggerService = require('./services/loggerService');

// In a controller
await loggerService.logBotAction(msg, 'PROCESS_PAYMENT', { 
  type: 'payment', 
  id: paymentId 
});
```

## 5. Future Enhancements
- Log data changes in `dataStore.js` and `userStore.js` (Transitioning to MongoDB).
- Implement an Admin UI to view audit logs.
- Add log rotation or TTL indexes for very high volume environments (Currently rely on MongoDB storage).
