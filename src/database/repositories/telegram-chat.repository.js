const BaseRepository = require('./base.repository');
const TelegramChat = require('../models/telegram-chat.model');

class TelegramChatRepository extends BaseRepository {
  constructor() {
    super(TelegramChat);
  }

  async findByChatId(chatId) {
    return await this.findOne({ chatId });
  }

  async getActiveGroups() {
    return await this.find({ type: { $in: ['group', 'supergroup'] }, 'status.isActive': true });
  }
}

module.exports = new TelegramChatRepository();
