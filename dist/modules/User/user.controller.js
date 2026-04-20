"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const user_service_1 = __importDefault(require("./user.service"));
const multer_1 = require("../../common/utils/multer/multer");
const multer_validation_1 = require("../../common/utils/multer/multer.validation");
const multer_enum_1 = require("../../common/enums/multer.enum");
const router = (0, express_1.Router)();
router.get("/profile", (0, auth_middelware_1.authentication)(), async (req, res) => {
    try {
        const account = await user_service_1.default.profile(req.user);
        res.status(200).json({
            message: "User profile retrieved successfully", data: {
                account
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error });
    }
});
// LOGOUT
router.post("/logout", (0, auth_middelware_1.authentication)(), async (req, res) => {
    try {
        const decoded = req.decoded;
        const result = await user_service_1.default.logout(decoded);
        res.status(result.status).json({
            message: result.message
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
});
router.patch("/updatePassword", (0, auth_middelware_1.authentication)(), async (req, res) => {
    try {
        const user = req.user;
        const result = await user_service_1.default.updatePass(user, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating password", error: error.message });
    }
});
router.patch("/profile-image", (0, auth_middelware_1.authentication)(), 
// cloudFileUpload({
//     validation: fieldValidation.image,
//     storageApproach: storageApproachEnum.Disk
// }).single("profileImage"),
async (req, res) => {
    // const image = await AuthSecurityService.profileImage(req.user, req.file as Express.Multer.File);
    // return res.json(req.file);
    try {
        // const image = await AuthSecurityService.profileImage(req.user, req.file as Express.Multer.File);
        const image = await user_service_1.default.profileImage(req.body, req.user);
        res.status(200).json(image);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile image", error: error });
    }
});
router.patch("/cover-images", (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image,
    storageApproach: multer_enum_1.storageApproachEnum.Disk,
}).array("coverImages", 2), async (req, res) => {
    // const images = await AuthSecurityService.coverImage(req.user, req.files as Express.Multer.File[]);
    // return res.json(req.files);
    try {
        if (!req.files || req.files.length > 2) {
            return res.status(400).json({
                message: "You can upload maximum 2 images only"
            });
        }
        const images = await user_service_1.default.coverImage(req.user, req.files);
        res.status(200).json(images);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating cover images", error: error });
    }
});
exports.default = router;
