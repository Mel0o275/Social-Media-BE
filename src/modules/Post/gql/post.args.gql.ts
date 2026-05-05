import { GraphQLString, GraphQLInt } from "graphql";

export const postListArgs = {
    limit: { type: GraphQLInt },
    cursor: { type: GraphQLString }
};