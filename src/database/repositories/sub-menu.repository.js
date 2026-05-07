const BaseRepository = require('./base.repository');
const SubMenu = require('../models/sub-menu.model');

class SubMenuRepository extends BaseRepository {
  constructor() {
    super(SubMenu);
  }

  async findByLegacyId(legacyId) {
    return await this.findOne({ legacyId, 'status.isActive': true, 'status.isDeleted': false });
  }

  async findByLegacyMenuId(legacyMenuId) {
    return await this.find({ legacyMenuId, 'status.isActive': true, 'status.isDeleted': false });
  }
}

module.exports = new SubMenuRepository();
