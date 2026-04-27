import { Router } from "express";
import { Types } from "mongoose";
import { authentication, authorization } from "../../middleware/auth.middelware";
import { notificationService } from "./notification.service";
import { RoleEnum } from "../../common/enums/user.enum";

const router = Router();

router.post(
    "/admin",
    authentication(),
    authorization([RoleEnum.ADMIN as unknown as string]),
    async (req, res) => {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const data = await notificationService.createNotification({
            ...req.body,
            sender: new Types.ObjectId(req.user._id)
        });

        res.json({
            message: "Notification created",
            data
        });
    }
);

router.get(
    "/me",
    authentication(),
    async (req, res) => {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const data = await notificationService.getUserNotifications(
            new Types.ObjectId(req.user._id)
        );

        res.json({ data });
    }
);

router.patch(
    "/:id/read",
    authentication(),
    async (req, res) => {

        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await notificationService.markAsRead(
            new Types.ObjectId(id),
            new Types.ObjectId(req.user._id)
        );

        res.json({ message: "Marked as read" });
    }
);


router.delete(
    "/:id",
    authentication(),
    async (req, res) => {

        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await notificationService.delete(
            new Types.ObjectId(id),
            new Types.ObjectId(req.user._id)
        );

        res.json({ message: "Deleted" });
    }
);

export default router;