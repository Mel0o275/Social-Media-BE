"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/model/User/user.model");
const hash_security_1 = require("../../common/security/hash.security");
const encrypt_security_1 = require("../../common/security/encrypt.security");
const redis_service_1 = require("../../common/services/redis.service");
const email_otp_1 = require("../../common/utils/otp/email.otp");
const token_security_1 = require("../../common/security/token.security");
const redis_connection_1 = require("../../DB/redis.connection");
const config_1 = require("../../config/config");
const user_enum_1 = require("../../common/enums/user.enum");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    async signUpWithGoogleAccount(idToken) {
        try {
            const client = new google_auth_library_1.OAuth2Client('822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com');
            const ticket = await client.verifyIdToken({
                idToken,
                audience: '822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com'
            });
            const payload = ticket.getPayload();
            console.log("Google Payload:", payload);
            if (!payload || !payload.email_verified) {
                return { message: 'Email not verified by Google' };
            }
            const exist = await user_model_1.UserModel.findOne({ email: payload.email });
            if (exist) {
                if (exist.provider === user_enum_1.provider.LOCAL) {
                    return { message: "User exists as LOCAL account. Please login with email/password." };
                }
                const user = await this.loginWithGoogle(idToken);
                return { message: "Login successful", user };
            }
            const newUser = await user_model_1.UserModel.create({
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                provider: user_enum_1.provider.GOOGLE,
                isVerified: true,
            });
            return { message: "Signup successful", user: newUser };
        }
        catch (error) {
            console.error('Google Signup Error:', error);
            return { message: 'Error processing Google signup' };
        }
    }
    async loginWithGoogle(idToken) {
        const client = new google_auth_library_1.OAuth2Client('822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com');
        const ticket = await client.verifyIdToken({
            idToken,
            audience: '822248230063-aeiq4udlj5l4lpnno4j1di5vepbesfs3.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email_verified) {
            throw new Error('Email not verified by Google');
        }
        const exist = await user_model_1.UserModel.findOne({ email: payload.email });
        if (!exist || exist.provider !== user_enum_1.provider.GOOGLE) {
            throw new Error('Invalid provider, please login with your email and password');
        }
        return await (0, token_security_1.createLoginCredentials)(exist);
    }
    // ================= SIGN UP =================
    async signUp(inputs) {
        const { username, email, password, phone } = inputs;
        const [firstName, lastName] = username.split(' ');
        const exist = await user_model_1.UserModel.findOne({ email });
        if (exist)
            throw new Error('User already exists');
        const hashedPassword = await (0, hash_security_1.generateHash)(password);
        const encryptedPhone = phone ? await (0, encrypt_security_1.encryptData)(phone) : undefined;
        const user = new user_model_1.UserModel({
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
        const otpHash = await (0, hash_security_1.generateHash)(otp);
        const redisKey = `otp_${user._id}`;
        await (0, redis_service_1.set)(redisKey, otpHash, 5 * 60);
        await (0, email_otp_1.sendOtpEmail)(email, otp);
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
    async verifyOtpService(email, otp) {
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user)
            throw new Error("User not found");
        // const userId = user._id.toString();
        if (user.isVerified) {
            return { message: "Already verified" };
        }
        const redisKey = `otp_${user._id}`;
        const storedOtpHash = await (0, redis_service_1.get)(redisKey);
        if (!storedOtpHash) {
            throw new Error("OTP expired");
        }
        const isValid = await (0, hash_security_1.compareHash)(otp, storedOtpHash);
        if (!isValid)
            throw new Error("Invalid OTP");
        user.isVerified = true;
        await user.save();
        await (0, redis_service_1.deleteKey)(redisKey);
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
    async resendOtpService(userId) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user)
            throw new Error("User not found");
        if (user.isVerified) {
            throw new Error("Already verified");
        }
        const redisKey = `otp_${userId}`;
        const attemptKey = `otp_attempts_${userId}`;
        const blockKey = `otp_block_${userId}`;
        const isBlocked = await (0, redis_service_1.get)(blockKey);
        if (isBlocked) {
            const time = await (0, redis_service_1.ttl)(blockKey);
            throw new Error(`Blocked. Try again after ${time}s`);
        }
        const existing = await (0, redis_service_1.ttl)(redisKey);
        if (existing > 0) {
            throw new Error(`Wait ${existing}s before requesting new OTP`);
        }
        let attempts = Number(await (0, redis_service_1.get)(attemptKey)) || 0;
        attempts++;
        if (attempts > 3) {
            await (0, redis_service_1.set)(blockKey, "blocked", 10 * 60);
            await (0, redis_service_1.deleteKey)(attemptKey);
            throw new Error("Too many attempts. Blocked 10 min");
        }
        await (0, redis_service_1.set)(attemptKey, attempts.toString(), 10 * 60);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpHash = await (0, hash_security_1.generateHash)(otp);
        await (0, redis_service_1.set)(redisKey, otpHash, 5 * 60);
        await (0, email_otp_1.sendOtpEmail)(user.email, otp);
        return { message: "OTP resent" };
    }
    // ================= LOGIN =================
    async login(inputs) {
        const { email, password } = inputs;
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user)
            throw new Error("Invalid credentials");
        if (!user.isVerified) {
            throw new Error("Email not verified");
        }
        const attemptsKey = `login_attempts_${email}`;
        const attempts = Number(await (0, redis_service_1.get)(attemptsKey)) || 0;
        if (attempts >= 5) {
            const time = await (0, redis_service_1.ttl)(attemptsKey);
            throw new Error(`Try again after ${time}s`);
        }
        const isValid = await (0, hash_security_1.compareHash)(password, user.password);
        if (!isValid) {
            await (0, redis_service_1.set)(attemptsKey, (attempts + 1).toString(), 5 * 60);
            throw new Error("Invalid credentials");
        }
        const { token, refreshToken } = await (0, token_security_1.createLoginCredentials)(user);
        return { token, refreshToken };
    }
    // ================= FORGET PASSWORD =================
    async forgetPassword(email) {
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user)
            throw new Error("User not found");
        const token = (0, token_security_1.generateToken)({ email }, config_1.USER_TOKEN_SECRET_KEY, { expiresIn: "1h" });
        await redis_connection_1.redisClient.set(`reset:${token}`, email, {
            EX: 60 * 60
        });
        const link = `http://localhost:5173/reset-password?token=${token}`;
        await (0, email_otp_1.sendResetPasswordEmail)(email, link);
        return { message: "Reset link sent" };
    }
}
exports.default = new AuthService();
