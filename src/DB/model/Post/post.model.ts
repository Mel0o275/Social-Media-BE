import { Schema, model } from "mongoose";
import { IPost } from "../../../common/interfaces/post.interface";
import { PostAvailabilityEnum, ReactionTypeEnum } from "../../../common/enums/post.enum";

const postSchema = new Schema<IPost>({
    folderId: { type: String, required: true },
    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length
        }
    },
    attachments: { type: [String] },

    reactions: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            type: { type: String, enum: Object.values(ReactionTypeEnum) }
        }
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    availability: { type: String, enum: PostAvailabilityEnum, default: PostAvailabilityEnum.PUBLIC },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'Posts',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

// postSchema.pre(['find', 'findOne'], function () {
//     if (!this.getQuery().includeDeleted) {
//         this.where({ isDeleted: false });
//     }
// });


// postSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
//     const update = this.getUpdate() as HydratedDocument<IPost>;
//     if (update.deletedAt) {
//         this.getQuery().paranoId = true
//         this.setUpdate({
//             ...this.getUpdate(),
//             $unset: { restoredAt: 1 },
//         })
//     }
//     if (update.restoredAt) {
//         this.setUpdate({
//             ...this.getUpdate(),
//             paranoId: false,
//             $unset: { $exists: true },
//         })
//     }
//     if (this.getQuery().paranoId == false) {
//         this.setUpdate({
//             ...this.getUpdate(),
//         })
//     }
//     else {
//         this.setUpdate({
//             ...this.getUpdate(),
//             deletedAt: { $exists: false },
//         })
//     }
// })

postSchema.pre('findOneAndDelete', async function () {

    const query = this.getQuery();

    const post = await this.model.findOne(query);
    if (!post) return;

    await this.model.updateOne(
        { _id: post._id },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date()
            }
        }
    );

    await this.model.db.model('Comment').deleteMany({
        postId: post._id
    });

    this.setQuery({ _id: null });
});
export const PostModel = model<IPost>('Post', postSchema) || model<IPost>('Post');
