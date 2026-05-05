import { GraphQLError } from "graphql"

export const GqlError = (error:any) => {
    throw new GraphQLError(error.message || "error");
}