"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String },
    data: { type: mongoose_1.Schema.Types.Mixed },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true,
    collection: "Notifications"
});
exports.NotificationModel = (0, mongoose_1.model)('notification', notificationSchema) || (0, mongoose_1.model)('notification');
