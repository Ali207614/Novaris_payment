const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;
let connectionPromise = null;
let listenersRegistered = false;
let isDisconnecting = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    if (!isDisconnecting) {
      console.warn('[MongoDB] Disconnected from database.');
    }
    isConnected = false;
    connectionPromise = null;
  });
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('MongoDB is already connected.');
    return mongoose.connection;
  }

  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  try {
    const dbUri = config.mongodb.uri;

    const options = {
      dbName: config.mongodb.dbName,
      maxPoolSize: config.mongodb.maxPoolSize,
      minPoolSize: config.mongodb.minPoolSize,
      serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
      socketTimeoutMS: config.mongodb.socketTimeoutMS,
    };

    registerConnectionListeners();

    connectionPromise = mongoose.connect(dbUri, options);
    await connectionPromise;
    isConnected = mongoose.connection.readyState === 1;

    console.log(`[MongoDB] Connected successfully to ${config.mongodb.dbName}`);

    return mongoose.connection;
  } catch (error) {
    console.error('[MongoDB] Failed to connect:', error.message);
    connectionPromise = null;
    isConnected = false;
    throw error;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    isDisconnecting = true;
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    isDisconnecting = false;
    console.log('[MongoDB] Disconnected.');
  }
};

const isMongoConnected = () => mongoose.connection.readyState === 1 && isConnected;

module.exports = { connectDB, disconnectDB, isMongoConnected, mongoose };
