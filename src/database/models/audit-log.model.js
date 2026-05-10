const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chatId: { type: Number },
    role: { type: String }
  },

  action: { type: String, required: true },

  entity: {
    type: { type: String, required: true },
    id: { type: mongoose.Schema.Types.ObjectId }
  },

  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },

  metadata: {
    source: { type: String, enum: ['telegram_bot', 'migration', 'admin_panel', 'sap_sync', 'verifix_sync', 'system'], default: 'telegram_bot' },
    requestId: { type: String },
    ip: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }
  },

  createdAt: { type: Date, default: Date.now }
});

AuditLogSchema.index({ 'actor.chatId': 1 });
AuditLogSchema.index({ 'entity.type': 1, 'entity.id': 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
