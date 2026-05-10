const { connectDB, disconnectDB } = require('../mongoose.module');

// Load all models to ensure they are registered with Mongoose
require('../models/user.model');
require('../models/bot-state.model');
require('../models/menu.model');
require('../models/sub-menu.model');
require('../models/request.model');
require('../models/permission.model');
require('../models/account.model');
require('../models/account-permission.model');
require('../models/telegram-chat.model');
require('../models/sap-session.model');
require('../models/audit-log.model');
require('../models/outbox.model');

const mongoose = require('mongoose');

const checkIndexes = async () => {
  console.log('Starting MongoDB index check & creation...');
  try {
    await connectDB();

    const models = mongoose.modelNames();
    console.log(`Found ${models.length} registered models.`);

    for (const modelName of models) {
      const model = mongoose.model(modelName);
      console.log(`Syncing indexes for ${modelName}...`);
      await model.syncIndexes();
      console.log(`✅ Indexes synced for ${modelName}`);
    }

    console.log('🎉 All indexes successfully created/synced.');
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Failed to create/sync indexes:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

checkIndexes();
