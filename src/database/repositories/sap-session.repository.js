const BaseRepository = require('./base.repository');
const SapSession = require('../models/sap-session.model');

class SapSessionRepository extends BaseRepository {
  constructor() {
    super(SapSession);
  }

  async getLatestSession() {
    return await this.findOne({}).sort({ createdAt: -1 });
  }
}

module.exports = new SapSessionRepository();
