"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const post_enum_1 = require("../../../common/enums/post.enum");
const commentSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    parentComment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
    tags: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
    availability: { type: String, enum: post_enum_1.PostAvailabilityEnum, default: post_enum_1.PostAvailabilityEnum.PUBLIC },
    deletedAt: {
        type: Date,
        default: null
    },
    restoredAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: "Comments",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
commentSchema.pre('findOneAndDelete', async function () {
    const query = this.getQuery();
    const doc = await this.model.findOne(query);
    if (!doc)
        return;
    await this.model.deleteMany({
        parentComment: doc._id
    });
});
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdBy: 1 });
commentSchema.virtual("repliesCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "parentComment",
    count: true
});
exports.CommentModel = (0, mongoose_1.model)('Comment', commentSchema) || (0, mongoose_1.model)('Comment');
