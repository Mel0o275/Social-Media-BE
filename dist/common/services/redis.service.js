"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mGet = exports.keyByPrefix = exports.ttl = exports.deleteKey = exports.update = exports.get = exports.set = exports.revokeTokenBaseKey = exports.revokeTokenKey = void 0;
exports.addFCM = addFCM;
exports.removeFCM = removeFCM;
exports.getFCMs = getFCMs;
exports.hasFCMs = hasFCMs;
exports.removeFCMUser = removeFCMUser;
exports.addSocket = addSocket;
exports.removeSocket = removeSocket;
exports.getSockets = getSockets;
exports.hasSockets = hasSockets;
exports.removeUser = removeUser;
const redis_connection_1 = require("../../DB/redis.connection");
const revokeTokenKey = (userId, jti) => {
    return `revoked_tokens:${(0, exports.revokeTokenBaseKey)(userId)}:${jti}`;
};
exports.revokeTokenKey = revokeTokenKey;
const revokeTokenBaseKey = (userId) => {
    return `revoked_tokens:${userId.toString()}`;
};
exports.revokeTokenBaseKey = revokeTokenBaseKey;
const set = async (key, value, expireTime) => {
    try {
        await redis_connection_1.redisClient.set(key, value, expireTime ? { EX: expireTime } : undefined);
    }
    catch (error) {
        console.error("Error setting value in Redis:", error);
        throw error;
    }
};
exports.set = set;
const get = async (key) => {
    try {
        return await redis_connection_1.redisClient.get(key);
    }
    catch (error) {
        console.error("Error getting value from Redis:", error);
        throw error;
    }
};
exports.get = get;
const update = async (key, value, expireTime) => {
    try {
        await redis_connection_1.redisClient.set(key, value, expireTime ? { EX: expireTime } : undefined);
    }
    catch (error) {
        console.error("Error updating value in Redis:", error);
        throw error;
    }
};
exports.update = update;
const deleteKey = async (key) => {
    try {
        if (!key || (Array.isArray(key) && key.length === 0))
            return 0;
        return await redis_connection_1.redisClient.del(key);
    }
    catch (error) {
        console.error("Error deleting key from Redis:", error);
        throw error;
    }
};
exports.deleteKey = deleteKey;
const ttl = async (key) => {
    try {
        return await redis_connection_1.redisClient.ttl(key);
    }
    catch (error) {
        console.error("Error getting TTL from Redis:", error);
        throw error;
    }
};
exports.ttl = ttl;
const keyByPrefix = async (prefix) => {
    try {
        return await redis_connection_1.redisClient.keys(`${prefix}*`);
    }
    catch (error) {
        console.error("Error getting keys by prefix from Redis:", error);
        throw error;
    }
};
exports.keyByPrefix = keyByPrefix;
const mGet = async (keys = []) => {
    try {
        if (keys.length === 0)
            return [];
        return await redis_connection_1.redisClient.mGet(keys);
    }
    catch (error) {
        console.error("Error getting multiple values from Redis:", error);
        throw error;
    }
};
exports.mGet = mGet;
function key(userId) {
    return `user:FCM:${userId}`;
}
async function addFCM(userId, FCMToken) {
    return await redis_connection_1.redisClient.sAdd(key(userId), FCMToken);
}
async function removeFCM(userId, FCMToken) {
    return await redis_connection_1.redisClient.sRem(key(userId), FCMToken);
}
async function getFCMs(userId) {
    return await redis_connection_1.redisClient.sMembers(key(userId));
}
async function hasFCMs(userId) {
    return await redis_connection_1.redisClient.sCard(key(userId));
}
async function removeFCMUser(userId) {
    return await redis_connection_1.redisClient.del(key(userId));
}
function socketkey(userId) {
    return `user:sockets:${userId}`;
}
async function addSocket(userId, socketId) {
    return await redis_connection_1.redisClient.sAdd(socketkey(userId), socketId);
}
async function removeSocket(userId, socketId) {
    return await redis_connection_1.redisClient.sRem(socketkey(userId), socketId);
}
async function getSockets(userId) {
    return await redis_connection_1.redisClient.sMembers(socketkey(userId));
}
async function hasSockets(userId) {
    return await redis_connection_1.redisClient.sCard(socketkey(userId));
}
async function removeUser(userId) {
    return await redis_connection_1.redisClient.del(socketkey(userId));
}
