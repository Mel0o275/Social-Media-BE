"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const user_service_1 = __importDefault(require("./user.service"));
const router = (0, express_1.Router)();
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
exports.default = router;
