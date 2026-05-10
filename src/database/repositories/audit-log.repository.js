const BaseRepository = require('./base.repository');
const AuditLog = require('../models/audit-log.model');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async getRecentLogs(limit = 100) {
    return await this.find({}, { createdAt: -1 }, limit);
  }

  async getLogsByChatId(chatId, limit = 50) {
    return await this.find({ 'actor.chatId': chatId }, { createdAt: -1 }, limit);
  }

  async getLogsByEntity(entityType, entityId, limit = 50) {
    return await this.find(
      { 'entity.type': entityType, 'entity.id': entityId },
      { createdAt: -1 },
      limit
    );
  }
}

module.exports = new AuditLogRepository();
