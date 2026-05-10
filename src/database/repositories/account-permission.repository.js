const BaseRepository = require('./base.repository');
const AccountPermission = require('../models/account-permission.model');

class AccountPermissionRepository extends BaseRepository {
  constructor() {
    super(AccountPermission);
  }

  async findByLegacyMenuId(menuId) {
    return await this.findOne({ menuId });
  }
}

module.exports = new AccountPermissionRepository();
