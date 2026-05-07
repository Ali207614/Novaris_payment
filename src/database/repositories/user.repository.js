const BaseRepository = require('./base.repository');
const User = require('../models/user.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByChatId(chatId) {
    return await this.findOne({ 'telegram.chatId': chatId });
  }

  async findByEmployeeId(employeeId) {
    return await this.findOne({ 'employee.employeeId': employeeId });
  }

  async getActiveUsers() {
    return await this.find({ 'status.isActive': true });
  }
}

module.exports = new UserRepository();
