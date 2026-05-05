"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const connection_1 = require("./DB/connection");
const config_1 = require("./config/config");
const redis_connection_1 = require("./DB/redis.connection");
const s3_service_1 = require("./common/services/s3.service");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const Comment_1 = require("./modules/Comment");
const Story_1 = require("./modules/Story");
const Notifications_1 = require("./modules/Notifications");
const express_2 = require("graphql-http/lib/use/express");
const schema_gql_1 = require("./modules/graphql/schema.gql");
const token_security_1 = require("./common/security/token.security");
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
const bootstrap = async () => {
    // DB
    await (0, connection_1.connectDB)();
    await (0, redis_connection_1.connectRedis)();
    const app = (0, express_1.default)();
    // Cors and JSON Middleware
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/upload/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await s3_service_1.s3Service.Get({ Key });
        console.log(Body, ContentType);
        res.set("Corss-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body, res.setHeader("Content-Type", ContentType || "application/octet-stream"));
    });
    app.get("/pre-signed/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const params = { Key };
        if (fileName)
            params.fileName = fileName;
        if (download)
            params.download = download;
        const url = await s3_service_1.s3Service.getPresignedUploadLink(params);
        return res.json({ url });
    });
    app.post("/pre-signed/upload", async (req, res) => {
        const { fileName, contentType, path = "general" } = req.body;
        const result = await s3_service_1.s3Service.createPresignedUploadLink({
            OriginalName: fileName,
            ContentType: contentType,
            path
        });
        return res.json(result);
    });
    // app.post('/send-notification', async (req: express.Request, res: express.Response) => {     
    //     console.log(req.body.token);
    //     await notificationService.sendNotification(req.body.token, "Test Notification", "This is a test notification sent from the server.");
    //     res.json({ message: 'Notification sent successfully' });
    // });
    app.all("/graphql", (0, express_2.createHandler)({
        schema: schema_gql_1.schema,
        context: async (ctx) => {
            const req = ctx.raw;
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return { user: null, decoded: null };
            }
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;
            const { user, decoded } = await (0, token_security_1.verifyToken)(token);
            return {
                req,
                user,
                decoded
            };
        }
    }));
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    console.log('Bootstrap function executed');
    // Routing
    app.use('/auth', modules_1.AuthController);
    app.use('/user', modules_1.UserController);
    app.use('/post', modules_1.PostController);
    app.use('/comment', Comment_1.CommentController);
    app.use('/story', Story_1.StoryController);
    app.use('/notifications', Notifications_1.NotificationController);
    // Global Error Handler
    app.use(middleware_1.globalErrorHandler);
    // Invalid Routing
    app.use("/*dummy", (req, res) => {
        res.status(404).json({ message: "Route not found" });
    });
    app.listen(config_1.PORT, () => {
        console.log('Server is running on http://localhost:' + config_1.PORT);
    });
};
exports.bootstrap = bootstrap;
