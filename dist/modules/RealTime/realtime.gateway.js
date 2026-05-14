"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realTimeGateway = exports.RealtimeGateway = void 0;
const socket_io_1 = require("socket.io");
const redis_service_1 = require("../../common/services/redis.service");
const token_security_1 = require("../../common/security/token.security");
const chat_gateway_1 = require("../Chat/chat.gateway");
class RealtimeGateway {
    io;
    constructor() { }
    authentication = async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_security_1.verifyToken)(socket.handshake.auth.authorization);
            // console.log(user._id, socket.id);
            socket.data = { user, decoded };
            await (0, redis_service_1.addSocket)(user._id, socket.id);
            next();
        }
        catch (error) {
            next(error);
        }
    };
    initializeIo = (httpServer) => {
        this.io = new socket_io_1.Server(httpServer, {
            cors: { origin: "*" }
        });
        this.io.use(this.authentication);
        this.io.on("connection", async (socket) => {
            console.log("CONNECTED:", socket.id);
            chat_gateway_1.chatGateway.registerEvents(socket, this.io);
        });
    };
}
exports.RealtimeGateway = RealtimeGateway;
exports.realTimeGateway = new RealtimeGateway();
