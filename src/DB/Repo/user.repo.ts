import { Model } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { BaseRepo } from "./base.repo";

export class UserRepo extends BaseRepo<IUser> {
    constructor(protected override model: Model<IUser>) {
        super(model);
    }
}