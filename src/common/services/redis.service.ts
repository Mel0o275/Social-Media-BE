import { Types } from "mongoose";
import { redisClient } from "../../DB/redis.connection";

export const revokeTokenKey = (userId: string | number, jti: string): string => {
    return `revoked_tokens:${revokeTokenBaseKey(userId)}:${jti}`;
}

export const revokeTokenBaseKey = (userId: string | number): string => {
    return `revoked_tokens:${userId.toString()}`;
}

export const set = async (key: string, value: string, expireTime?: number): Promise<void> => {
    try {
        await redisClient.set(key, value, expireTime ? { EX: expireTime } : undefined);
    } catch (error) {
        console.error("Error setting value in Redis:", error);
        throw error;
    }
}

export const get = async (key: string): Promise<string | null> => {
    try {
        return await redisClient.get(key);
    } catch (error) {
        console.error("Error getting value from Redis:", error);
        throw error;
    }
}

export const update = async (key: string, value: string, expireTime?: number): Promise<void> => {
    try {
        await redisClient.set(key, value, expireTime ? { EX: expireTime } : undefined);
    } catch (error) {
        console.error("Error updating value in Redis:", error);
        throw error;
    }
}

export const deleteKey = async (key: string | string[]): Promise<number> => {
    try {
        if (!key || (Array.isArray(key) && key.length === 0)) return 0;
        return await redisClient.del(key);
    } catch (error) {
        console.error("Error deleting key from Redis:", error);
        throw error;
    }
};

export const ttl = async (key: string): Promise<number> => {
    try {
        return await redisClient.ttl(key);
    } catch (error) {
        console.error("Error getting TTL from Redis:", error);
        throw error;
    }
}

export const keyByPrefix = async (prefix: string): Promise<string[]> => {
    try {
        return await redisClient.keys(`${prefix}*`);
    } catch (error) {
        console.error("Error getting keys by prefix from Redis:", error);
        throw error;
    }
}

export const mGet = async (keys: string[] = []): Promise<(string | null)[]> => {
    try {
        if (keys.length === 0) return [];
        return await redisClient.mGet(keys);
    } catch (error) {
        console.error("Error getting multiple values from Redis:", error);
        throw error;
    }
}

function key(userId: Types.ObjectId | string) {
    return `user:FCM:${userId}`;
}
export async function addFCM(userId: Types.ObjectId | string, FCMToken: string) {
    return await redisClient.sAdd(key(userId), FCMToken);
}

export async function removeFCM(userId: Types.ObjectId | string, FCMToken: string) {
    return await redisClient.sRem(key(userId), FCMToken);
}

export async function getFCMs(userId: Types.ObjectId | string) {
    return await redisClient.sMembers(key(userId));
}

export async function hasFCMs(userId: Types.ObjectId | string) {
    return await redisClient.sCard(key(userId));
}

export async function removeFCMUser(userId: Types.ObjectId | string) {
    return await redisClient.del(key(userId));
}

function socketkey(userId: Types.ObjectId | string) {
    return `user:sockets:${userId}`;
}
export async function addSocket(userId: Types.ObjectId | string, socketId:string) {
    return await redisClient.sAdd(socketkey(userId), socketId);
}

export async function removeSocket(userId: Types.ObjectId | string, socketId:string) {
    return await redisClient.sRem(socketkey(userId), socketId);
}

export async function getSockets(userId: Types.ObjectId | string) {
    return await redisClient.sMembers(socketkey(userId));
}

export async function hasSockets(userId: Types.ObjectId | string) {
    return await redisClient.sCard(socketkey(userId));
}

export async function removeUser(userId: Types.ObjectId | string) {
    return await redisClient.del(socketkey(userId));
}
