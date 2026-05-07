const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected.');
    return mongoose.connection;
  }

  try {
    const dbUri = config.mongodb.uri;

    // Mongoose connection options
    const options = {
      dbName: config.mongodb.dbName,
      maxPoolSize: config.mongodb.maxPoolSize,
      minPoolSize: config.mongodb.minPoolSize,
      serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
      socketTimeoutMS: config.mongodb.socketTimeoutMS,
    };

    await mongoose.connect(dbUri, options);
    isConnected = mongoose.connection.readyState === 1;

    console.log(`[MongoDB] Connected successfully to ${config.mongodb.dbName}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database.');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error('[MongoDB] Failed to connect:', error.message);
    // Don't kill the whole app if mongo fails since it's an incremental migration
    // process.exit(1);
    throw error;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected.');
  }
};

module.exports = { connectDB, disconnectDB, mongoose };
