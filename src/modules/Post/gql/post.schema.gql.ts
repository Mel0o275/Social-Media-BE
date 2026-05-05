import * as PostGQLTypes from "./post.types.gql";
import * as PostGQLArgs from "./post.args.gql";
import { postResolver, PostResolver } from "./post.resolver";
import { PostListResponse } from "./post.types.gql";
import { GraphQLID, GraphQLNonNull } from "graphql";

export class PostGQLSchema {
    private postResolver: PostResolver;

    constructor() {
        this.postResolver = postResolver;
    }

    registerQuery() {
        return {
            postList: {
                type: PostGQLTypes.PostListResponse,
                args: PostGQLArgs.postListArgs,
                resolve: (parent, args, context) =>
                    this.postResolver.postList(parent, args, context)
            }
        };
    }

    registerMutation() {
        return {
            reactOnPost: {
                type: PostGQLTypes.PostListResponse, 
                args: {
                    postId: { type: new GraphQLNonNull(GraphQLID) },
                    react: { type: PostGQLTypes.ReactionGQLEnumType }
                },
                resolve: (parent, args, context) =>
                    this.postResolver.reactOnPost(parent, args, context)
            }
        };
    }
}

export const postGQLSchema = new PostGQLSchema();