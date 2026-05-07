const mongoose = require('mongoose');

const BotStateSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  current: {
    step: { type: Number },
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    subMenuId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubMenu' },
    dataId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    role: { type: String }
  },

  navigation: {
    backStack: [{
      step: { type: Number },
      text: { type: String },
      buttonSnapshot: { type: mongoose.Schema.Types.Mixed },
      createdAt: { type: Date, default: Date.now }
    }]
  },

  pagination: {
    prev: { type: mongoose.Schema.Types.Mixed }, // String or Number
    next: { type: Number }
  },

  lastMessage: {
    messageId: { type: Number },
    text: { type: String },
    replyMarkup: { type: mongoose.Schema.Types.Mixed }
  },

  lastFile: {
    fileId: { type: String },
    fileUniqueId: { type: String },
    fileName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    currentDataId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' }
  },

  adminFlow: {
    selectedAdminUserChatId: { type: Number },
    selectedAdminUserStatus: { type: String },
    selectedMenuId: { type: String },
    selectedGroup: {
      menu: { type: String },
      subMenu: { type: String }
    },
    updateMenu: { type: mongoose.Schema.Types.Mixed }
  },

  flags: {
    update: { type: Boolean, default: false },
    waitingUpdateStatus: { type: Boolean, default: false },
    extraWaiting: { type: Boolean, default: false }
  },

  expiresAt: { type: Date }
}, { timestamps: true });

BotStateSchema.index({ chatId: 1 }, { unique: true });
BotStateSchema.index({ userId: 1 });
BotStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BotState', BotStateSchema);
