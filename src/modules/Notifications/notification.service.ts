import { Types } from "mongoose";
import { NotificationType } from "../../common/enums/post.enum";
import { fcmService } from "../../common/services/notification.service";
import { NotificationModel } from "../../DB/model/Notification/notification.model";

export class NotificationService {

    async createNotification({
        title,
        body,
        receiver,
        sender,
        type = NotificationType.SYSTEM,
        tokens = []
    }: any) {

        const notification = await NotificationModel.create({
            title,
            body,
            user: receiver,
            type
        });

        if (tokens.length) {
            await fcmService.sendNotifications({
                tokens,
                title,
                body
            });
        }

        return notification;
    }


    async getUserNotifications(userId: Types.ObjectId) {
        return NotificationModel.find({ user: userId })
            .sort({ createdAt: -1 });
    }

    async markAsRead(notificationId: Types.ObjectId, userId: Types.ObjectId) {

        const result = await NotificationModel.updateOne(
            { _id: notificationId, user: userId },
            { $set: { isRead: true, readAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            throw new Error("Forbidden or notification not found");
        }

        return { success: true };
    }

    async delete(notificationId: Types.ObjectId, userId: Types.ObjectId) {

        const result = await NotificationModel.deleteOne({
            _id: notificationId,
            user: userId
        });

        if (result.deletedCount === 0) {
            throw new Error("Forbidden or notification not found");
        }

        return { success: true };
    }
}

export const notificationService = new NotificationService();