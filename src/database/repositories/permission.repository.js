const BaseRepository = require('./base.repository');
const Permission = require('../models/permission.model');

class PermissionRepository extends BaseRepository {
  constructor() {
    super(Permission);
  }

  async findUserPermissions(chatId) {
    return await this.find({ 'subject.chatId': chatId, 'status.isActive': true });
  }

  async findMenuPermissions(legacyMenuId) {
    return await this.find({ 'scope.legacyMenuId': legacyMenuId, 'status.isActive': true });
  }

  async replaceUserPermissions(chatId, permissions) {
    await this.deleteMany({ 'subject.chatId': chatId });
    if (!permissions.length) return [];
    return await this.model.insertMany(permissions);
  }
}

module.exports = new PermissionRepository();
