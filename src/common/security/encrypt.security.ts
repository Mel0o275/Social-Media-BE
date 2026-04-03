import { ENCRYPTION_KEY } from "../../config/config";
import crypto from 'crypto';

const IV_LENGTH = 16;
const SECRET = Buffer.from(ENCRYPTION_KEY, 'utf-8');

export const encryptData = async (data: string): Promise<string> => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptData = async (encryptedData: string): Promise<string> => {
    const [ivHex, encryptedText] = encryptedData.split(':');
    if (!ivHex) throw new Error("Invalid input: ivHex is undefined");
    if (!encryptedText) throw new Error("Invalid input: encryptedText is undefined");
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};