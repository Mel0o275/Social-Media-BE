import {createClient} from 'redis';
import { REDIS_URL } from '../config/config';

export const redisClient = createClient({
    url: REDIS_URL
})

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis successfully");
    } catch (error) {
        console.error("Error connecting to Redis:", error);
    }
}