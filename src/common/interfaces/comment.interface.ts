import { Types } from "mongoose";
import { PostAvailabilityEnum } from "../enums/post.enum";

export interface IComment {

    _id?: Types.ObjectId;

    postId: Types.ObjectId;
    parentComment?: Types.ObjectId | null;

    content?: string;
    attachments?: string[];

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    likes?: Types.ObjectId[];

    tags?: Types.ObjectId[];

    availability?: PostAvailabilityEnum;

    deletedAt?: Date | null;
    restoredAt?: Date | null;

    createdAt?: Date;
    updatedAt?: Date;
}