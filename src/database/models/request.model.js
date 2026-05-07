const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestNo: { type: Number },
  publicId: { type: String },

  type: { type: String }, // payment | purchase | sap | ticket | generic
  source: { type: String, default: 'telegram_bot' },

  creator: {
    chatId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  menu: {
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    legacyMenuId: { type: Number },
    menuName: { type: String },
    subMenuId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubMenu' },
    legacySubMenuId: { type: String },
    subMenuName: { type: String }
  },

  financial: {
    isPayment: { type: Boolean, default: false },
    isPurchase: { type: Boolean, default: false },
    amount: { type: mongoose.Types.Decimal128 },
    rawAmount: { type: String },
    currency: { type: String },
    currencyRate: { type: mongoose.Types.Decimal128 },
    rawCurrencyRate: { type: String },
    payType: { type: String },
    accountType: { type: String },
    point: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    documentType: { type: Boolean }
  },

  accounts: {
    accountCode: { type: String },
    accountCodeOther: { type: String },
    selectedAccounts: [{
      accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
      legacyId: { type: String },
      name: { type: String },
      num: { type: Number },
      source: { type: String }
    }],
    dds: {
      code: { type: String },
      list: [{
        legacyId: { type: String },
        name: { type: String }
      }]
    }
  },

  vendor: {
    vendorId: { type: String },
    selectedVendors: [{
      legacyId: { type: String },
      name: { type: String },
      num: { type: Number }
    }]
  },

  customer: {
    customerId: { type: String },
    customerCode: { type: String },
    customerName: { type: String },
    selectedCustomers: [{
      legacyId: { type: String },
      name: { type: String },
      customerName: { type: String },
      num: { type: Number }
    }]
  },

  workflow: {
    isFull: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    confirmative: {
      chatId: { type: Number },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: Boolean, default: false },
      date: { type: Date }
    },
    executor: {
      chatId: { type: Number },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: Boolean, default: false },
      date: { type: Date }
    },
    confirmativeSendList: [{
      chatId: { type: Number },
      messageId: { type: Number }
    }]
  },

  sap: {
    enabled: { type: Boolean, default: false },
    sapB1: { type: Boolean, default: false },
    jira: { type: Boolean, default: false },
    jiraMessage: { type: String },
    errorMessage: { type: String }
  },

  ticket: {
    ticketNo: { type: String },
    isAdded: { type: Boolean, default: false },
    status: {
      comment: { type: mongoose.Schema.Types.Mixed } // String or Number
    }
  },

  purchaseOrder: {
    purchaseEntry: { type: String },
    orders: [{
      docEntry: { type: Number },
      docNum: { type: Number },
      docStatus: { type: String },
      docType: { type: String },
      cardCode: { type: String },
      cardName: { type: String },
      currency: { type: String },
      itemCode: { type: String },
      lineNum: { type: Number },
      numAtCard: { type: String },
      price: { type: mongoose.Types.Decimal128 },
      quantity: { type: mongoose.Types.Decimal128 },
      rate: { type: mongoose.Types.Decimal128 },
      canceled: { type: String },
      raw: { type: mongoose.Schema.Types.Mixed }
    }]
  },

  files: [{
    fileId: { type: String },
    fileUniqueId: { type: String },
    fileName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    thumbnail: {
      fileId: { type: String },
      fileUniqueId: { type: String },
      size: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    isActive: { type: Boolean, default: true },
    isSent: { type: Boolean, default: false }
  }],

  comment: { type: String },
  notConfirmMessage: { type: String },

  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    confirmativeAt: { type: Date },
    executorAt: { type: Date }
  },

  legacy: {
    sourceFile: { type: String, default: 'data.json' },
    rawId: { type: String },
    rawID: { type: Number },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
});

RequestSchema.index({ requestNo: 1 }, { unique: true, sparse: true });
RequestSchema.index({ publicId: 1 }, { unique: true, sparse: true });

RequestSchema.index({ 'creator.chatId': 1 });
RequestSchema.index({ 'creator.userId': 1 });

RequestSchema.index({ type: 1 });
RequestSchema.index({ 'menu.legacyMenuId': 1 });
RequestSchema.index({ 'menu.legacySubMenuId': 1 });

RequestSchema.index({ 'workflow.isDeleted': 1 });
RequestSchema.index({ 'workflow.confirmative.status': 1 });
RequestSchema.index({ 'workflow.executor.status': 1 });

RequestSchema.index({ 'sap.enabled': 1 });
RequestSchema.index({ 'sap.sapB1': 1 });
RequestSchema.index({ 'ticket.ticketNo': 1 });

RequestSchema.index({ 'timestamps.createdAt': -1 });
RequestSchema.index({ 'financial.startDate': 1, 'financial.endDate': 1 });

module.exports = mongoose.model('Request', RequestSchema);
