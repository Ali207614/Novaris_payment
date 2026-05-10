const BaseRepository = require('./base.repository');
const Account = require('../models/account.model');

class AccountRepository extends BaseRepository {
  constructor() {
    super(Account);
  }

  async findBySource(source) {
    return await this.find({ source, 'status.isActive': true });
  }

  async findByLegacyId(legacyId) {
    return await this.findOne({ 'account.legacyId': legacyId });
  }
}

module.exports = new AccountRepository();
