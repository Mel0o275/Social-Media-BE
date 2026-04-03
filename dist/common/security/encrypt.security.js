"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = void 0;
const config_1 = require("../../config/config");
const crypto_1 = __importDefault(require("crypto"));
const IV_LENGTH = 16;
const SECRET = Buffer.from(config_1.ENCRYPTION_KEY, 'utf-8');
const encryptData = async (data) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', SECRET, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};
exports.encryptData = encryptData;
const decryptData = async (encryptedData) => {
    const [ivHex, encryptedText] = encryptedData.split(':');
    if (!ivHex)
        throw new Error("Invalid input: ivHex is undefined");
    if (!encryptedText)
        throw new Error("Invalid input: encryptedText is undefined");
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', SECRET, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
exports.decryptData = decryptData;
