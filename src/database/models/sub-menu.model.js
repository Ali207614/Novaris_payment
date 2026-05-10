const mongoose = require('mongoose');

const SubMenuSchema = new mongoose.Schema({
  legacyId: { type: Number, required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
  legacyMenuId: { type: String },

  name: { type: String, required: true },
  comment: { type: String },

  infoFunction: { type: String },

  flow: {
    lastStep: { type: Number },
    updateLine: { type: Number },
    steps: [{
      legacyId: { type: Number },
      step: { type: String },
      name: { type: String },
      message: { type: String },
      button: { type: String }
    }]
  },

  status: {
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },

  legacy: {
    sourceFile: { type: String, default: 'subMenu.json' },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

SubMenuSchema.index({ legacyId: 1 }, { unique: true });
SubMenuSchema.index({ menuId: 1 });
SubMenuSchema.index({ legacyMenuId: 1 });
SubMenuSchema.index({ 'status.isActive': 1 });

module.exports = mongoose.model('SubMenu', SubMenuSchema);
