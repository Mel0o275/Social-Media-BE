"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../DB/model/User/user.model");
const redis_service_1 = require("../../common/services/redis.service");
const node_crypto_1 = require("node:crypto");
const s3_service_1 = require("../../common/services/s3.service");
const post_model_1 = require("../../DB/model/Post/post.model");
const notification_service_1 = require("../../common/services/notification.service");
const comment_mode_1 = require("../../DB/model/Comment/comment.mode");
const post_enum_1 = require("../../common/enums/post.enum");
// Required CRUD operations for Post:
// 1. Create a post
// 2. Get a post by ID
// 3. Update a post by ID
// 4. Delete a post by ID
// 5. Get all posts by a user
// 6. Get all posts for a feed
// 7. Like a post
// 8. Get all likes for a post
// 9. Restore a deleted post
class PostService {
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
    canAccessContent(content, user, isFriend = false) {
        const isOwner = content.createdBy.equals(user._id);
        if (content.visibility === post_enum_1.PostAvailabilityEnum.PUBLIC) {
            return true;
        }
        if (isOwner) {
            return true;
        }
        if (content.visibility === post_enum_1.PostAvailabilityEnum.FRIENDS_ONLY && isFriend) {
            return true;
        }
        return false;
    }
    // 1. Create a post
    async createPost({ availability, content, files, tags }, user) {
        const { mention, FCM_Tokens } = await this.checkTags(tags || []);
        const folderId = (0, node_crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files,
                path: `posts/${folderId}`
            });
        }
        const post = await post_model_1.PostModel.create({
            createdBy: user._id,
            content,
            availability,
            attachments,
            folderId,
            tags: mention
        });
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteFiles({
                    Keys: attachments.map(ele => ({ Key: ele }))
                });
            }
            throw new Error("Failed to create post");
        }
        if (FCM_Tokens.length) {
            await this.fcmService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "You were mentioned in a post",
                    body: JSON.stringify({
                        message: `${user.firstName} mentioned you in a post`,
                        postId: post._id.toString()
                    })
                }
            });
        }
        return post;
    }
    // 2. Get a post by ID
    async getPostById(postId, user, isFriend = false) {
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            isDeleted: false
        });
        if (!post)
            throw new Error("Post not found");
        const allowed = this.canAccessContent(post, user, isFriend);
        if (!allowed) {
            throw new Error("Forbidden");
        }
        return post;
    }
    // 3. Update a post by ID
    async updatePost(postId, { availability, content, files, tags }, user) {
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            createdBy: user._id
        });
        if (!post) {
            throw new Error("Post not found or unauthorized");
        }
        const { mention, FCM_Tokens } = await this.checkTags(tags || []);
        let newAttachments = [];
        if (files?.length) {
            newAttachments = await this.s3.uuploadFiles({
                files: files,
                path: `posts/${post.folderId}`
            });
        }
        const updatedAttachments = [
            ...(post.attachments ?? []),
            ...newAttachments
        ];
        if (content !== undefined)
            post.content = content;
        if (availability !== undefined)
            post.availability = availability;
        if (mention.length)
            post.tags = mention;
        post.attachments = updatedAttachments;
        await post.save();
        if (FCM_Tokens.length) {
            await this.fcmService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "You were mentioned in a post",
                    body: JSON.stringify({
                        message: `${user.firstName} mentioned you in a post`,
                        postId: post._id.toString()
                    })
                }
            });
        }
        return post;
    }
    // 4. Delete a post by ID
    async deletePost(postId, user) {
        console.log("postId:", postId);
        console.log("userId:", user._id);
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            createdBy: user._id
        });
        if (!post) {
            throw new Error("Post not found or unauthorized");
        }
        else {
            if (post.attachments?.length) {
                await this.s3.deleteFiles({
                    Keys: post.attachments.map(ele => ({ Key: ele }))
                });
            }
            // Soft Delete
            await post_model_1.PostModel.findOneAndUpdate({ _id: postId, createdBy: user._id }, {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });
            await comment_mode_1.CommentModel.deleteMany({
                postId: postId
            });
            // Hard Delete
            // await PostModel.findOneAndUpdate(
            //     { _id: postId, createdBy: user._id },
            //     // {
            //     //     $set: {
            //     //         isDeleted: true,
            //     //         deletedAt: new Date()
            //     //     }
            //     // },
            // );
        }
        return post;
    }
    // 5. Get all posts by a user
    async getPostsByUser(userId, includeDeleted = false) {
        const posts = await post_model_1.PostModel.find({
            createdBy: userId,
            ...(includeDeleted ? {} : { isDeleted: false })
        }).sort({ createdAt: -1 });
        return posts;
    }
    async getFeedPosts(userId) {
        return await post_model_1.PostModel.find({
            isDeleted: false,
            $or: [
                { availability: post_enum_1.PostAvailabilityEnum.PUBLIC },
                { createdBy: new mongoose_1.Types.ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 });
    }
    // 7. Like/Unlike a post
    async reactToPost(postId, user, type) {
        const userId = new mongoose_1.Types.ObjectId(user._id);
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            isDeleted: false
        });
        if (!post) {
            throw new Error("Post not found");
        }
        const existing = post.reactions?.find((r) => r.user.equals(userId));
        if (!existing) {
            await post_model_1.PostModel.updateOne({ _id: postId }, {
                $push: {
                    reactions: {
                        user: userId,
                        type
                    }
                }
            });
            return { reaction: type };
        }
        if (existing.type === type) {
            await post_model_1.PostModel.updateOne({ _id: postId }, {
                $pull: {
                    reactions: { user: userId }
                }
            });
            return { reaction: null };
        }
        await post_model_1.PostModel.updateOne({ _id: postId, "reactions.user": userId }, {
            $set: {
                "reactions.$.type": type
            }
        });
        return { reaction: type };
    }
    async getPostReactions(postId, user, isFriend = false) {
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            isDeleted: false
        });
        if (!post) {
            throw new Error("Post not found");
        }
        const isOwner = post.createdBy.toString() === user._id.toString();
        const allowed = post.availability === post_enum_1.PostAvailabilityEnum.PUBLIC ||
            isOwner ||
            (post.availability === post_enum_1.PostAvailabilityEnum.FRIENDS_ONLY && isFriend);
        if (!allowed) {
            throw new Error("Forbidden");
        }
        return await post_model_1.PostModel.findOne({
            _id: postId,
            isDeleted: false
        })
            .populate("reactions.user", "firstName lastName profilePicture")
            .select("reactions");
    }
    // 9. Restore a deleted post
    async restorePost(postId, user) {
        const userId = new mongoose_1.Types.ObjectId(user._id);
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            createdBy: userId,
            isDeleted: true
        });
        if (!post) {
            throw new Error("Post not found or unauthorized");
        }
        post.isDeleted = false;
        post.deletedAt = undefined;
        post.restoredAt = new Date();
        await post.save();
        return post;
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
