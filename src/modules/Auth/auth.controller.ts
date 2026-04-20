import { Router, type Request, type Response, type Router as RouterType } from "express";
import authService from "./auth.service";
import { successResponse } from "../../common/Responses/index";
import { validation } from "../../middleware";
import { loginSchema, signUpSchema } from "./auth.validation";

const router: RouterType = Router();

// SIGNUP
router.post('/signup', validation(signUpSchema), async (req: Request, res: Response) => {
    try {
        const result = await authService.signUp(req.body);
        successResponse({ res, data: result, message: "Signup successful", statusCode: 201 });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {
        const result = await authService.verifyOtpService(email, otp);
        successResponse({ res, data: result, message: "OTP verified successfully", statusCode: 200 });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// LOGIN
router.post('/login', validation(loginSchema),async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        successResponse({ res, message: "Login successful", statusCode: 200, data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/signup/gmail", async (req, res) => {
    try {
        const { idToken } = req.body;
        const account = await authService.signUpWithGoogleAccount(idToken);

        return res.status(201).json({
            message: "User registered successfully",
            data: { account },
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error registering user",
            // error: error.message,
        });
    }
});

router.post("/login/gmail", async (req, res) => {
    try {
        const { idToken } = req.body;
        console.log("typeof idToken:", typeof idToken);
console.log("idToken:", idToken);

        const account = await authService.loginWithGoogle(idToken);

        return res.status(200).json({
            message: "User loggedin successfully",
            data: { account },
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error logging in",
            // error: error.message,
        });
    }
});

router.post("/forget-pass", async (req, res) => {
    const { email } = req.body;
    try {
        const result = await authService.forgetPassword(email);
        res.status(200).json({ message: "Password reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending password reset link", error: error });
    }
});




export default router;