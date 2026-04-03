"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        error: err.message,
        cause: err.cause,
        stack: err.stack
    });
};
exports.globalErrorHandler = globalErrorHandler;
