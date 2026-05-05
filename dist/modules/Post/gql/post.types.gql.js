"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostListResponse = exports.OnePostType = exports.AvailabilityGQLEnumType = exports.ReactionGQLEnumType = void 0;
const graphql_1 = require("graphql");
const post_enum_1 = require("../../../common/enums/post.enum");
const user_types_gql_1 = require("../../User/gql/user.types.gql");
/* ENUMS */
exports.ReactionGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ReactionGQLEnumType",
    values: {
        ANGRY: { value: post_enum_1.ReactionTypeEnum.ANGRY },
        HAHA: { value: post_enum_1.ReactionTypeEnum.HAHA },
        LIKE: { value: post_enum_1.ReactionTypeEnum.LIKE },
        LOVE: { value: post_enum_1.ReactionTypeEnum.LOVE },
        SAD: { value: post_enum_1.ReactionTypeEnum.SAD },
        WOW: { value: post_enum_1.ReactionTypeEnum.WOW }
    }
});
exports.AvailabilityGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "AvailabilityGQLEnumType",
    values: {
        PUBLIC: { value: post_enum_1.PostAvailabilityEnum.PUBLIC },
        PRIVATE: { value: post_enum_1.PostAvailabilityEnum.PRIVATE },
        FRIENDS_ONLY: { value: post_enum_1.PostAvailabilityEnum.FRIENDS_ONLY }
    }
});
/* POST */
exports.OnePostType = new graphql_1.GraphQLObjectType({
    name: "OnePostType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        folderId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        reactions: {
            type: new graphql_1.GraphQLList(new graphql_1.GraphQLObjectType({
                name: "PostReactionType",
                fields: {
                    user: { type: graphql_1.GraphQLID },
                    type: { type: exports.ReactionGQLEnumType }
                }
            }))
        },
        createdBy: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserType) },
        updatedBy: { type: user_types_gql_1.OneUserType },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        updatedAt: { type: graphql_1.GraphQLString }
    })
});
/* RESPONSE */
exports.PostListResponse = new graphql_1.GraphQLObjectType({
    name: "PostListResponse",
    fields: () => ({
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLList(exports.OnePostType)
        },
        nextCursor: {
            type: graphql_1.GraphQLString
        }
    })
});
