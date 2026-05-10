const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  source: { type: String }, // "43" | "50" | "94"

  category: { type: String }, // Naqd, Karta, Terminal, Qarz, Tovar qabuli...
  paymentType: { type: String }, // Naqd, Karta, Terminal, O'tkazma
  currency: { type: String }, // UZS, USD

  account: {
    legacyId: { type: String },
    code: { type: String },
    name: { type: String, required: true },
    num: { type: Number }
  },

  status: {
    isActive: { type: Boolean, default: true }
  },

  legacy: {
    sourceFile: { type: String, default: 'accounts.json' },
    path: { type: String }, // accounts50.Naqd.USD
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

AccountSchema.index({ source: 1 });
AccountSchema.index({ category: 1 });
AccountSchema.index({ paymentType: 1, currency: 1 });
AccountSchema.index({ 'account.legacyId': 1 });
AccountSchema.index({ 'account.num': 1 });

module.exports = mongoose.model('Account', AccountSchema);
