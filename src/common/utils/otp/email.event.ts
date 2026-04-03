import { EventEmitter } from "events";
export const emailEmitter = new EventEmitter()

emailEmitter.on("sendOtpEmail", async (toEmail, otp) => {
    try {
        const { sendOtpEmail } = await import("./email.otp.js");
        await sendOtpEmail(toEmail, otp);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
})