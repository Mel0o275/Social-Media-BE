import { Model, Document, CreateOptions, HydratedDocument, FilterQuery } from 'mongoose';

export abstract class BaseRepo<TRawDocument extends Document> {
    constructor(protected readonly model: Model<TRawDocument>) { }

    async create({ data, options }: { data: Partial<TRawDocument>[], options?: CreateOptions }): Promise<HydratedDocument<TRawDocument>[]> {
        const createdDocs = await this.model.create(data, options);
        return createdDocs;
    }

    async findOne(filter: FilterQuery<TRawDocument>): Promise<HydratedDocument<TRawDocument> | null> {
        return this.model.findOne(filter).exec();
    }

    async find(filter: FilterQuery<TRawDocument>): Promise<HydratedDocument<TRawDocument>[]> {
        return this.model.find(filter).exec();
    }

    async updateOne(filter: FilterQuery<TRawDocument>, updateData: Partial<TRawDocument>): Promise<{ matchedCount: number; modifiedCount: number }> {
        const result = await this.model.updateOne(filter, updateData).exec();
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    }

    async deleteOne(filter: FilterQuery<TRawDocument>): Promise<{ deletedCount?: number }> {
        const result = await this.model.deleteOne(filter).exec();
        return { deletedCount: result.deletedCount };
    }
}