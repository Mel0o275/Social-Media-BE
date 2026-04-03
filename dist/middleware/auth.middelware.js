"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const user_enum_js_1 = require("../common/enums/user.enum.js");
const token_security_js_1 = require("../common/security/token.security.js");
const authentication = (tokenType = user_enum_js_1.TokenTypeEnum.TOKEN) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { user, decoded } = await (0, token_security_js_1.verifyToken)(req.headers.authorization);
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRoles = []) => {
    return async (req, res, next) => {
        console.log(req.user.role);
        if (!accessRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
exports.authorization = authorization;
