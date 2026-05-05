import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from "graphql";

import { GenderEnum, provider, RoleEnum } from "../../../common/enums/user.enum";

export const GenderGQLEnumType = new GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: GenderEnum.MALE },
        Female: { value: GenderEnum.FEMALE }
    }
});

export const ProviderGQLEnumType = new GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Local: { value: provider.LOCAL },
        Google: { value: provider.GOOGLE }
    }
});

export const RoleGQLEnumType = new GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        User: { value: RoleEnum.USER },
        Admin: { value: RoleEnum.ADMIN }
    }
});

export const OneUserType = new GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },

        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },

        password: { type: GraphQLString },
        bio: { type: GraphQLString },
        phone: { type: GraphQLString },
        profileImage: { type: GraphQLString },

        coverImages: { type: new GraphQLList(GraphQLString) },
        DOB: { type: GraphQLString },
        confirmedAt: { type: GraphQLString },

        gender: { type: GenderGQLEnumType },
        role: { type: RoleGQLEnumType },
        provider: { type: ProviderGQLEnumType },

        changeCredentialsTime: { type: GraphQLString },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: GraphQLString }
    })
});

export const profile = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "ProfileResponse",
        fields: () => ({
            message: { type: new GraphQLNonNull(GraphQLString) },

            data: {
                type: OneUserType
            }
        })
    })
);