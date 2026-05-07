const mongoose = require('mongoose');

const TelegramChatSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  type: { type: String, enum: ['private', 'group', 'supergroup', 'channel'], required: true },
  title: { type: String },

  group: {
    allMembersAreAdministrators: { type: Boolean },
    isForum: { type: Boolean }
  },

  permissions: [{
    legacyMenuId: { type: String },
    subMenuIds: [{ type: String }],
    actions: [{ type: String }]
  }],

  status: {
    isActive: { type: Boolean, default: true }
  },

  legacy: {
    sourceFile: { type: String, default: 'group.json' },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

TelegramChatSchema.index({ chatId: 1 }, { unique: true });
TelegramChatSchema.index({ type: 1 });
TelegramChatSchema.index({ title: 'text' });

module.exports = mongoose.model('TelegramChat', TelegramChatSchema);
