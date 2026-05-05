import { HydratedDocument, Types } from "mongoose";
import { createPostDTO } from "./post.dto";
import { IUser } from "../../common/interfaces/user.interface";
import { UserModel } from "../../DB/model/User/user.model";
import { getFCMs } from "../../common/services/redis.service";
import { randomUUID } from "node:crypto";
import { S3Service } from "../../common/services/s3.service";
import { PostModel } from "../../DB/model/Post/post.model";
import { FCMService } from "../../common/services/notification.service";
import { CommentModel } from "../../DB/model/Comment/comment.mode";
import { PostAvailabilityEnum, ReactionTypeEnum } from "../../common/enums/post.enum";

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

export class PostService {
    private readonly s3: S3Service
    private readonly fcmService: FCMService
    constructor() {
        this.s3 = new S3Service();
        this.fcmService = new FCMService();
    }

    public async checkTags(tags: string[]) {
        const mention: Types.ObjectId[] = [];
        const FCM_Tokens: string[] = [];

        if (tags?.length) {
            const mentionedAccounts = await UserModel.find({ _id: { $in: tags } });

            if (mentionedAccounts.length !== tags.length) {
                throw new Error("Some tags do not match any user");
            }

            for (const tag of tags) {
                mention.push(new Types.ObjectId(tag));

                const tokens = await getFCMs(tag);
                if (tokens?.length) {
                    FCM_Tokens.push(...tokens);
                }
            }
        }

        return { mention, FCM_Tokens };
    }

    public canAccessContent(content: any, user?: any, isFriend = false) {

        const isOwner = content.createdBy.equals(user._id);

        if (content.visibility === PostAvailabilityEnum.PUBLIC) {
            return true;
        }

        if (isOwner) {
            return true;
        }

        if (content.visibility === PostAvailabilityEnum.FRIENDS_ONLY && isFriend) {
            return true;
        }

        return false;
    }

    // 1. Create a post
    async createPost({ availability, content, files, tags }: createPostDTO, user: HydratedDocument<IUser>) {

        const { mention, FCM_Tokens } = await this.checkTags(tags || []);

        const folderId = randomUUID();

        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files as Express.Multer.File[],
                path: `posts/${folderId}`
            });
        }

        const post = await PostModel.create({
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
                        postId: (post as any)._id.toString()
                    })
                }
            });
        }

        return post;
    }

    // 2. Get a post by ID
    async getPostById(postId: Types.ObjectId, user: IUser, isFriend = false) {

        const post = await PostModel.findOne({
            _id: postId,
            isDeleted: false
        });

        if (!post) throw new Error("Post not found");

        const allowed = this.canAccessContent(post, user, isFriend);

        if (!allowed) {
            throw new Error("Forbidden");
        }

        return post;
    }

    // 3. Update a post by ID
    async updatePost(postId: Types.ObjectId, { availability, content, files, tags }: createPostDTO, user: HydratedDocument<IUser>) {

        const post = await PostModel.findOne({
            _id: postId,
            createdBy: user._id
        });

        if (!post) {
            throw new Error("Post not found or unauthorized");
        }

        const { mention, FCM_Tokens } = await this.checkTags(tags || []);

        let newAttachments: string[] = [];

        if (files?.length) {
            newAttachments = await this.s3.uuploadFiles({
                files: files as Express.Multer.File[],
                path: `posts/${post.folderId}`
            });
        }

        const updatedAttachments = [
            ...(post.attachments ?? []),
            ...newAttachments
        ];

        if (content !== undefined) post.content = content;
        if (availability !== undefined) post.availability = availability;
        if (mention.length) post.tags = mention;
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
    async deletePost(postId: Types.ObjectId, user: HydratedDocument<IUser>) {
        console.log("postId:", postId);
        console.log("userId:", user._id);
        const post = await PostModel.findOne({
            _id: postId,
            createdBy: user._id
        });

        if (!post) {
            throw new Error("Post not found or unauthorized");
        } else {
            if (post.attachments?.length) {
                await this.s3.deleteFiles({
                    Keys: post.attachments.map(ele => ({ Key: ele }))
                });
            }

            // Soft Delete
            await PostModel.findOneAndUpdate(
                { _id: postId, createdBy: user._id },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date()
                    }
                },
            );

            await CommentModel.deleteMany({
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
    async getPostsByUser(userId: Types.ObjectId, includeDeleted = false) {

        const posts = await PostModel.find({
            createdBy: userId,
            ...(includeDeleted ? {} : { isDeleted: false })
        }).sort({ createdAt: -1 });

        return posts;
    }

    async getFeedPosts(
        userId: Types.ObjectId | string,
        limit = 10,
        cursor?: string
    ) {
        const query: any = {
            isDeleted: false,
            $or: [
                { availability: PostAvailabilityEnum.PUBLIC },
                { createdBy: new Types.ObjectId(userId) }
            ]
        };

        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }

        const posts = await PostModel.find(query)
            .populate("createdBy")  
            .populate("updatedBy")  
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        let nextCursor = null;

        if (posts.length > limit) {
            const next = posts.pop();
            nextCursor = next?.createdAt.toISOString();
        }

        return {
            posts,
            nextCursor
        };
    }
    // 7. Like/Unlike a post
    async reactToPost(
        postId: Types.ObjectId,
        user: HydratedDocument<IUser>,
        type: ReactionTypeEnum
    ) {

        const userId = new Types.ObjectId(user._id);

        const post = await PostModel.findOne({
            _id: postId,
            isDeleted: false
        });

        if (!post) {
            throw new Error("Post not found");
        }

        const existing = post.reactions?.find((r: any) =>
            r.user.equals(userId)
        );

        if (!existing) {
            await PostModel.updateOne(
                { _id: postId },
                {
                    $push: {
                        reactions: {
                            user: userId,
                            type
                        }
                    }
                }
            );

            return { reaction: type };
        }

        if (existing.type === type) {
            await PostModel.updateOne(
                { _id: postId },
                {
                    $pull: {
                        reactions: { user: userId }
                    }
                }
            );

            return { reaction: null };
        }

        await PostModel.updateOne(
            { _id: postId, "reactions.user": userId },
            {
                $set: {
                    "reactions.$.type": type
                }
            }
        );

        return { reaction: type };
    }

    async getPostReactions(postId: Types.ObjectId, user: IUser, isFriend = false) {

        const post = await PostModel.findOne({
            _id: postId,
            isDeleted: false
        });

        if (!post) {
            throw new Error("Post not found");
        }

        const isOwner = post.createdBy.toString() === user._id.toString();

        const allowed =
            post.availability === PostAvailabilityEnum.PUBLIC ||
            isOwner ||
            (post.availability === PostAvailabilityEnum.FRIENDS_ONLY && isFriend);

        if (!allowed) {
            throw new Error("Forbidden");
        }

        return await PostModel.findOne({
            _id: postId,
            isDeleted: false
        })
            .populate("reactions.user", "firstName lastName profilePicture")
            .select("reactions");
    }

    // 9. Restore a deleted post
    async restorePost(postId: Types.ObjectId, user: HydratedDocument<IUser>) {

        const userId = new Types.ObjectId(user._id);

        const post = await PostModel.findOne({
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
export const postService = new PostService();