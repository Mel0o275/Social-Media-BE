import { Server } from "socket.io"
import { ChatEvent, chatEvents } from "./chat.event"

export class ChatGateway {
    private chatEvent:ChatEvent
    constructor() {
        this.chatEvent = new ChatEvent()
    }

    registerEvents = (socket: Server, io: Server) => {
        this.chatEvent.sayHi(socket)
        this.chatEvent.sendMessage(socket, io)
        this.chatEvent.reactMessage(socket, io);
    }
}

export const chatGateway = new ChatGateway()