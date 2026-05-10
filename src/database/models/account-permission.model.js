const mongoose = require('mongoose');

const AccountPermissionSchema = new mongoose.Schema({
  subject: {
    type: { type: String, enum: ['user', 'role', 'group'], required: true },
    chatId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'TelegramChat' }
  },

  scope: {
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    legacyMenuId: { type: String },
    subMenuId: { type: String }
  },

  accountIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],

  actions: {
    view: { type: Boolean, default: false },
    select: { type: Boolean, default: false },
    approve: { type: Boolean, default: false }
  },

  legacy: {
    sourceFile: { type: String, default: 'accountsPermisson.json' },
    rawPath: { type: String },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

AccountPermissionSchema.index({
  'subject.type': 1,
  'subject.chatId': 1
});

AccountPermissionSchema.index({
  'scope.legacyMenuId': 1,
  'scope.subMenuId': 1
});

module.exports = mongoose.model('AccountPermission', AccountPermissionSchema);
