"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcmService = exports.FCMService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
class FCMService {
    client;
    constructor() {
        if (!firebase_admin_1.default.apps.length) {
            const serviceAccount = JSON.parse((0, fs_1.readFileSync)('./src/config/social-app-5d8de-firebase-adminsdk-fbsvc-4154a8c702.json', 'utf-8'));
            this.client = firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount)
            });
        }
        else {
            this.client = firebase_admin_1.default.app();
        }
    }
    async sendNotification({ token, title, body }) {
        return this.client.messaging().send({
            token,
            data: {
                title,
                body
            }
        });
    }
    async sendNotifications({ tokens, title, body }) {
        return Promise.allSettled(tokens.map((t) => this.sendNotification({ token: t, title, body })));
    }
}
exports.FCMService = FCMService;
exports.fcmService = new FCMService();
