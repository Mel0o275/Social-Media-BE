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
const validators = __importStar(require("./post.validation"));
const middleware_1 = require("../../middleware");
const post_service_1 = require("./post.service");
const mongoose_1 = require("mongoose");
const post_enum_1 = require("../../common/enums/post.enum");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('Hello from Post Service!');
});
router.get('/feed', (0, auth_middelware_1.authentication)(), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await post_service_1.postService.getFeedPosts(req.user._id);
    return res.status(200).json({
        message: "Feed posts retrieved successfully",
        data
    });
});
router.get('/user/:userId', async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const data = await post_service_1.postService.getPostsByUser(new mongoose_1.Types.ObjectId(userId));
    return res.status(200).json({
        message: "Posts retrieved successfully",
        data
    });
});
router.post('/', (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("attachments", 2), (0, middleware_1.validation)(validators.createPostSchema), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await post_service_1.postService.createPost({ ...req.body, files: req.files }, req.user);
    return res.status(201).json({
        message: "Post created successfully",
        data
    });
});
router.patch('/:postId', (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("attachments", 2), (0, middleware_1.validation)(validators.createPostSchema), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    if (!postId) {
        return res.status(400).json({ message: "Invalid postId" });
    }
    const data = await post_service_1.postService.updatePost(new mongoose_1.Types.ObjectId(postId), { ...req.body, files: req.files }, req.user);
    return res.status(200).json({
        message: "Post updated successfully",
        data
    });
});
router.get('/:postId', async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const data = await post_service_1.postService.getPostById(new mongoose_1.Types.ObjectId(postId));
    return res.status(200).json({
        message: "Post retrieved successfully",
        data
    });
});
router.delete('/delete/:postId', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const data = await post_service_1.postService.deletePost(new mongoose_1.Types.ObjectId(postId), req.user);
    return res.status(200).json({
        message: "Post deleted successfully",
        data
    });
});
router.post('/:postId/like', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const reaction = req.body.type || post_enum_1.ReactionTypeEnum.LIKE;
    const data = await post_service_1.postService.reactToPost(new mongoose_1.Types.ObjectId(postId), req.user, reaction);
    return res.status(200).json({
        message: "Post liked/unliked successfully",
        data
    });
});
router.get('/:postId/likes', async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const data = await post_service_1.postService.getPostReactions(new mongoose_1.Types.ObjectId(postId));
    return res.status(200).json({
        message: "Post reactions retrieved successfully",
        data
    });
});
router.post('/:postId/restore', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const data = await post_service_1.postService.restorePost(new mongoose_1.Types.ObjectId(postId), req.user);
    return res.status(200).json({
        message: "Post restored successfully",
        data
    });
});
exports.default = router;
