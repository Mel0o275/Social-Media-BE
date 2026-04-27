import { Model, Document } from "mongoose";
import { BaseRepo } from "./base.repo";
import { IPost } from "../../common/interfaces/post.interface";

export class PostRepo extends BaseRepo<IPost & Document> {
    constructor(protected override model: Model<IPost & Document>) {
        super(model);
    }
}