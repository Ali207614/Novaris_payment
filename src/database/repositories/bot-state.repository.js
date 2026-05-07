const BaseRepository = require('./base.repository');
const BotState = require('../models/bot-state.model');

class BotStateRepository extends BaseRepository {
  constructor() {
    super(BotState);
  }

  async findByChatId(chatId) {
    return await this.findOne({ chatId });
  }

  async updateState(chatId, data) {
    return await this.model.findOneAndUpdate(
      { chatId },
      { $set: data },
      { new: true, upsert: true }
    ).exec();
  }

  async pushToBackStack(chatId, stackItem) {
    return await this.model.findOneAndUpdate(
      { chatId },
      { $push: { 'navigation.backStack': stackItem } },
      { new: true }
    ).exec();
  }

  async popFromBackStack(chatId) {
    // This is a more complex operation, simplified version here:
    // Pulls the last item
    const state = await this.findOne({ chatId });
    if (state && state.navigation && state.navigation.backStack && state.navigation.backStack.length > 0) {
      state.navigation.backStack.pop();
      return await state.save();
    }
    return state;
  }
}

module.exports = new BotStateRepository();
