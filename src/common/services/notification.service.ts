import admin from "firebase-admin";
import { readFileSync } from "fs";

export class FCMService {
    private client: admin.app.App;

    constructor() {
        if (!admin.apps.length) {
            const serviceAccount = JSON.parse(
                readFileSync('./src/config/social-app-5d8de-firebase-adminsdk-fbsvc-4154a8c702.json', 'utf-8')
            );

            this.client = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            this.client = admin.app();
        }
    }

    async sendNotification({
    token,
    title,
    body
}: any) {
    return this.client.messaging().send({
        token,
        data: {
            title,
            body
        }
    });
}

    async sendNotifications({
        tokens,
        title,
        body
    }: any) {
        return Promise.allSettled(
            tokens.map((t: string) =>
                this.sendNotification({ token: t, title, body })
            )
        );
    }
}

export const fcmService = new FCMService();