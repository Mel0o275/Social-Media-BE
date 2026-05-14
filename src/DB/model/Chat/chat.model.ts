import { Schema, Types, model, models } from "mongoose";
import { IChat, IMessage } from "../../../common/interfaces/chat.interface";
import { ReactionTypeEnum } from "../../../common/enums/post.enum";
import { ChatEnum } from "../../../common/enums/chat.enum";

const messageSchema = new Schema<IMessage>({
    attachments: { type: [String] },
    content: {
        type: String, required: function (this) {
            return !this.attachments?.length
        }
    },

    reactions: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            type: { type: String, enum: Object.values(ReactionTypeEnum) }
        }
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'chats',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

const chatSchema = new Schema<IChat>({

    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ChatEnum, default: ChatEnum.ovo },
    group: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm
        }
    },
    groupImage: { type: String },
    roomId: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm
        }
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

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
})

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
export const chatModel = models.Chat || model<IChat>("Chat", chatSchema);