import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { PostAvailabilityEnum, ReactionTypeEnum } from "../enums/post.enum";

export interface IPost{
    folderId: string;
    content? : string;
    attachments?: string[];

    reactions?: ReactionTypeEnum[]; 
    tags?: Types.ObjectId[] | IUser[];
    availability: PostAvailabilityEnum;
    comments?: Types.ObjectId[] | IPost[];
    
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;

    isDeleted?: boolean;

    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    restoredAt?: Date;
}