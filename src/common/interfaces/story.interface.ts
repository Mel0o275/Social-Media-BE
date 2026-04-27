import { Types } from "mongoose";

export interface IStory {
    _id: Types.ObjectId;

    user: Types.ObjectId;

    media: string[];

    caption?: string;

    views: Types.ObjectId[];
    visibility: "public" | "private" | "friends";

    createdAt: Date;
    updatedAt: Date;
}