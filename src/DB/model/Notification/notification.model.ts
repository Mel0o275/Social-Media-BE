import { model, Schema } from "mongoose";
import { INotification } from "../../../common/interfaces/notification.interface";

const notificationSchema = new Schema<INotification>(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        type: { type: String },

        data: { type: Schema.Types.Mixed },

        user: { type: Schema.Types.ObjectId, ref: "User", required: true },

        isRead: { type: Boolean, default: false },

        createdBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    {
        timestamps: true,
        collection: "Notifications"
    }
);

export const NotificationModel = model<INotification>('notification', notificationSchema) || model<INotification>('notification');

