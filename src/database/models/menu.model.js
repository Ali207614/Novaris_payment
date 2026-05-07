const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  legacyId: { type: Number, required: true },
  name: { type: String, required: true },

  status: {
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },

  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

MenuSchema.index({ legacyId: 1 }, { unique: true });
MenuSchema.index({ 'status.isActive': 1 });

module.exports = mongoose.model('Menu', MenuSchema);
