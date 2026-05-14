import { Router } from "express";
import { authentication } from "../../middleware/auth.middelware";
import { chatService } from "./chat.service";
import { cloudFileUpload } from "../../common/utils/multer/multer";
import { fieldValidation } from "../../common/utils/multer/multer.validation";

const router = Router({ mergeParams: true })

router.get("/", authentication(), async (req, res, next) => {
    const data = await chatService.getChat(req.params.userId as string, req.user);
    return res.status(200).json({
        message: "Chat reactions retrieved successfully",
        data
    });
})

router.post(
    "/send",
    authentication(),
    cloudFileUpload({
        validation: fieldValidation.image,
    }).array("attachments", 2), async (req, res) => {

        const data = await chatService.sendMessage(
            {
                content: req.body.content,
                sendTo: req.params.userId,
                attachments: req.files
            },
            req.user
        );

        return res.json({
            message: "sent",
            data
        });
    }
);

router.post(
    "/:chatId/message/:messageId/react",
    authentication(),
    async (req, res) => {
        const data = await chatService.reactMessage(
            {
                chatId: req.params.chatId,
                messageId: req.params.messageId,
                type: req.body.type,
            },
            req.user
        );

        return res.json({
            message: "Reaction updated",
            data,
        });
    }
);

export default router