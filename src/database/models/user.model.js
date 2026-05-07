const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegram: {
    chatId: { type: Number, required: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String }
  },
  employee: {
    employeeId: { type: Number },
    firstName: { type: String },
    lastName: { type: String },
    jobTitle: { type: String, default: null },
    mobilePhone: { type: String },
    mobilePhoneNormalized: { type: String },
    salesPersonCode: { type: Number, default: null }
  },
  role: {
    current: { type: String },
    roles: [{ type: String }],
    isAdmin: { type: Boolean, default: false },
    adminType: { type: String }
  },
  status: {
    isActive: { type: Boolean, default: true },
    confirmationStatus: { type: Boolean, default: false },
    extraWaiting: { type: Boolean, default: false },
    waitingUpdateStatus: { type: Boolean, default: false }
  },
  preferences: {
    selectedInfoMenu: { type: String }
  },
  legacy: {
    sourceFile: { type: String, default: 'user.json' },
    rawEmployeeId: { type: Number },
    rawChatId: { type: Number },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

UserSchema.index({ 'telegram.chatId': 1 }, { unique: true });
UserSchema.index({ 'employee.employeeId': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'employee.mobilePhoneNormalized': 1 });
UserSchema.index({ 'role.current': 1 });
UserSchema.index({ 'status.isActive': 1 });

module.exports = mongoose.model('User', UserSchema);
