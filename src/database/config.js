const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telegram_bot_db',
    dbName: process.env.MONGODB_DB_NAME || 'telegram_bot_db',
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2', 10),
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
  }
};

const validateConfig = () => {
  if (!process.env.MONGODB_URI) {
    console.warn('WARN: MONGODB_URI is not set. Using default local URI.');
  }
};

validateConfig();

module.exports = config;
