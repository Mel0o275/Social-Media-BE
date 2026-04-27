import express from 'express';
import { AuthController, UserController, PostController } from './modules';
import cors from 'cors';
import { globalErrorHandler } from './middleware';
import { connectDB } from './DB/connection';
import { PORT } from './config/config';
import { connectRedis } from './DB/redis.connection';
import { s3Service } from './common/services/s3.service';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { CommentController } from './modules/Comment';
import { StoryController} from './modules/Story';
import { NotificationController } from './modules/Notifications';

const s3WriteStream = promisify(pipeline);

export const bootstrap = async () => {
    // DB
    await connectDB();
    await connectRedis();
    const app: express.Express = express();
    // Cors and JSON Middleware
    app.use(cors(), express.json());
    app.get("/upload/*path", async (req: express.Request, res: express.Response) => {
        const { download, fileName } = req.query as { download?: string, fileName?: string };
        const { path } = req.params as { path: string[] };
        const Key = path.join("/");
        const { Body, ContentType } = await s3Service.Get({ Key });
        console.log(Body, ContentType);
        res.set("Corss-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body as NodeJS.ReadableStream, res.setHeader("Content-Type", ContentType || "application/octet-stream"));
    })
    

    app.get("/pre-signed/*path", async (req: express.Request, res: express.Response) => {
        const { download, fileName } = req.query as { download?: string, fileName?: string };
        const { path } = req.params as { path: string[] };
        const Key = path.join("/");
        const params: { Key: string; fileName?: string; download?: string } = { Key };
        if (fileName) params.fileName = fileName;
        if (download) params.download = download;
        const url = await s3Service.getPresignedUploadLink(params);
        return res.json({ url })
    })

    app.post("/pre-signed/upload", async (req, res) => {
        const { fileName, contentType, path = "general" } = req.body;
        const result = await s3Service.createPresignedUploadLink({
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

    app.get('/', (req: express.Request, res: express.Response) => {
        res.send('Hello World!');
    });

    console.log('Bootstrap function executed');

    // Routing
    app.use('/auth', AuthController);
    app.use('/user', UserController);
    app.use('/post', PostController);
    app.use('/comment', CommentController);
    app.use('/story', StoryController);
    app.use('/notifications', NotificationController);

    // Global Error Handler
    app.use(globalErrorHandler);
    // Invalid Routing
    app.use("/*dummy", (req: express.Request, res: express.Response) => {
        res.status(404).json({ message: "Route not found" });
    })
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
};