"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.RoleGQLEnumType = exports.ProviderGQLEnumType = exports.GenderGQLEnumType = void 0;
const graphql_1 = require("graphql");
const user_enum_1 = require("../../../common/enums/user.enum");
exports.GenderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderGQLEnimType",
    values: {
        Male: { value: user_enum_1.GenderEnum.MALE },
        Female: { value: user_enum_1.GenderEnum.FEMALE },
    }
});
exports.ProviderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Local: { value: user_enum_1.provider.LOCAL },
        Google: { value: user_enum_1.provider.GOOGLE },
    }
});
exports.RoleGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        User: { value: user_enum_1.RoleEnum.USER },
        Admin: { value: user_enum_1.RoleEnum.ADMIN },
    }
});
exports.profile = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "ProfileResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "OneUserType",
                fields: {
                    _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                    firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    password: { type: graphql_1.GraphQLString },
                    bio: { type: graphql_1.GraphQLString },
                    phone: { type: graphql_1.GraphQLString },
                    profileImage: { type: graphql_1.GraphQLString },
                    coverImages: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
                    DOB: { type: graphql_1.GraphQLString },
                    confirmedAt: { type: graphql_1.GraphQLString },
                    gender: { type: exports.GenderGQLEnumType },
                    role: { type: exports.RoleGQLEnumType },
                    provider: { type: exports.ProviderGQLEnumType },
                    changeCredentialsTime: { type: graphql_1.GraphQLString },
                    createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    updatedAt: { type: graphql_1.GraphQLString },
                }
            })
        }
    }
}));
