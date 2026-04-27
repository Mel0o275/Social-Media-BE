import { model, Schema } from "mongoose";
import { IComment } from "../../../common/interfaces/comment.interface";
import { PostAvailabilityEnum } from "../../../common/enums/post.enum";

const commentSchema = new Schema<IComment>({

    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length
        }
    },
    attachments: { type: [String] },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],

    tags: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],

    availability: { type: String, enum: PostAvailabilityEnum, default: PostAvailabilityEnum.PUBLIC },


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

    if (!doc) return;
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



export const CommentModel = model<IComment>('Comment', commentSchema) || model<IComment>('Comment');

