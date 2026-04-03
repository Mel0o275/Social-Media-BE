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
const bootstrap = async () => {
    // DB
    await (0, connection_1.connectDB)();
    await (0, redis_connection_1.connectRedis)();
    const app = (0, express_1.default)();
    // Cors and JSON Middleware
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    console.log('Bootstrap function executed');
    // Routing
    app.use('/auth', modules_1.AuthController);
    app.use('/user', modules_1.UserController);
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
