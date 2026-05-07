const BaseRepository = require('./base.repository');
const Menu = require('../models/menu.model');

class MenuRepository extends BaseRepository {
  constructor() {
    super(Menu);
  }

  async findByLegacyId(legacyId) {
    return await this.findOne({ legacyId, 'status.isActive': true, 'status.isDeleted': false });
  }

  async getActiveMenus() {
    return await this.find({ 'status.isActive': true, 'status.isDeleted': false }, { sortOrder: 1 });
  }
}

module.exports = new MenuRepository();
