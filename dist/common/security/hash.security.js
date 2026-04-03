"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcryptjs_1 = require("bcryptjs");
const generateHash = async (input, salt = 10) => {
    const hashed = await (0, bcryptjs_1.hash)(input, salt);
    return hashed;
};
exports.generateHash = generateHash;
const compareHash = async (input, hashedValue) => {
    const isMatch = await (0, bcryptjs_1.compare)(input, hashedValue);
    return isMatch;
};
exports.compareHash = compareHash;
