"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_1 = require("../../common/validation/general.validation");
exports.loginSchema = {
    body: zod_1.default.strictObject({
        email: general_validation_1.generalValidationFeilds.email,
        password: general_validation_1.generalValidationFeilds.password,
    })
};
exports.signUpSchema = {
    // params:z.strictObject({
    //     userId: z.string()
    // }),
    body: exports.loginSchema.body.safeExtend({
        username: general_validation_1.generalValidationFeilds.username,
        phone: general_validation_1.generalValidationFeilds.phone,
        confirmPassword: general_validation_1.generalValidationFeilds.confirmPassword,
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords don't match",
                path: ['confirmPassword']
            });
        }
    })
};
