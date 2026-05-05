"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLvalidation = exports.validation = void 0;
const Application_exception_1 = require("../common/Exceptions/Application.exception");
const graphql_1 = require("graphql");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.file = req.file;
            }
            if (req.files) {
                req.body.files = req.files;
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error;
                validationErrors.push({
                    key,
                    issues: error.issues.map(issue => {
                        return {
                            message: issue.message,
                            path: issue.path
                        };
                    })
                });
            }
        }
        if (validationErrors.length > 0) {
            throw new Application_exception_1.BadRequestException("Validation failed", validationErrors);
        }
        next();
    };
};
exports.validation = validation;
const GQLvalidation = async (schema, args) => {
    const validationResult = schema.safeParse(args);
    if (!validationResult.success) {
        throw new graphql_1.GraphQLError("Validation Error", {
            extensions: {
                statusCode: 400,
                issues: validationResult.error.issues.map(issue => { return { path: issue.path, message: issue.message }; })
            }
        });
    }
};
exports.GQLvalidation = GQLvalidation;
