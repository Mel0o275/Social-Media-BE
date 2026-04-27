import { Router, type Request, type Response, type Router as RouterType } from "express";
import { authentication } from "../../middleware/auth.middelware";
import { cloudFileUpload } from "../../common/utils/multer/multer";
import { fieldValidation } from "../../common/utils/multer/multer.validation";
import * as validators from "./post.validation";
import { validation } from "../../middleware";
import { postService } from "./post.service";
import { Types } from "mongoose";
import { ReactionTypeEnum } from "../../common/enums/post.enum";

const router: RouterType = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello from Post Service!');
})

router.get('/feed', authentication(), async (req: Request, res: Response) => {

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await postService.getFeedPosts(req.user._id);

    return res.status(200).json({
        message: "Feed posts retrieved successfully",
        data
    });
});

router.get('/user/:userId', authentication(), async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    const data = await postService.getPostsByUser(new Types.ObjectId(userId));
    return res.status(200).json({
        message: "Posts retrieved successfully",
        data
    });
});

router.post(
    '/',
    authentication(),
    cloudFileUpload({
        validation: fieldValidation.image
    }).array("attachments", 2),

    validation(validators.createPostSchema),

    async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const data = await postService.createPost({ ...req.body, files: req.files }, req.user);
        return res.status(201).json({
            message: "Post created successfully",
            data
        });
    }
);

router.patch(
    '/:postId',
    authentication(),
    cloudFileUpload({
        validation: fieldValidation.image
    }).array("attachments", 2),

    validation(validators.createPostSchema),

    async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
        if (!postId) {
            return res.status(400).json({ message: "Invalid postId" });
        }

        const data = await postService.updatePost(new Types.ObjectId(postId), { ...req.body, files: req.files }, req.user);
        return res.status(200).json({
            message: "Post updated successfully",
            data
        });
    }
);

router.get('/:postId', authentication(), async (req: Request, res: Response) => {

    const postId = Array.isArray(req.params.postId)
        ? req.params.postId[0]
        : req.params.postId;

    const data = await postService.getPostById(
        new Types.ObjectId(postId),
        req.user
    );

    return res.status(200).json({
        message: "Post retrieved successfully",
        data
    });
});

router.delete('/delete/:postId', authentication(), async (req: Request, res: Response) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

    const data = await postService.deletePost(new Types.ObjectId(postId), req.user as any);
    return res.status(200).json({
        message: "Post deleted successfully",
        data
    });
});

router.post('/:postId/like', authentication(), async (req: Request, res: Response) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const reaction = req.body.type as ReactionTypeEnum || ReactionTypeEnum.LIKE;
    const data = await postService.reactToPost(new Types.ObjectId(postId), req.user as any, reaction);
    return res.status(200).json({
        message: "Post liked/unliked successfully",
        data
    });
})

router.get('/:postId/likes', authentication(), async (req: Request, res: Response) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

    const data = await postService.getPostReactions(new Types.ObjectId(postId), req.user);
    return res.status(200).json({
        message: "Post reactions retrieved successfully",
        data
    });
})

router.post('/:postId/restore', authentication(), async (req: Request, res: Response) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const data = await postService.restorePost(new Types.ObjectId(postId), req.user as any);
    return res.status(200).json({
        message: "Post restored successfully",
        data
    });
});




export default router;