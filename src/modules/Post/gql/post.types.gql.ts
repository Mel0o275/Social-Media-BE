import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from "graphql";

import { PostAvailabilityEnum, ReactionTypeEnum } from "../../../common/enums/post.enum";
import { OneUserType } from "../../User/gql/user.types.gql";

/* ENUMS */
export const ReactionGQLEnumType = new GraphQLEnumType({
    name: "ReactionGQLEnumType",
    values: {
        ANGRY: { value: ReactionTypeEnum.ANGRY },
        HAHA: { value: ReactionTypeEnum.HAHA },
        LIKE: { value: ReactionTypeEnum.LIKE },
        LOVE: { value: ReactionTypeEnum.LOVE },
        SAD: { value: ReactionTypeEnum.SAD },
        WOW: { value: ReactionTypeEnum.WOW }
    }
});

export const AvailabilityGQLEnumType = new GraphQLEnumType({
    name: "AvailabilityGQLEnumType",
    values: {
        PUBLIC: { value: PostAvailabilityEnum.PUBLIC },
        PRIVATE: { value: PostAvailabilityEnum.PRIVATE },
        FRIENDS_ONLY: { value: PostAvailabilityEnum.FRIENDS_ONLY }
    }
});

/* POST */
export const OnePostType = new GraphQLObjectType({
    name: "OnePostType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },

        folderId: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },

        reactions: {
            type: new GraphQLList(
                new GraphQLObjectType({
                    name: "PostReactionType",
                    fields: {
                        user: { type: GraphQLID },
                        type: { type: ReactionGQLEnumType }
                    }
                })
            )
        },

        createdBy: { type: new GraphQLNonNull(OneUserType) },
        updatedBy: { type: OneUserType },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: GraphQLString }
    })
});

/* RESPONSE */
export const PostListResponse = new GraphQLObjectType({
    name: "PostListResponse",
    fields: () => ({
        message: { type: new GraphQLNonNull(GraphQLString) },

        data: {
            type: new GraphQLList(OnePostType)
        },

        nextCursor: {
            type: GraphQLString
        }
    })
});

