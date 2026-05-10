const mongoose = require('mongoose');

const OutboxSchema = new mongoose.Schema({
  type: { type: String, enum: ['telegram_message', 'sap_request', 'jira_request'], required: true },

  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },

  payload: { type: mongoose.Schema.Types.Mixed, required: true },

  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },

  error: {
    message: { type: String },
    stack: { type: String },
    code: { type: String }
  },

  scheduledAt: { type: Date, default: Date.now },
  processedAt: { type: Date }

}, { timestamps: true });

OutboxSchema.index({ status: 1, scheduledAt: 1 });
OutboxSchema.index({ type: 1, status: 1 });
OutboxSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Outbox', OutboxSchema);
