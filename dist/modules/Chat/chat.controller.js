"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const chat_service_1 = require("./chat.service");
const multer_1 = require("../../common/utils/multer/multer");
const multer_validation_1 = require("../../common/utils/multer/multer.validation");
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/", (0, auth_middelware_1.authentication)(), async (req, res, next) => {
    const data = await chat_service_1.chatService.getChat(req.params.userId, req.user);
    return res.status(200).json({
        message: "Chat reactions retrieved successfully",
        data
    });
});
router.post("/send", (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image,
}).array("attachments", 2), async (req, res) => {
    const data = await chat_service_1.chatService.sendMessage({
        content: req.body.content,
        sendTo: req.params.userId,
        attachments: req.files
    }, req.user);
    return res.json({
        message: "sent",
        data
    });
});
router.post("/:chatId/message/:messageId/react", (0, auth_middelware_1.authentication)(), async (req, res) => {
    const data = await chat_service_1.chatService.reactMessage({
        chatId: req.params.chatId,
        messageId: req.params.messageId,
        type: req.body.type,
    }, req.user);
    return res.json({
        message: "Reaction updated",
        data,
    });
});
exports.default = router;
