"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvents = exports.ChatEvent = void 0;
const chat_service_1 = require("./chat.service");
const middleware_1 = require("../../middleware");
const validators = __importStar(require("./chat.validation"));
const redis_service_1 = require("../../common/services/redis.service");
class ChatEvent {
    chatService;
    constructor() {
        this.chatService = new chat_service_1.ChatService();
    }
    sayHi = async (socket) => {
        socket.on("sayHi", async (data, callback) => {
            try {
                await (0, middleware_1.Socketvalidation)(validators.sayHi, data);
                console.log(data);
                const result = this.chatService.sayHi();
                console.log({ RESULT: result });
                console.log(socket.data);
                if (callback) {
                    callback("BE TO FE");
                }
                socket.emit("sayHi", "LOL LOL");
            }
            catch (error) {
                console.log(error);
                socket.emit("custom_error", error.message);
            }
        });
    };
    sendMessage = async (socket, io) => {
        return socket.on("sendMessage", async ({ content, sendTo }) => {
            try {
                console.log({ content, sendTo });
                await this.chatService.sendMessage({ content, sendTo }, socket.data.user);
                io.to(await (0, redis_service_1.getSockets)(socket.data.user._id)).emit("successMessage", { content, sendTo });
                const reciverIds = await (0, redis_service_1.getSockets)(sendTo);
                if (reciverIds.length) {
                    socket.to(reciverIds).emit("newMessage", { content, from: socket.data.user });
                }
            }
            catch (error) {
                console.log(error);
                socket.emit("custom_error", error);
            }
        });
    };
    reactMessage = async (socket, io) => {
        socket.on("reactMessage", async (data) => {
            try {
                const message = await this.chatService.reactMessage(data, socket.data.user);
                const reciverIds = await (0, redis_service_1.getSockets)(data.sendTo);
                socket.emit("messageReaction", {
                    messageId: data.messageId,
                    reactions: message.reactions
                });
                if (reciverIds.length) {
                    socket.to(reciverIds).emit("messageReaction", {
                        messageId: data.messageId,
                        reactions: message.reactions
                    });
                }
            }
            catch (error) {
                console.log(error);
                socket.emit("custom_error", error.message);
            }
        });
    };
}
exports.ChatEvent = ChatEvent;
exports.chatEvents = new ChatEvent();
