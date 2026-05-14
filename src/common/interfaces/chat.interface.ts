import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { ReactionTypeEnum } from "../enums/post.enum";
import { ChatEnum } from "../enums/chat.enum";

export interface IMessage {
    content?: string;
    attachments?: string[];
    reactions?: ReactionTypeEnum[];
    tags?: Types.ObjectId[] | IUser[];
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    restoredAt?: Date;
    createdBy: Types.ObjectId | IUser;

}

export interface IChat {
    participants: Types.ObjectId[] | IUser[],
    createdBy: Types.ObjectId | IUser;
    messages: IMessage[],
    type: ChatEnum,

    //Group
    group: string,
    groupImage: string,
    roomId:string,

    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    restoredAt?: Date;
    isDeleted?: boolean;
}