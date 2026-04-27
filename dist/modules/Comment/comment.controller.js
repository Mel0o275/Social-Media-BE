"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const multer_1 = require("../../common/utils/multer/multer");
const multer_validation_1 = require("../../common/utils/multer/multer.validation");
const validators = __importStar(require("./comment.validation"));
const middleware_1 = require("../../middleware");
const comment_service_1 = require("./comment.service");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// router.get('/', (req: Request, res: Response) => {
//     res.send('Hello from Post Service!');
// })
router.get('/post-comments', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const data = await comment_service_1.commentService.getCommentsByPost(new mongoose_1.Types.ObjectId(req.query.postId), req.user);
    return res.status(200).json({
        message: "Comments retrieved successfully",
        data
    });
});
router.post('/', (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("attachments", 2), (0, middleware_1.validation)(validators.createCommentSchema), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await comment_service_1.commentService.createComment({ ...req.body, files: req.files }, req.user);
    return res.status(201).json({
        message: "Comment created successfully",
        data
    });
});
router.patch('/:commentId', (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("attachments", 2), (0, middleware_1.validation)(validators.createCommentSchema), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    if (!commentId) {
        return res.status(400).json({ message: "Invalid commentId" });
    }
    const data = await comment_service_1.commentService.updateComment(new mongoose_1.Types.ObjectId(commentId), { ...req.body, files: req.files }, req.user);
    return res.status(200).json({
        message: "Comment updated successfully",
        data
    });
});
router.get('/:commentId', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.getCommentById(new mongoose_1.Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Comment retrieved successfully",
        data
    });
});
router.delete('/delete/:commentId', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.deleteComment(new mongoose_1.Types.ObjectId(commentId), req.user);
    return res.status(200).json({
        message: "Comment deleted successfully",
        data
    });
});
router.post('/:commentId/like', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.likeComment(new mongoose_1.Types.ObjectId(commentId), req.user);
    return res.status(200).json({
        message: "Comment liked/unliked successfully",
        data
    });
});
router.get('/:commentId/likes', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.getCommentLikes(new mongoose_1.Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Comment likes retrieved successfully",
        data
    });
});
router.post('/:commentId/reply', (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("attachments", 2), (0, middleware_1.validation)(validators.createCommentSchema), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.replyToComment(new mongoose_1.Types.ObjectId(commentId), { ...req.body, files: req.files }, req.user);
    return res.status(201).json({
        message: "Reply added successfully",
        data
    });
});
router.get('/:commentId/replies', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const data = await comment_service_1.commentService.getRepliesForComment(new mongoose_1.Types.ObjectId(commentId));
    return res.status(200).json({
        message: "Replies retrieved successfully",
        data
    });
});
exports.default = router;
