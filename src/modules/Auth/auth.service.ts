import { UserModel } from "../../DB/model/User/user.model";
import { loginDTO, signUpDTO } from "./auth.dto";
import { generateHash, compareHash } from "../../common/security/hash.security";
import { encryptData } from "../../common/security/encrypt.security";
import { set, get, deleteKey, ttl } from "../../common/services/redis.service";
import { IUser } from "../../common/interfaces/user.interface";
import { sendOtpEmail, sendResetPasswordEmail } from "../../common/utils/otp/email.otp";
import { createLoginCredentials, generateToken } from "../../common/security/token.security";
import { redisClient } from "../../DB/redis.connection";
import { USER_TOKEN_SECRET_KEY } from "../../config/config";
import { provider } from "../../common/enums/user.enum";
import { OAuth2Client } from 'google-auth-library';

export interface SignUpResponse {
    message: string;
    user: Partial<IUser>;
}

class AuthService {
    // ================= SIGN UP =================
    async signUp(inputs: signUpDTO): Promise<SignUpResponse> {
        const { username, email, password, phone } = inputs;

        const [firstName, lastName] = username.split(' ');

        const exist = await UserModel.findOne({ email });
        if (exist) throw new Error('User already exists');

        const hashedPassword = await generateHash(password);
        const encryptedPhone = phone ? await encryptData(phone) : undefined;

        const user = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone: encryptedPhone,
            isVerified: false,
        });

        await user.save();

        // OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpHash = await generateHash(otp);

        const redisKey = `otp_${user._id}`;
        await set(redisKey, otpHash, 5 * 60);

        await sendOtpEmail(email, otp); 

        return {
            message: "User created. OTP sent.",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified,
            }
        };
    }

    // ================= VERIFY OTP =================
    async verifyOtpService(email: string, otp: string) {
        const user = await UserModel.findOne({email});
        if (!user) throw new Error("User not found");
        // const userId = user._id.toString();

        if (user.isVerified) {
            return { message: "Already verified" };
        }

        const redisKey = `otp_${user._id}`;
        const storedOtpHash = await get(redisKey);

        if (!storedOtpHash) {
            throw new Error("OTP expired");
        }

        const isValid = await compareHash(otp, storedOtpHash);
        if (!isValid) throw new Error("Invalid OTP");

        user.isVerified = true;
        await user.save();

        await deleteKey(redisKey);

        return {
            message: "Account verified",
            user: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                isVerified: user.isVerified,
            }
        };
    }

    // ================= RESEND OTP =================
    async resendOtpService(userId: string) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        if (user.isVerified) {
            throw new Error("Already verified");
        }

        const redisKey = `otp_${userId}`;
        const attemptKey = `otp_attempts_${userId}`;
        const blockKey = `otp_block_${userId}`;

        const isBlocked = await get(blockKey);
        if (isBlocked) {
            const time = await ttl(blockKey);
            throw new Error(`Blocked. Try again after ${time}s`);
        }

        const existing = await ttl(redisKey);
        if (existing > 0) {
            throw new Error(`Wait ${existing}s before requesting new OTP`);
        }

        let attempts = Number(await get(attemptKey)) || 0;
        attempts++;

        if (attempts > 3) {
            await set(blockKey, "blocked", 10 * 60);
            await deleteKey(attemptKey);
            throw new Error("Too many attempts. Blocked 10 min");
        }

        await set(attemptKey, attempts.toString(), 10 * 60);

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpHash = await generateHash(otp);

        await set(redisKey, otpHash, 5 * 60);
        await sendOtpEmail(user.email, otp);

        return { message: "OTP resent" };
    }

    // ================= LOGIN =================
    async login(inputs: loginDTO) {
        const { email, password } = inputs;

        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("Invalid credentials");

        if (!user.isVerified) {
            throw new Error("Email not verified");
        }

        const attemptsKey = `login_attempts_${email}`;
        const attempts = Number(await get(attemptsKey)) || 0;

        if (attempts >= 5) {
            const time = await ttl(attemptsKey);
            throw new Error(`Try again after ${time}s`);
        }

        const isValid = await compareHash(password, user.password);
        if (!isValid) {
            await set(attemptsKey, (attempts + 1).toString(), 5 * 60);
            throw new Error("Invalid credentials");
        }

        const { token, refreshToken } = await createLoginCredentials(user);

        return { token, refreshToken };
    }

    // ================= FORGET PASSWORD =================
    async forgetPassword(email: string) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found");

        const token = generateToken(
            { email }, 
            USER_TOKEN_SECRET_KEY, 
            {expiresIn : "1h"});

        await redisClient.set(`reset:${token}`, email, {
            EX: 60 * 60
        });

        const link = `http://localhost:5173/reset-password?token=${token}`;
        await sendResetPasswordEmail(email, link);

        return { message: "Reset link sent" };
    }

    // ================= GOOGLE =================
    async signUpWithGoogleAccount(idToken: string): Promise<{ message: string; user?: IUser }> {
        try {
            const client = new OAuth2Client('822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com');
            const ticket = await client.verifyIdToken({
                idToken,
                audience: '822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com'
            });
    
            const payload = ticket.getPayload();
            console.log("Google Payload:", payload);
    
            if (!payload || !payload.email_verified || !payload.email) {
                return { message: 'Email not verified by Google' };
            }
            const email = payload.email;
            const exist = await UserModel.findOne({ email });
    
            if (exist) {
                if (exist.provider === provider.LOCAL) {
                    return { message: "User exists as LOCAL account. Please login with email/password." };
                }
                const user = await this.loginWithGoogle(idToken);
                return { message: "Login successful", user };
            }
    
            const firstName = payload.given_name ?? "";
            const lastName = payload.family_name ?? "";
    
            const newUser = await UserModel.create({
                firstName,
                lastName,
                email: payload.email,
                provider: provider.GOOGLE,
                isVerified: true,
            });
    
            return { message: "Signup successful", user: newUser };
    
        } catch (error: any) {
            console.error('Google Signup Error:', error);
            return { message: 'Error processing Google signup' };
        }
    }

    async loginWithGoogle(idToken: string): Promise<any> {
        const client = new OAuth2Client('822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com');
        const ticket = await client.verifyIdToken({
            idToken,
            audience: '822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email_verified || !payload.email) {
            throw new Error('Email not verified by Google');
        }

        const exist = await UserModel.findOne({ email: payload.email });
        if (!exist || exist.provider !== provider.GOOGLE) {
            throw new Error('Invalid provider, please login with your email and password');
        }

        return await createLoginCredentials(exist);
    }

}

export default new AuthService();