"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGateway = exports.ChatGateway = void 0;
const chat_event_1 = require("./chat.event");
class ChatGateway {
    chatEvent;
    constructor() {
        this.chatEvent = new chat_event_1.ChatEvent();
    }
    registerEvents = (socket, io) => {
        this.chatEvent.sayHi(socket);
        this.chatEvent.sendMessage(socket, io);
    };
}
exports.ChatGateway = ChatGateway;
exports.chatGateway = new ChatGateway();
