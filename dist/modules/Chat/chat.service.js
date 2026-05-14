"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const mongoose_1 = require("mongoose");
const chat_model_1 = require("../../DB/model/Chat/chat.model");
const s3_service_1 = require("../../common/services/s3.service");
class ChatService {
    s3;
    constructor() {
        this.s3 = new s3_service_1.S3Service();
    }
    sayHi = () => {
        return "Done";
    };
    getChat = async (participantId, user, page = 1, limit = 2) => {
        const skip = (page - 1) * limit;
        let chat = await chat_model_1.chatModel.findOne({
            participants: {
                $all: [
                    user._id,
                    new mongoose_1.Types.ObjectId(participantId)
                ]
            }
        }).populate("participants");
        if (!chat) {
            throw new Error("NO Chat Found");
        }
        const messages = chat.messages
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
        let attachmentKeys = [];
        if (attachments.length) {
            attachmentKeys = await this.s3.uuploadFiles({
                files: attachments,
                path: `${user._id}/chat`,
            });
        }
        let chat = await chat_model_1.chatModel.findOneAndUpdate({
            participants: {
                $all: [user._id, new mongoose_1.Types.ObjectId(sendTo)]
            }
        }, {
            $push: {
                messages: {
                    content,
                    attachments: attachmentKeys,
                    createdBy: user._id
                }
            }
        }, { new: true });
        if (!chat) {
            chat = await chat_model_1.chatModel.create({
                participants: [user._id, new mongoose_1.Types.ObjectId(sendTo)],
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
        const chat = await chat_model_1.chatModel.findById(chatId);
        if (!chat)
            throw new Error("Chat not found");
        const message = chat.messages.id(messageId);
        if (!message)
            throw new Error("Message not found");
        const existing = message.reactions.find(r => r.user.toString() === user._id.toString());
        if (existing && existing.type === type) {
            message.reactions = message.reactions.filter(r => r.user.toString() !== user._id.toString());
        }
        else if (existing) {
            existing.type = type;
        }
        else {
            message.reactions.push({
                user: user._id,
                type
            });
        }
        await chat.save();
        return message;
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
