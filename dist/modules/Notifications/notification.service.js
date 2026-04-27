"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const post_enum_1 = require("../../common/enums/post.enum");
const notification_service_1 = require("../../common/services/notification.service");
const notification_model_1 = require("../../DB/model/Notification/notification.model");
class NotificationService {
    async createNotification({ title, body, receiver, sender, type = post_enum_1.NotificationType.SYSTEM, tokens = [] }) {
        const notification = await notification_model_1.NotificationModel.create({
            title,
            body,
            user: receiver,
            type
        });
        if (tokens.length) {
            await notification_service_1.fcmService.sendNotifications({
                tokens,
                title,
                body
            });
        }
        return notification;
    }
    async getUserNotifications(userId) {
        return notification_model_1.NotificationModel.find({ user: userId })
            .sort({ createdAt: -1 });
    }
    async markAsRead(notificationId, userId) {
        const result = await notification_model_1.NotificationModel.updateOne({ _id: notificationId, user: userId }, { $set: { isRead: true, readAt: new Date() } });
        if (result.matchedCount === 0) {
            throw new Error("Forbidden or notification not found");
        }
        return { success: true };
    }
    async delete(notificationId, userId) {
        const result = await notification_model_1.NotificationModel.deleteOne({
            _id: notificationId,
            user: userId
        });
        if (result.deletedCount === 0) {
            throw new Error("Forbidden or notification not found");
        }
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
