import { Request, Response, NextFunction } from "express";
import { TokenTypeEnum } from '../common/enums/user.enum.js';
import { verifyToken } from '../common/security/token.security.js';

export const authentication = (tokenType = TokenTypeEnum.TOKEN) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { user, decoded } = await verifyToken(
            req.headers.authorization as string,
        );

        (req as any).user = user;
        (req as any).decoded = decoded;

        next();
    };
};


export const authorization = (accessRoles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        console.log((req as any).user.role);

        if (!accessRoles.includes((req as any).user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};