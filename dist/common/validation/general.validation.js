"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFeilds = void 0;
const zod_1 = __importDefault(require("zod"));
exports.generalValidationFeilds = {
    email: zod_1.default.string({ error: 'Email is required' }).email({ error: 'Invalid email format' }),
    password: zod_1.default.string({ error: 'Password is required' }).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, { error: 'Password must be at least 8 characters long and include at least one uppercase letter, and one number' }),
    username: zod_1.default.string({ error: 'Username is required' }).min(3, { error: 'Username must be at least 3 characters long' }).max(20, { error: 'Username must be at most 20 characters long' }),
    confirmPassword: zod_1.default.string({ error: 'Confirm Password is required' }),
    phone: zod_1.default.string({ error: 'Phone number is required' }).regex(/^\+?[1-9]\d{1,14}$/, { error: 'Invalid phone number format' }),
};
