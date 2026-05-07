const mongoose = require('mongoose');

const SapSessionSchema = new mongoose.Schema({
  provider: { type: String, enum: ['sap_b1'], default: 'sap_b1' },

  sessionId: { type: String, required: true },
  cookiesEncrypted: { type: String, required: true },

  status: {
    isActive: { type: Boolean, default: true }
  },

  expiresAt: { type: Date, required: true },

  legacy: {
    sourceFile: { type: String, default: 'session.json' }
  }
}, { timestamps: true });

SapSessionSchema.index({ provider: 1 });
SapSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SapSession', SapSessionSchema);
