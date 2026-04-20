"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const index_1 = require("../../common/Responses/index");
const middleware_1 = require("../../middleware");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
// SIGNUP
router.post('/signup', (0, middleware_1.validation)(auth_validation_1.signUpSchema), async (req, res) => {
    try {
        const result = await auth_service_1.default.signUp(req.body);
        (0, index_1.successResponse)({ res, data: result, message: "Signup successful", statusCode: 201 });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await auth_service_1.default.verifyOtpService(email, otp);
        (0, index_1.successResponse)({ res, data: result, message: "OTP verified successfully", statusCode: 200 });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// LOGIN
router.post('/login', (0, middleware_1.validation)(auth_validation_1.loginSchema), async (req, res) => {
    try {
        const result = await auth_service_1.default.login(req.body);
        (0, index_1.successResponse)({ res, message: "Login successful", statusCode: 200, data: result });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/signup/gmail", async (req, res) => {
    try {
        const { idToken } = req.body;
        const account = await auth_service_1.default.signUpWithGoogleAccount(idToken);
        return res.status(201).json({
            message: "User registered successfully",
            data: { account },
        });
    }
    catch (error) {
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
        const account = await auth_service_1.default.loginWithGoogle(idToken);
        return res.status(200).json({
            message: "User loggedin successfully",
            data: { account },
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Error logging in",
            // error: error.message,
        });
    }
});
router.post("/forget-pass", async (req, res) => {
    const { email } = req.body;
    try {
        const result = await auth_service_1.default.forgetPassword(email);
        res.status(200).json({ message: "Password reset link sent to email" });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending password reset link", error: error });
    }
});
exports.default = router;
