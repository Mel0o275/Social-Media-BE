"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../DB/model/User/user.model");
const redis_service_1 = require("../../common/services/redis.service");
const s3_service_1 = require("../../common/services/s3.service");
const notification_service_1 = require("../../common/services/notification.service");
const comment_mode_1 = require("../../DB/model/Comment/comment.mode");
const post_model_1 = require("../../DB/model/Post/post.model");
const post_enum_1 = require("../../common/enums/post.enum");
// Required CRUD operations for Comment:
// 1. Create a comment
// 2. Get a comment by ID
// 3. Update a comment by ID
// 4. Delete a comment by ID
// 5. Get all comments for a post
// 6. Like a comment
// 7. Get all likes for a comment
// 8. Reply to a comment
// 9. Get all replies for a comment
class CommentService {
    s3;
    fcmService;
    constructor() {
        this.s3 = new s3_service_1.S3Service();
        this.fcmService = new notification_service_1.FCMService();
    }
    async checkTags(tags) {
        const mention = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await user_model_1.UserModel.find({ _id: { $in: tags } });
            if (mentionedAccounts.length !== tags.length) {
                throw new Error("Some tags do not match any user");
            }
            for (const tag of tags) {
                mention.push(new mongoose_1.Types.ObjectId(tag));
                const tokens = await (0, redis_service_1.getFCMs)(tag);
                if (tokens?.length) {
                    FCM_Tokens.push(...tokens);
                }
            }
        }
        return { mention, FCM_Tokens };
    }
    // 1. Create a comment
    async createComment({ content, files, tags, availability, postId }, user) {
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            isDeleted: false
        });
        if (!post) {
            throw new Error("Post not found");
        }
        if (Number(post.availability) === post_enum_1.PostAvailabilityEnum.PRIVATE) {
            const isOwner = post.createdBy.toString() === user._id.toString();
            if (!isOwner) {
                throw new Error("You cannot comment on a private post");
            }
        }
        const { mention, FCM_Tokens } = await this.checkTags(tags || []);
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files,
                path: `comments/${user._id}`
            });
        }
        const comment = await comment_mode_1.CommentModel.create({
            content,
            attachments,
            tags: mention,
            availability,
            postId,
            createdBy: user._id
        });
        if (FCM_Tokens.length) {
            await this.fcmService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "You were mentioned in a comment",
                    body: JSON.stringify({
                        message: `${user.firstName} mentioned you in a comment`,
                        commentId: comment._id.toString()
                    })
                }
            });
        }
        return comment;
    }
    // 2. Get a comment by ID
    async getCommentById(commentId) {
        const comment = await comment_mode_1.CommentModel.findOne({
            _id: commentId
        }).populate("createdBy", "firstName lastName profilePicture");
        if (!comment) {
            throw new Error("Comment not found");
        }
        return comment;
    }
    // 3. Update a comment by ID
    async updateComment(commentId, { content, files, tags, availability }, user) {
        const comment = await comment_mode_1.CommentModel.findOne({
            _id: commentId,
            createdBy: user._id,
        });
        if (!comment) {
            throw new Error("Comment not found or unauthorized");
        }
        const { mention } = await this.checkTags(tags || []);
        if (content !== undefined)
            comment.content = content;
        if (availability !== undefined)
            comment.availability = availability;
        if (tags)
            comment.tags = mention;
        // attachments append
        if (files?.length) {
            const newFiles = await this.s3.uuploadFiles({
                files: files,
                path: `comments/${comment._id}`
            });
            comment.attachments = [...(comment.attachments || []), ...newFiles];
        }
        await comment.save();
        return comment;
    }
    // 4. Delete a comment by ID
    async deleteComment(commentId, user) {
        const comment = await comment_mode_1.CommentModel.findOneAndDelete({
            _id: commentId,
            createdBy: user._id
        });
        if (!comment) {
            throw new Error("Comment not found or unauthorized");
        }
        return comment;
    }
    // 5. Get all comments for a post
    async getCommentsByPost(postId) {
        const comments = await comment_mode_1.CommentModel.find({
            postId
        }).populate("createdBy", "firstName lastName profilePicture");
        return comments;
    }
    // 6. Like/Unlike a comment
    async likePost(commentId, user) {
        const userId = new mongoose_1.Types.ObjectId(user._id);
        const comment = await comment_mode_1.CommentModel.findOne({
            _id: commentId,
        });
        if (!comment) {
            throw new Error("Comment not found");
        }
        const isLiked = comment.likes?.some(like => {
            const likeId = "_id" in like ? like._id : like;
            return new mongoose_1.Types.ObjectId(likeId).equals(userId);
        });
        await comment_mode_1.CommentModel.updateOne({ _id: commentId }, isLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } });
        return { liked: !isLiked };
    }
    // 7. Get all likes for a comment
    async getCommentLikes(commentId) {
        const comment = await comment_mode_1.CommentModel.findOne({
            _id: commentId,
        });
        if (!comment) {
            throw new Error("Comment not found");
        }
        return comment.likes || [];
    }
    // 8. Reply to a comment
    async replyToComment(commentId, { content, files, tags, availability }, user) {
        const parent = await comment_mode_1.CommentModel.findOne({
            _id: commentId,
        });
        if (!parent) {
            throw new Error("Parent comment not found");
        }
        const { mention, FCM_Tokens } = await this.checkTags(tags || []);
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files,
                path: `comments/${commentId}`
            });
        }
        const reply = await comment_mode_1.CommentModel.create({
            postId: parent.postId,
            parentComment: commentId,
            content,
            attachments,
            tags: mention,
            availability,
            createdBy: user._id
        });
        if (FCM_Tokens.length) {
            await this.notificationService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "You were mentioned in a reply",
                    body: JSON.stringify({
                        message: `${user.firstName} replied and mentioned you`,
                        commentId: reply._id.toString()
                    })
                }
            });
        }
        return reply;
    }
    // 9. Get all replies for a comment
    async getRepliesForComment(commentId) {
        const replies = await comment_mode_1.CommentModel.find({
            parentComment: commentId
        }).populate("createdBy", "firstName lastName profilePicture");
        return replies;
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
