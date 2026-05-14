"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const post_enum_1 = require("../../../common/enums/post.enum");
const postSchema = new mongoose_1.Schema({
    folderId: { type: String, required: true },
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },
    reactions: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            type: { type: String, enum: Object.values(post_enum_1.ReactionTypeEnum) }
        }
    ],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    availability: { type: String, enum: post_enum_1.PostAvailabilityEnum, default: post_enum_1.PostAvailabilityEnum.PUBLIC },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
});
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
    if (!post)
        return;
    await this.model.updateOne({ _id: post._id }, {
        $set: {
            isDeleted: true,
            deletedAt: new Date()
        }
    });
    await this.model.db.model('Comment').deleteMany({
        postId: post._id
    });
    this.setQuery({ _id: null });
});
exports.PostModel = (0, mongoose_1.model)('Post', postSchema) || (0, mongoose_1.model)('Post');
