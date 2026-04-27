"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = require("mongoose");
const storySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    media: {
        type: [String],
        required: true
    },
    caption: {
        type: String,
        default: ""
    },
    views: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24
    },
    visibility: {
        type: String,
        enum: ["public", "private", "friends"],
        default: "public"
    }
}, {
    timestamps: true
});
exports.StoryModel = (0, mongoose_1.model)('Story', storySchema) || (0, mongoose_1.model)('Story');
