"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = void 0;
const mongoose_1 = require("mongoose");
const post_enum_1 = require("../../../common/enums/post.enum");
const chat_enum_1 = require("../../../common/enums/chat.enum");
const messageSchema = new mongoose_1.Schema({
    attachments: { type: [String] },
    content: {
        type: String, required: function () {
            return !this.attachments?.length;
        }
    },
    reactions: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            type: { type: String, enum: Object.values(post_enum_1.ReactionTypeEnum) }
        }
    ],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'chats',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const chatSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: chat_enum_1.ChatEnum, default: chat_enum_1.ChatEnum.ovo },
    group: {
        type: String, required: function () {
            return this.type == chat_enum_1.ChatEnum.ovm;
        }
    },
    groupImage: { type: String },
    roomId: {
        type: String, required: function () {
            return this.type == chat_enum_1.ChatEnum.ovm;
        }
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    messages: { type: [messageSchema], required: true }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'chats',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
// chatSchema.pre(['find', 'findOne'], function () {
//     if (!this.getQuery().includeDeleted) {
//         this.where({ isDeleted: false });
//     }
// });
// chatSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
//     const update = this.getUpdate() as HydratedDocument<IChat>;
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
// chatSchema.pre('findOneAndDelete', async function () {
//     const query = this.getQuery();
//     const chat = await this.model.findOne(query);
//     if (!chat) return;
//     await this.model.updateOne(
//         { _id: chat._id },
//         {
//             $set: {
//                 isDeleted: true,
//                 deletedAt: new Date()
//             }
//         }
//     );
//     await this.model.db.model('Comment').deleteMany({
//         chatId: chat._id
//     });
//     this.setQuery({ _id: null });
// });
exports.chatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", chatSchema);
