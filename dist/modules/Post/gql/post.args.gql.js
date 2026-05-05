"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postListArgs = void 0;
const graphql_1 = require("graphql");
exports.postListArgs = {
    limit: { type: graphql_1.GraphQLInt },
    cursor: { type: graphql_1.GraphQLString }
};
