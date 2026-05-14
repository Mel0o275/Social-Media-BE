import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { chatModel } from "../../DB/model/Chat/chat.model";
import { ChatEnum } from "../../common/enums/chat.enum";
import { S3Service } from "../../common/services/s3.service";

export class ChatService {
    private readonly s3: S3Service

    constructor() {
        this.s3 = new S3Service();

    }

    sayHi = () => {
        return "Done";
    };

    getChat = async (
        participantId: string,
        user: HydratedDocument<IUser>,
        page = 1,
        limit = 2
    ) => {

        const skip = (page - 1) * limit;

        let chat = await chatModel.findOne({
            participants: {
                $all: [
                    user._id,
                    new Types.ObjectId(participantId)
                ]
            }
        }).populate("participants");

        if (!chat) {
            throw new Error("NO Chat Found");
        }

        const messages = chat.messages
            .sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(skip, skip + limit);

        return {
            chatId: chat._id,
            participants: chat.participants,
            messages,
            pagination: {
                page,
                limit,
                total: chat.messages.length,
                hasMore: skip + limit < chat.messages.length
            }
        };
    };

    async sendMessage({ content, sendTo, attachments = [] }, user) {

        let attachmentKeys: string[] = [];

        if (attachments.length) {

            attachmentKeys = await this.s3.uuploadFiles({
                files: attachments,
                path: `${user._id}/chat`,
            });
        }

        let chat = await chatModel.findOneAndUpdate(
            {
                participants: {
                    $all: [user._id, new Types.ObjectId(sendTo)]
                }
            },
            {
                $push: {
                    messages: {
                        content,
                        attachments: attachmentKeys,
                        createdBy: user._id
                    }
                }
            },
            { new: true }
        );

        if (!chat) {
            chat = await chatModel.create({
                participants: [user._id, new Types.ObjectId(sendTo)],
                createdBy: user._id,
                messages: [{
                    content,
                    attachments: attachmentKeys,
                    createdBy: user._id
                }]
            });
        }

        return chat;
    }


    async reactMessage({ chatId, messageId, type }, user) {
        const chat = await chatModel.findById(chatId);
        if (!chat) throw new Error("Chat not found");

        const message = chat.messages.id(messageId);
        if (!message) throw new Error("Message not found");

        const existing = message.reactions.find(
            r => r.user.toString() === user._id.toString()
        );

        if (existing && existing.type === type) {
            message.reactions = message.reactions.filter(
                r => r.user.toString() !== user._id.toString()
            );
        } else if (existing) {
            existing.type = type;
        } else {
            message.reactions.push({
                user: user._id,
                type
            });
        }

        await chat.save();
        return message;
    }
}

export const chatService = new ChatService();