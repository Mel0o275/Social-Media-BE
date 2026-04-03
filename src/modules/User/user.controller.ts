import { Router, type Request, type Response, type Router as RouterType } from "express";
import { authentication } from "../../middleware/auth.middelware";
import AuthSecurityService from "./user.service";
const router: RouterType = Router();

// LOGOUT
interface CustomRequest extends Request {
    user?: any;
    decoded?: { _id: string; jti: string; iat: number };
}

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

export default router;