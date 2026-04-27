import { Router, type Request, type Response, type Router as RouterType } from "express";
import { authentication } from "../../middleware/auth.middelware";
import AuthSecurityService from "./user.service";
import { cloudFileUpload } from "../../common/utils/multer/multer";
import { fieldValidation } from "../../common/utils/multer/multer.validation";
import { storageApproachEnum } from "../../common/enums/multer.enum";
const router: RouterType = Router();

interface CustomRequest extends Request {
    user?: any;
    decoded?: { _id: string; jti: string; iat: number };
}

router.get("/profile", authentication(), async (req: CustomRequest, res: Response) => {
    try {
        const account = await AuthSecurityService.profile(req.user);
        res.status(200).json({
            message: "User profile retrieved successfully", data: {
                account
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error });
    }
})

// LOGOUT
router.post("/logout", authentication(), async (req: CustomRequest, res: Response) => {
    try {
        const decoded = req.decoded as { _id: string; jti: string; iat: number };

        const result = await AuthSecurityService.logout(decoded);
        res.status(result.status).json({
            message: result.message
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
});


router.patch("/updatePassword", authentication(), async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user as any;
        const result = await AuthSecurityService.updatePass(user, req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: "Error updating password", error: error.message });
    }
});

router.patch("/profile-image", authentication(),
    // cloudFileUpload({
    //     validation: fieldValidation.image,
    //     storageApproach: storageApproachEnum.Disk
    // }).single("profileImage"),

    async (req: CustomRequest, res: Response) => {
        // const image = await AuthSecurityService.profileImage(req.user, req.file as Express.Multer.File);
        // return res.json(req.file);
        try {
            // const image = await AuthSecurityService.profileImage(req.user, req.file as Express.Multer.File);
            const image = await AuthSecurityService.profileImage(req.body, req.user);
            res.status(200).json(image);
        } catch (error) {
            res.status(500).json({ message: "Error updating profile image", error: error });
        }
    });

router.patch("/cover-images", authentication(), cloudFileUpload({
    validation: fieldValidation.image,
    storageApproach: storageApproachEnum.Disk,
}).array("coverImages", 2), async (req: CustomRequest, res: Response) => {
    // const images = await AuthSecurityService.coverImage(req.user, req.files as Express.Multer.File[]);
    // return res.json(req.files);
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length > 2) {
            return res.status(400).json({
                message: "You can upload maximum 2 images only"
            });
        }
        const images = await AuthSecurityService.coverImage(req.user, req.files as Express.Multer.File[]);
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: "Error updating cover images", error: error });
    }
});

router.delete("/delete-profile", authentication(), async (req: CustomRequest, res: Response) => {
    try {
        const result = await AuthSecurityService.deleteProfile(req.user);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting profile", error: error });
    }
});
export default router;