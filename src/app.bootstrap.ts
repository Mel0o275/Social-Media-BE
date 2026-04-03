import express from 'express';
import { AuthController, UserController } from './modules';
import cors from 'cors';
import { globalErrorHandler } from './middleware';
import { connectDB } from './DB/connection';
import { PORT } from './config/config';
import { connectRedis } from './DB/redis.connection';
export const bootstrap = async() => {
    // DB
    await connectDB();
    await connectRedis();
    const app:express.Express = express();
    // Cors and JSON Middleware
    app.use(cors(), express.json());
    app.get('/', (req:express.Request, res:express.Response) => {
        res.send('Hello World!');
    });

    console.log('Bootstrap function executed');

    // Routing
    app.use('/auth', AuthController);
    app.use('/user', UserController);

    // Global Error Handler
    app.use(globalErrorHandler);
    // Invalid Routing
    app.use("/*dummy", (req:express.Request, res:express.Response) => {
        res.status(404).json({ message: "Route not found" });
    })
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
};