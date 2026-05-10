const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  subject: {
    type: { type: String, enum: ['user', 'role', 'group'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chatId: { type: Number },
    role: { type: String },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'TelegramChat' }
  },

  scope: {
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    legacyMenuId: { type: String },
    subMenuIds: [{ type: String }]
  },

  permissionType: {
    type: String,
    enum: ['employee', 'executor', 'affirmative', 'admin'],
    required: true
  },

  actions: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    confirm: { type: Boolean, default: false },
    execute: { type: Boolean, default: false }
  },

  status: {
    isActive: { type: Boolean, default: true }
  },

  legacy: {
    sourceFile: { type: String, default: 'permisson.json' },
    rawKey: { type: String },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

PermissionSchema.index({
  'subject.type': 1,
  'subject.chatId': 1,
  permissionType: 1
});

PermissionSchema.index({
  'scope.legacyMenuId': 1,
  permissionType: 1
});

PermissionSchema.index({
  'subject.role': 1,
  'scope.legacyMenuId': 1
});

module.exports = mongoose.model('Permission', PermissionSchema);
