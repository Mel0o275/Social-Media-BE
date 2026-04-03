import { UserModel } from "../../DB/model/User/user.model";
import { compareHash, generateHash } from "../../common/security/hash.security";
import { get, set } from "../../common/services/redis.service";

interface UpdatePassInput {
    currentPassword: string;
    newPassword: string;
}

class AuthSecurityService {
    private async createRevokeToken(userId: string, jti: string, iat: number) {
        const key = `revoke_${userId}_${jti}`;
        const exists = await get(key);
        if (exists) return false;
        await set(key, jti, 31557600);
        return true;
    }

    async logout(decode: { _id: string; jti: string; iat: number }) {
        const revoked = await this.createRevokeToken(decode._id, decode.jti, decode.iat);

        if (!revoked) {
            return { message: "Already logged out", status: 400 };
        }

        return { message: "Logout successful", status: 200 };
    }

    async updatePass(user: any, { currentPassword, newPassword }: UpdatePassInput) {
        const profile = await UserModel.findById(user._id);
        if (!profile) throw new Error("User not found");

        const isMatch = await compareHash(currentPassword, profile.password);
        if (!isMatch) throw new Error("Current password is incorrect");

        const hashedPassword = await generateHash(newPassword);
        profile.password = hashedPassword;
        await profile.save();

        return { message: "Password updated successfully" };
    }
}

export default new AuthSecurityService();