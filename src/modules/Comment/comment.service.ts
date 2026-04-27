import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { UserModel } from "../../DB/model/User/user.model";
import { getFCMs } from "../../common/services/redis.service";
import { S3Service } from "../../common/services/s3.service";
import { FCMService } from "../../common/services/notification.service";
import { CommentModel } from "../../DB/model/Comment/comment.mode";
import { PostModel } from "../../DB/model/Post/post.model";
import { PostAvailabilityEnum } from "../../common/enums/post.enum";

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

export class CommentService {
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



    // 1. Create a comment
    async createComment(
        { content, files, tags, availability, postId }: any,
        user: HydratedDocument<IUser>
    ) {

        const post = await PostModel.findOne({
            _id: postId,
            isDeleted: false
        });

        if (!post) {
            throw new Error("Post not found");
        }

        if (Number(post.availability) === PostAvailabilityEnum.PRIVATE) {
            const isOwner =
                post.createdBy.toString() === user._id.toString();

            if (!isOwner) {
                throw new Error("You cannot comment on a private post");
            }
        }

        const { mention, FCM_Tokens } = await this.checkTags(tags || []);

        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files as Express.Multer.File[],
                path: `comments/${user._id}`
            });
        }

        const comment = await CommentModel.create({
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
    async getCommentById(commentId: Types.ObjectId) {

        const comment = await CommentModel.findOne({
            _id: commentId
        }).populate("createdBy", "firstName lastName profilePicture");

        if (!comment) {
            throw new Error("Comment not found");
        }

        return comment;
    }

    // 3. Update a comment by ID
    async updateComment(
        commentId: Types.ObjectId,
        { content, files, tags, availability }: any,
        user: HydratedDocument<IUser>
    ) {

        const comment = await CommentModel.findOne({
            _id: commentId,
            createdBy: user._id,
        });

        if (!comment) {
            throw new Error("Comment not found or unauthorized");
        }

        const { mention } = await this.checkTags(tags || []);

        if (content !== undefined) comment.content = content;
        if (availability !== undefined) comment.availability = availability;
        if (tags) comment.tags = mention;

        // attachments append
        if (files?.length) {
            const newFiles = await this.s3.uuploadFiles({
                files: files as Express.Multer.File[],
                path: `comments/${comment._id}`
            });

            comment.attachments = [...(comment.attachments || []), ...newFiles];
        }

        await comment.save();

        return comment;
    }

    // 4. Delete a comment by ID
    async deleteComment(commentId: Types.ObjectId, user: HydratedDocument<IUser>) {

        const comment = await CommentModel.findOneAndDelete({
            _id: commentId,
            createdBy: user._id
        });

        if (!comment) {
            throw new Error("Comment not found or unauthorized");
        }

        return comment;
    }

    // 5. Get all comments for a post
    async getCommentsByPost(postId: Types.ObjectId) {
        const comments = await CommentModel.find({
            postId
        }).populate("createdBy", "firstName lastName profilePicture");

        return comments;
    }

    // 6. Like/Unlike a comment
    async likePost(commentId: Types.ObjectId, user: HydratedDocument<IUser>) {

        const userId = new Types.ObjectId(user._id);
        const comment = await CommentModel.findOne({
            _id: commentId,
        });

        if (!comment) {
            throw new Error("Comment not found");
        }
        const isLiked = comment.likes?.some(like => {
            const likeId = "_id" in like ? like._id : like;
            return new Types.ObjectId(likeId).equals(userId);
        });

        await CommentModel.updateOne(
            { _id: commentId },
            isLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId } }
        );
        return { liked: !isLiked };
    }

    // 7. Get all likes for a comment
    async getCommentLikes(commentId: Types.ObjectId) {
        const comment = await CommentModel.findOne({
            _id: commentId,
        });
        if (!comment) {
            throw new Error("Comment not found");
        }
        return comment.likes || [];
    }

    // 8. Reply to a comment
    async replyToComment(
        commentId: Types.ObjectId,
        { content, files, tags, availability }: any,
        user: HydratedDocument<IUser>
    ) {

        const parent = await CommentModel.findOne({
            _id: commentId,
        });

        if (!parent) {
            throw new Error("Parent comment not found");
        }

        const { mention, FCM_Tokens } = await this.checkTags(tags || []);

        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3.uuploadFiles({
                files: files as Express.Multer.File[],
                path: `comments/${commentId}`
            });
        }

        const reply = await CommentModel.create({
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
    async getRepliesForComment(commentId: Types.ObjectId) {
        const replies = await CommentModel.find({
            parentComment: commentId
        }).populate("createdBy", "firstName lastName profilePicture");

        return replies;

    }
}
export const commentService = new CommentService();