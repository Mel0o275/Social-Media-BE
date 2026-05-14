import { Server } from "socket.io";
import { ChatService } from "./chat.service";
import { Socketvalidation } from "../../middleware";
import * as validators from "./chat.validation"
import { getSockets } from "../../common/services/redis.service";
export class ChatEvent {
    private chatService: ChatService

    constructor() {
        this.chatService = new ChatService()
    }

    sayHi = async (socket: Server) => {

        socket.on("sayHi", async(data:{name:string}, callback) => {

            try {
                await Socketvalidation<{name: string}>(validators.sayHi, data)
                console.log(data);
                const result = this.chatService.sayHi()
                console.log({RESULT: result});
                
                console.log(socket.data);

                if (callback) {
                    callback("BE TO FE");
                }

                socket.emit("sayHi", "LOL LOL");

            } catch (error) {

                console.log(error);

                socket.emit("custom_error", error.message);

            }

        });

    }

    sendMessage = async(socket, io) => {
        return socket.on("sendMessage", async({content, sendTo}) => {
            try {
                console.log({content, sendTo});
                await this.chatService.sendMessage({content, sendTo}, socket.data.user)
                io.to(await getSockets(socket.data.user._id)).emit("successMessage", {content, sendTo})
                const reciverIds = await getSockets(sendTo)
                if(reciverIds.length) {
                socket.to(reciverIds).emit("newMessage", {content, from: socket.data.user})
                
                }
                
            } catch (error) {
                console.log(error);
                socket.emit("custom_error", error)
                
            }
        })
    }

}


}

export const chatEvents = new ChatEvent();