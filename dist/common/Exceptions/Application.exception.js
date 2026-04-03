"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.NotFoundException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode, cause) {
        super(message, { cause });
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class NotFoundException extends ApplicationException {
    constructor(message = "Not Found", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends ApplicationException {
    constructor(message = "Bad Request", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
