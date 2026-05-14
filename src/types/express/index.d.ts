import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: HydratedDocument<IUser>;
        }
    }
}

export interface IAuth {user: HydratedDocument<IUser>, decoded: JwtPayload}
// export interface IAuthSocket extends Socket {data: IAuth}