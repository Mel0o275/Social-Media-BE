import { UserModel } from "../../DB/model/User/user.model";
import { storageApproachEnum, uploadApproachEnum } from "../../common/enums/multer.enum";
import { compareHash, generateHash } from "../../common/security/hash.security";
import { get, set } from "../../common/services/redis.service";
import { S3Service } from "../../common/services/s3.service";

interface UpdatePassInput {
    currentPassword: string;
    newPassword: string;
}

class AuthSecurityService {
    private readonly s3:S3Service
    constructor() {
        this.s3 = new S3Service();
    }
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

    async profile(user: any) {
    return {
        name: user.username,
        email: user.email,
        profilePicture: user.profileImage,
    };
    }

    async profileImage({ContentType, OriginalName} : { ContentType: string; OriginalName: string }, user: any) {
        const profile = await UserModel.findById(user._id);
        if (!profile) throw new Error("User not found");
        const {url, key} = await this.s3.createPresignedUploadLink({ ContentType, OriginalName, path: "profile-images"});
        profile.profileImage = (key) as string;
        await profile.save();
        return { user, url };
    }

    async coverImage(user: any, files: Express.Multer.File[]) {
        const profile = await UserModel.findById(user._id);
        if (!profile) throw new Error("User not found");
        const urls = await this.s3.uuploadFiles({ files, path: "cover-images" , storageApproach: storageApproachEnum.Disk, uploadApproach: uploadApproachEnum.Large});
        profile.coverImages = urls as string[];
        await profile.save();
        return { message: "Cover image updated successfully" };
    }

}

export default new AuthSecurityService();