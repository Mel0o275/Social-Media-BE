import jwt, { SignOptions } from "jsonwebtoken";
import {
    REFRESH_SYSTEM_TOKEN_SECRET_KEY,
    REFRESH_USER_TOKEN_SECRET_KEY,
    SYSTEM_TOKEN_SECRET_KEY,
    USER_TOKEN_SECRET_KEY
} from "../../config/config.js";
import { RoleEnum, TokenTypeEnum } from "../enums/user.enum.js";
import { randomUUID } from "crypto";
import { UserModel } from "../../DB/model/User/user.model.js";

interface TokenPayload {
    _id: string;
    iat?: number;
    exp?: number;
    aud?: string; 
    jti?: string;
}

interface TokenResult {
    token: string;
    refreshToken: string;
}

export const generateToken = (
    payload: object,
    secretKey: string,
    options?: SignOptions
): string => {
    return jwt.sign(payload, secretKey, options);
};

export const getTokenSignature = async (role: RoleEnum) => {
    let signture: string;
    let refreshsSignture: string;
    let audience: RoleEnum = RoleEnum.USER;

    switch (role) {
        case RoleEnum.ADMIN:
            signture = SYSTEM_TOKEN_SECRET_KEY;
            refreshsSignture = REFRESH_SYSTEM_TOKEN_SECRET_KEY;
            audience = RoleEnum.ADMIN;
            break;
        default:
            signture = USER_TOKEN_SECRET_KEY;
            refreshsSignture = REFRESH_USER_TOKEN_SECRET_KEY;
            audience = RoleEnum.USER;
            break;
    }

    return { signture, refreshsSignture, audience };
};

export const createLoginCredentials = async (user: { _id: string; role: RoleEnum }): Promise<TokenResult> => {
    const { signture, refreshsSignture, audience } = await getTokenSignature(user.role);
    const jwtId = randomUUID();

    const token = generateToken(
        { _id: user._id },
        signture,
        {
            expiresIn: "30m",
            audience: JSON.stringify({ tokenType: TokenTypeEnum.TOKEN, role: audience }),
            jwtid: jwtId
        }
    );

    const refreshToken = generateToken(
        { _id: user._id },
        refreshsSignture,
        {
            expiresIn: "1y",
            audience: JSON.stringify({ tokenType: TokenTypeEnum.REFRESH, role: audience }),
            jwtid: jwtId
        }
    );

    return { token, refreshToken };
};

export const verifyToken = async (
    token: string,
    tokenType: TokenTypeEnum = TokenTypeEnum.TOKEN
) => {
    const decodedRaw = jwt.decode(token) as TokenPayload;
    if (!decodedRaw || !decodedRaw.aud) throw new Error("Invalid token");

    const { tokenType: decodedType, role } = JSON.parse(decodedRaw.aud);
    if (decodedType !== tokenType) throw new Error("Invalid token type");

    const { signture, refreshsSignture } = await getTokenSignature(role);
    const secret = tokenType === TokenTypeEnum.REFRESH ? refreshsSignture : signture;

    const verifiedPayload = jwt.verify(token, secret) as TokenPayload;

    const user = await UserModel.findById(verifiedPayload._id);
    if (!user) throw new Error("User not registered");

    if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() > (verifiedPayload.iat || 0) * 1000) {
        throw new Error("Token has been invalidated due to credential change");
    }

    return {
        tokenType,
        audience: role,
        verifiedPayload,
        user,
        decoded: decodedRaw
    };
};