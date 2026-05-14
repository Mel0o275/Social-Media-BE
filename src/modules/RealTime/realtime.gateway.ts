import { Server } from "socket.io";
import { addSocket} from "../../common/services/redis.service";
import { verifyToken } from "../../common/security/token.security";
import {Server as HttpServerType} from "node:http"
import { chatGateway } from "../Chat/chat.gateway";
export class RealtimeGateway {
    private io!: Server
    constructor() {}

    authentication = async (socket, next: any) => {
        try {
            const { user, decoded } = await verifyToken(socket.handshake.auth.authorization)
            // console.log(user._id, socket.id);
            socket.data = {user, decoded }
            await addSocket(user._id, socket.id)
            next()
        } catch (error) {
            next(error)

        }
    }

    
    initializeIo = (httpServer: HttpServerType) => {
        this.io = new Server(httpServer, {
        cors: { origin: "*" }
    })
    this.io.use(this.authentication)
    this.io.on("connection", async (socket) => {

    console.log("CONNECTED:", socket.id);

    chatGateway.registerEvents(socket, this.io)

});
    }
}

export const realTimeGateway = new RealtimeGateway()