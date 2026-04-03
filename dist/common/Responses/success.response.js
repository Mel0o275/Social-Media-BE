"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, data, message = "Success", statusCode = 200 }) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.successResponse = successResponse;
