"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/model/User/user.model");
const hash_security_1 = require("../../common/security/hash.security");
const redis_service_1 = require("../../common/services/redis.service");
class AuthSecurityService {
    async createRevokeToken(userId, jti, iat) {
        const key = `revoke_${userId}_${jti}`;
        const exists = await (0, redis_service_1.get)(key);
        if (exists)
            return false;
        await (0, redis_service_1.set)(key, jti, 31557600);
        return true;
    }
    async logout(decode) {
        const revoked = await this.createRevokeToken(decode._id, decode.jti, decode.iat);
        if (!revoked) {
            return { message: "Already logged out", status: 400 };
        }
        return { message: "Logout successful", status: 200 };
    }
    async updatePass(user, { currentPassword, newPassword }) {
        const profile = await user_model_1.UserModel.findById(user._id);
        if (!profile)
            throw new Error("User not found");
        const isMatch = await (0, hash_security_1.compareHash)(currentPassword, profile.password);
        if (!isMatch)
            throw new Error("Current password is incorrect");
        const hashedPassword = await (0, hash_security_1.generateHash)(newPassword);
        profile.password = hashedPassword;
        await profile.save();
        return { message: "Password updated successfully" };
    }
}
exports.default = new AuthSecurityService();
