const BaseRepository = require('./base.repository');
const Request = require('../models/request.model');

class RequestRepository extends BaseRepository {
  constructor() {
    super(Request);
  }

  async findByRequestNo(requestNo) {
    return await this.findOne({ requestNo });
  }

  async findByPublicId(publicId) {
    return await this.findOne({ publicId });
  }

  async findPendingByChatId(chatId) {
    return await this.find({
      'creator.chatId': chatId,
      'workflow.isDeleted': false,
      $or: [
        { 'workflow.confirmative.status': false },
        { 'workflow.executor.status': false }
      ]
    });
  }
}

module.exports = new RequestRepository();
