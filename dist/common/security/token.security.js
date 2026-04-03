"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createLoginCredentials = exports.getTokenSignature = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../../config/config.js");
const user_enum_js_1 = require("../enums/user.enum.js");
const crypto_1 = require("crypto");
const user_model_js_1 = require("../../DB/model/User/user.model.js");
const generateToken = (payload, secretKey, options) => {
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.generateToken = generateToken;
const getTokenSignature = async (role) => {
    let signture;
    let refreshsSignture;
    let audience = user_enum_js_1.RoleEnum.USER;
    switch (role) {
        case user_enum_js_1.RoleEnum.ADMIN:
            signture = config_js_1.SYSTEM_TOKEN_SECRET_KEY;
            refreshsSignture = config_js_1.REFRESH_SYSTEM_TOKEN_SECRET_KEY;
            audience = user_enum_js_1.RoleEnum.ADMIN;
            break;
        default:
            signture = config_js_1.USER_TOKEN_SECRET_KEY;
            refreshsSignture = config_js_1.REFRESH_USER_TOKEN_SECRET_KEY;
            audience = user_enum_js_1.RoleEnum.USER;
            break;
    }
    return { signture, refreshsSignture, audience };
};
exports.getTokenSignature = getTokenSignature;
const createLoginCredentials = async (user) => {
    const { signture, refreshsSignture, audience } = await (0, exports.getTokenSignature)(user.role);
    const jwtId = (0, crypto_1.randomUUID)();
    const token = (0, exports.generateToken)({ _id: user._id }, signture, {
        expiresIn: "30m",
        audience: JSON.stringify({ tokenType: user_enum_js_1.TokenTypeEnum.TOKEN, role: audience }),
        jwtid: jwtId
    });
    const refreshToken = (0, exports.generateToken)({ _id: user._id }, refreshsSignture, {
        expiresIn: "1y",
        audience: JSON.stringify({ tokenType: user_enum_js_1.TokenTypeEnum.REFRESH, role: audience }),
        jwtid: jwtId
    });
    return { token, refreshToken };
};
exports.createLoginCredentials = createLoginCredentials;
const verifyToken = async (token, tokenType = user_enum_js_1.TokenTypeEnum.TOKEN) => {
    const decodedRaw = jsonwebtoken_1.default.decode(token);
    if (!decodedRaw || !decodedRaw.aud)
        throw new Error("Invalid token");
    const { tokenType: decodedType, role } = JSON.parse(decodedRaw.aud);
    if (decodedType !== tokenType)
        throw new Error("Invalid token type");
    const { signture, refreshsSignture } = await (0, exports.getTokenSignature)(role);
    const secret = tokenType === user_enum_js_1.TokenTypeEnum.REFRESH ? refreshsSignture : signture;
    const verifiedPayload = jsonwebtoken_1.default.verify(token, secret);
    const user = await user_model_js_1.UserModel.findById(verifiedPayload._id);
    if (!user)
        throw new Error("User not registered");
    if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() > (verifiedPayload.iat || 0) * 1000) {
        throw new Error("Token has been invalidated due to credential change");
    }
    return {
        tokenType,
        audience: role,
        verifiedPayload,
        user,
        decoded: decodedRaw
    };
};
exports.verifyToken = verifyToken;
