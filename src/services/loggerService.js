const auditLogRepository = require('../database/repositories/audit-log.repository');
const mongoose = require('mongoose');

/**
 * LoggerService for professional audit logging.
 */
class LoggerService {
  /**
   * Generic log method
   * @param {Object} logData - Audit log data matching the schema
   */
  async log(logData) {
    try {
      if (logData.metadata) {
        const { source, requestId, ip, details, ...extraMetadata } = logData.metadata;
        logData.metadata = {
          source,
          requestId,
          ip,
          details: {
            ...details,
            ...extraMetadata
          }
        };
      }

      // Basic validation for required fields
      if (!logData.action || !logData.metadata || !logData.metadata.source) {
        console.warn('[LoggerService] Missing required log fields:', logData);
      }

      // Ensure entity.id is a valid ObjectId or remove it
      if (logData.entity && logData.entity.id) {
        if (!mongoose.Types.ObjectId.isValid(logData.entity.id)) {
          // If not a valid ObjectId, move it to metadata and delete from entity
          logData.metadata.entityIdentifier = logData.entity.id;
          delete logData.entity.id;
        }
      }

      await auditLogRepository.create({
        ...logData,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('[LoggerService] Critical failure while saving audit log:', error.message);
    }
  }

  /**
   * Logs an action performed via the Telegram Bot
   * @param {Object} msg - Telegram message object
   * @param {string} action - Action name (e.g., 'COMMAND_START', 'BUTTON_CLICK')
   * @param {Object} [entity] - Entity being acted upon (type and id)
   * @param {Object} [data] - before/after state if applicable
   * @param {Object} [metadata] - Additional metadata
   */
  async logBotAction(msg, action, entity = { type: 'bot_interaction' }, data = {}, metadata = {}) {
    const actor = {
      chatId: msg.chat?.id,
      userId: null, // Should be populated if MongoDB user exists
      role: 'user'
    };

    return this.log({
      actor,
      action,
      entity,
      before: data.before,
      after: data.after,
      metadata: {
        source: 'telegram_bot',
        requestId: msg.message_id?.toString(),
        ...metadata
      }
    });
  }

  /**
   * Logs a system-level action (SAP sync, Migration, etc.)
   * @param {string} source - 'sap_sync' | 'migration' | 'admin_panel'
   * @param {string} action - Action name
   * @param {Object} [entity] - Affected entity
   * @param {Object} [data] - State changes
   */
  async logSystemAction(source, action, entity = { type: 'system' }, data = {}) {
    return this.log({
      actor: { role: 'system' },
      action,
      entity,
      before: data.before,
      after: data.after,
      metadata: {
        source,
        ...data.metadata
      }
    });
  }

  /**
   * Logs an error with context
   * @param {Error} error - Error object
   * @param {Object} [context] - Context of where the error occurred
   */
  async logError(error, context = {}) {
    console.error(`[LoggerService] Logging Error: ${error.message}`, context);
    
    return this.log({
      actor: context.actor || { role: 'system' },
      action: context.action || 'SYSTEM_ERROR',
      entity: context.entity || { type: 'error' },
      before: { stack: error.stack },
      after: { message: error.message },
      metadata: {
        source: context.source || 'system',
        ...context.metadata
      }
    });
  }
}

module.exports = new LoggerService();
