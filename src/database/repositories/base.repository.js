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

  _buildUpdate(data) {
    if (!data || typeof data !== 'object') return data;
    const hasOperator = Object.keys(data).some((key) => key.startsWith('$'));
    return hasOperator ? data : { $set: data };
  }

  async updateById(id, data, options = {}) {
    return await this.model.findByIdAndUpdate(
      id,
      this._buildUpdate(data),
      { new: true, ...options }
    ).exec();
  }

  async updateOne(query, data, options = {}) {
    return await this.model.findOneAndUpdate(
      query,
      this._buildUpdate(data),
      { new: true, ...options }
    ).exec();
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(query) {
    return await this.model.findOneAndDelete(query).exec();
  }

  async deleteMany(query) {
    return await this.model.deleteMany(query).exec();
  }

  async softDeleteById(id) {
    return await this.updateById(id, { 'status.isDeleted': true });
  }
}

module.exports = BaseRepository;
