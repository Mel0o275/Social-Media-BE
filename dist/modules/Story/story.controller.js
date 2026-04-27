"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const story_service_1 = require("./story.service");
const auth_middelware_1 = require("../../middleware/auth.middelware");
const multer_1 = require("../../common/utils/multer/multer");
const multer_validation_1 = require("../../common/utils/multer/multer.validation");
const router = (0, express_1.Router)();
router.get("/", (0, auth_middelware_1.authentication)(), async (req, res) => {
    const data = await story_service_1.storyService.getStories();
    return res.status(200).json({
        message: "Stories retrieved successfully",
        data
    });
});
router.post("/", (0, auth_middelware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_validation_1.fieldValidation.image
}).array("files", 2), async (req, res) => {
    const story = await story_service_1.storyService.createStory(req.user, req.files);
    return res.status(201).json({
        message: "Story created successfully",
        data: story
    });
});
router.post('/:storyId/view', (0, auth_middelware_1.authentication)(), async (req, res) => {
    const story = await story_service_1.storyService.viewStory(req.params.storyId, req.user);
    return res.status(200).json({
        message: "Story viewed successfully",
        data: story
    });
});
exports.default = router;
