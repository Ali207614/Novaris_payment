class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id) {
    return await this.model.findById(id).exec();
  }

  async findOne(query) {
    return await this.model.findOne(query).exec();
  }

  async find(query, sort = {}, limit = 0) {
    return await this.model.find(query).sort(sort).limit(limit).exec();
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateOne(query, data) {
    return await this.model.findOneAndUpdate(query, data, { new: true }).exec();
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(query) {
    return await this.model.findOneAndDelete(query).exec();
  }

  async softDeleteById(id) {
    return await this.updateById(id, { 'status.isDeleted': true });
  }
}

module.exports = BaseRepository;
