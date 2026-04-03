"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepo = void 0;
class BaseRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        const createdDocs = await this.model.create(data, options);
        return createdDocs;
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async find(filter) {
        return this.model.find(filter).exec();
    }
    async updateOne(filter, updateData) {
        const result = await this.model.updateOne(filter, updateData).exec();
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    }
    async deleteOne(filter) {
        const result = await this.model.deleteOne(filter).exec();
        return { deletedCount: result.deletedCount };
    }
}
exports.BaseRepo = BaseRepo;
