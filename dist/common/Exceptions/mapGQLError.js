"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GqlError = void 0;
const graphql_1 = require("graphql");
const GqlError = (error) => {
    throw new graphql_1.GraphQLError(error.message || "error");
};
exports.GqlError = GqlError;
