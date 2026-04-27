"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const notification_service_1 = require("./notification.service");
const user_enum_1 = require("../../common/enums/user.enum");
const router = (0, express_1.Router)();
router.post("/admin", (0, auth_middelware_1.authentication)(), (0, auth_middelware_1.authorization)([user_enum_1.RoleEnum.ADMIN]), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await notification_service_1.notificationService.createNotification({
        ...req.body,
        sender: new mongoose_1.Types.ObjectId(req.user._id)
    });
    res.json({
        message: "Notification created",
        data
    });
});
router.get("/me", (0, auth_middelware_1.authentication)(), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await notification_service_1.notificationService.getUserNotifications(new mongoose_1.Types.ObjectId(req.user._id));
    res.json({ data });
});
router.patch("/:id/read", (0, auth_middelware_1.authentication)(), async (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid notification id" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await notification_service_1.notificationService.markAsRead(new mongoose_1.Types.ObjectId(id), new mongoose_1.Types.ObjectId(req.user._id));
    res.json({ message: "Marked as read" });
});
router.delete("/:id", (0, auth_middelware_1.authentication)(), async (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid notification id" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await notification_service_1.notificationService.delete(new mongoose_1.Types.ObjectId(id), new mongoose_1.Types.ObjectId(req.user._id));
    res.json({ message: "Deleted" });
});
exports.default = router;
