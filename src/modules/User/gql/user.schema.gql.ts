import { GraphQLString } from "graphql"
import * as UserGQLTypes from './user.types.gql'
import * as UserGQLArgs from './user.args.gql'
import { userResolver, UserResolver } from "./user.resolver"

export class UserGQLSchema {
    private userResolver: UserResolver;
    constructor() { 
        this.userResolver = userResolver;
    }

    registerQuery() {
        return {
            profile: {
                type: UserGQLTypes.profile,
                args: UserGQLArgs.profile,
                resolve: this.userResolver.profile
            }
        }
    }


    registerMutation() {
        return {
            welcome: {
                type: GraphQLString,
                resolve: () => {
                    return `Hello M1`
                }
            }
        }
    }
}

export const userGQLSchema = new UserGQLSchema()