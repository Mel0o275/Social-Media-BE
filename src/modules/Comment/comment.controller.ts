import { Router, type Request, type Response, type Router as RouterType } from "express";
import { authentication } from "../../middleware/auth.middelware";
import { cloudFileUpload } from "../../common/utils/multer/multer";
import { fieldValidation } from "../../common/utils/multer/multer.validation";
import * as validators from "./comment.validation";
import { validation } from "../../middleware";
import { commentService } from "./comment.service";
import { Types } from "mongoose";

const router: RouterType = Router();

// router.get('/', (req: Request, res: Response) => {
//     res.send('Hello from Post Service!');
// })

router.get('/post-comments',authentication(), async (req: Request, res: Response) => {
    const data = await commentService.getCommentsByPost(new Types.ObjectId(req.query.postId as string), req.user as any);
    return res.status(200).json({
        message: "Comments retrieved successfully",
        data
    });
});


router.post(
    '/',
    authentication(),
    cloudFileUpload({
        validation: fieldValidation.image
    }).array("attachments", 2),

    validation(validators.createCommentSchema),

    async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await commentService.createComment({ ...req.body, files: req.files }, req.user);
        return res.status(201).json({
            message: "Comment created successfully",
            data
        });
    }
);

router.patch(
    '/:commentId',
    authentication(),
    cloudFileUpload({
        validation: fieldValidation.image
    }).array("attachments", 2),

    validation(validators.createCommentSchema),

    async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
        if (!commentId) {
            return res.status(400).json({ message: "Invalid commentId" });
        }

        const data = await commentService.updateComment(new Types.ObjectId(commentId), { ...req.body, files: req.files }, req.user);
        return res.status(200).json({
            message: "Comment updated successfully",
            data
        });
    }
);

router.get('/:commentId', authentication(), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

    const data = await commentService.getCommentById(new Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Comment retrieved successfully",
        data
    });
});

router.delete('/delete/:commentId', authentication(), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    
    const data = await commentService.deleteComment(new Types.ObjectId(commentId), req.user as any);
    return res.status(200).json({
        message: "Comment deleted successfully",
        data
    });
});

router.post('/:commentId/like', authentication(), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await commentService.likeComment(new Types.ObjectId(commentId), req.user as any);
    return res.status(200).json({
        message: "Comment liked/unliked successfully",
        data
    });
})

router.get('/:commentId/likes',  authentication(), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

    const data = await commentService.getCommentLikes(new Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Comment likes retrieved successfully",
        data
    });
})

router.post('/:commentId/reply', authentication(), cloudFileUpload({
    validation: fieldValidation.image
}).array("attachments", 2), validation(validators.createCommentSchema), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await commentService.replyToComment(new Types.ObjectId(commentId), { ...req.body, files: req.files }, req.user as any);
    return res.status(201).json({
        message: "Reply added successfully",
        data
    });
})

router.get('/:commentId/replies',  authentication(), async (req: Request, res: Response) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

    const data = await commentService.getRepliesForComment(new Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Replies retrieved successfully",
        data
    });
});

export default router;