import {  GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../User/gql/user.schema.gql";
import { postGQLSchema } from "../Post/gql/post.schema.gql";

    const query= new GraphQLObjectType({
        name : "RootSchemaQuery",
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
            ...userGQLSchema.registerQuery(),
            ...postGQLSchema.registerQuery()

        }
    })
console.log(postGQLSchema.registerQuery())
    const mutation= new GraphQLObjectType({
        name: "RootSchemaMutation",
        fields: {
            ...userGQLSchema.registerMutation(),
            ...postGQLSchema.registerMutation()
            
        }
    })

export const schema = new GraphQLSchema({
    query,
    mutation
})