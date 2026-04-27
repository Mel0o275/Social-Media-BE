import { Router, type Request, type Response, type Router as RouterType } from "express";
import { storyService } from "./story.service";
import { authentication } from "../../middleware/auth.middelware";
import { cloudFileUpload } from "../../common/utils/multer/multer";
import { fieldValidation } from "../../common/utils/multer/multer.validation";

const router: RouterType = Router();

router.get("/", authentication(), async (req: Request, res: Response) => {
    const data = await storyService.getStories();
    return res.status(200).json({
        message: "Stories retrieved successfully",
        data
    });
});

router.post("/", authentication(), cloudFileUpload({
    validation: fieldValidation.image
}).array("files", 2), async (req: Request, res: Response) => {
    const story = await storyService.createStory(req.user, req.files as Express.Multer.File[]);
    return res.status(201).json({
        message: "Story created successfully",
        data: story
    });
});

router.post('/:storyId/view', authentication(), async (req: Request, res: Response) => {
    const story = await storyService.viewStory(req.params.storyId, req.user);
    return res.status(200).json({
        message: "Story viewed successfully",
        data: story
    });
});


export default router;