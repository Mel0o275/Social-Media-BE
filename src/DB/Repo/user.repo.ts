import { Model } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { BaseRepo } from "./base.repo";
import { Document } from "mongoose";

export class UserRepo extends BaseRepo<IUser & Document> {
    constructor(protected override model: Model<IUser & Document>) {
        super(model);
    }
}