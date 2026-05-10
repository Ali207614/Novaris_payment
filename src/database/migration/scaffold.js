/**
 * MIGRATION SCAFFOLDING
 *
 * This folder contains placeholders and scaffold scripts for migrating legacy JSON files
 * into the new MongoDB schema.
 *
 * Strategy:
 * 1. Read from `data.json`, `user.json`, etc.
 * 2. Transform the raw payload into the new Schema format.
 * 3. Save to MongoDB using the newly created Repository layer.
 * 4. Keep the original `raw` data in the `legacy` field for safety.
 *
 * DO NOT directly delete or modify the legacy JSON files.
 * Migration should be run manually or as a background job once MongoDB is connected.
 */

const importLegacyData = async () => {
    // TODO: Phase 1
    // Load old JSON files into temporary backup collections:
    // `legacy_user_json`, `legacy_data_json`, etc.
    console.log('TODO: Implement phase 1 import');
};

const migrateUsers = async () => {
    // TODO: Phase 2
    // Iterate over `user.json`
    // Extract real employee data for `users` collection.
    // Move `user_step`, `back`, `lastFile`, etc. to `bot_states` collection.
    console.log('TODO: Implement user/bot_state migration');
};

const migrateRequests = async () => {
    // TODO: Phase 3
    // Iterate over `data.json`
    // Normalize `summa` to `amount` (Decimal128)
    // Convert IDs to String where appropriate.
    // Store original record in `legacy.raw`
    console.log('TODO: Implement request migration');
};

const migratePermissions = async () => {
    // TODO: Phase 4
    // Flatten `permisson.json` structure
    // Convert `{ chat_id, permissonMenuEmp: { "11": [...] } }`
    // to `{ subject: { type: 'user', chatId }, scope: { legacyMenuId: "11" }, ... }`
    console.log('TODO: Implement permission migration');
};

module.exports = {
    importLegacyData,
    migrateUsers,
    migrateRequests,
    migratePermissions
};
