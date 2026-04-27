import { Schema, model, Types } from "mongoose";

export interface INotification {
    title: string;
    body: string;
    type?: string;
    data?: any;

    user: Types.ObjectId;

    isRead: boolean;

    createdBy: Types.ObjectId;
}