const BaseRepository = require('./base.repository');
const Outbox = require('../models/outbox.model');

class OutboxRepository extends BaseRepository {
  constructor() {
    super(Outbox);
  }

  async getPending() {
    return await this.find({ status: 'pending' });
  }

  async getByChatId(chatId) {
    return await this.find({ chatId });
  }
}

module.exports = new OutboxRepository();
