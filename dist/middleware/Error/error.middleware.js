"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.glopalErrorHandler = void 0;
const glopalErrorHandler = (err, req, res, next) => {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
};
exports.glopalErrorHandler = glopalErrorHandler;
