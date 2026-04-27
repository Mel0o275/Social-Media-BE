"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyService = exports.StoryService = void 0;
const s3_service_1 = require("../../common/services/s3.service");
const story_model_1 = require("../../DB/model/Story/story.model");
const notification_service_1 = require("../../common/services/notification.service");
class StoryService {
    s3;
    fcmService;
    constructor() {
        this.s3 = new s3_service_1.S3Service();
        this.fcmService = new notification_service_1.FCMService();
    }
    async createStory(user, files) {
        if (!files?.length) {
            throw new Error("Story media required");
        }
        const media = await this.s3.uuploadFiles({
            files,
            path: `stories/${user._id}`
        });
        const story = await story_model_1.StoryModel.create({
            user: user._id,
            media
        });
        return story;
    }
    async viewStory(storyId, user) {
        const story = await story_model_1.StoryModel.findById(storyId);
        if (!story) {
            throw new Error("Story not found");
        }
        if (story.visibility === "private" &&
            !story.user.equals(user._id)) {
            throw new Error("You are not allowed to view this story");
        }
        await story_model_1.StoryModel.updateOne({ _id: storyId }, {
            $addToSet: { views: user._id }
        });
    }
    async getStories() {
        const stories = await story_model_1.StoryModel.find({
            visibility: "public"
        })
            .populate("user", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });
        return stories;
    }
}
exports.StoryService = StoryService;
exports.storyService = new StoryService();
