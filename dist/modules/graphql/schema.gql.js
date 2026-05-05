"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const user_schema_gql_1 = require("../User/gql/user.schema.gql");
const post_schema_gql_1 = require("../Post/gql/post.schema.gql");
const query = new graphql_1.GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "Optional text",
    fields: {
        // welcome : {
        //     type : new GraphQLNonNull(new GraphQLObjectType({
        //         name: "OneUserType",
        //         fields: {
        //             username: {type: GraphQLString},
        //             email: {type: new GraphQLNonNull(GraphQLString)}
        //         }
        //     })),
        //     description: "test welcome",
        //     args: {
        //         name: {type: GraphQLString, description: "searchKey"},
        //     },
        //     resolve: async (parent: unknown, args: any) : Promise<string> => {
        //         const user = users.find(ele => {return ele.username == args.name})
        //         return user
        //     }
        // }
        ...user_schema_gql_1.userGQLSchema.registerQuery(),
        ...post_schema_gql_1.postGQLSchema.registerQuery()
    }
});
console.log(post_schema_gql_1.postGQLSchema.registerQuery());
const mutation = new graphql_1.GraphQLObjectType({
    name: "RootSchemaMutation",
    fields: {
        ...user_schema_gql_1.userGQLSchema.registerMutation(),
        ...post_schema_gql_1.postGQLSchema.registerMutation()
    }
});
exports.schema = new graphql_1.GraphQLSchema({
    query,
    mutation
});
