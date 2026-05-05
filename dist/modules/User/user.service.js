"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSecurityService = exports.AuthSecurityService = void 0;
const user_model_1 = require("../../DB/model/User/user.model");
const multer_enum_1 = require("../../common/enums/multer.enum");
const hash_security_1 = require("../../common/security/hash.security");
const redis_service_1 = require("../../common/services/redis.service");
const s3_service_1 = require("../../common/services/s3.service");
class AuthSecurityService {
    s3;
    constructor() {
        this.s3 = new s3_service_1.S3Service();
    }
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
    async profile(user) {
        return user;
    }
    async profileImage({ ContentType, OriginalName }, user) {
        const oldPath = user.profileImage || "";
        if (oldPath) {
            await this.s3.deleteFile({ Key: oldPath });
        }
        const profile = await user_model_1.UserModel.findById(user._id);
        if (!profile)
            throw new Error("User not found");
        const { url, key } = await this.s3.createPresignedUploadLink({ ContentType, OriginalName, path: `${user._id}/profile-images` });
        profile.profileImage = (key);
        await profile.save();
        return { user, url };
    }
    async coverImage(user, files) {
        const oldPaths = user.coverImages || [];
        if (oldPaths.length > 0) {
            await Promise.all(oldPaths.map((key) => this.s3.deleteFiles({ Keys: [{ Key: key }] })));
        }
        const profile = await user_model_1.UserModel.findById(user._id);
        if (!profile)
            throw new Error("User not found");
        const urls = await this.s3.uuploadFiles({ files, path: `${user._id}/cover-images`, storageApproach: multer_enum_1.storageApproachEnum.Disk, uploadApproach: multer_enum_1.uploadApproachEnum.Large });
        profile.coverImages = urls;
        await profile.save();
        return { message: "Cover image updated successfully" };
    }
    async deleteProfile(user) {
        const account = await user_model_1.UserModel.findByIdAndDelete(user._id);
        if (!account)
            throw new Error("User not found");
        await this.s3.deleteFolderByPrefix({ prefix: `Social/${user._id}/` });
        return { message: "Account deleted successfully" };
    }
}
exports.AuthSecurityService = AuthSecurityService;
exports.authSecurityService = new AuthSecurityService();
