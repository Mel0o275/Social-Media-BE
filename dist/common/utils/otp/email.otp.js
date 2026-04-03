"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendOtpEmail = exports.htmlTemp = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const htmlTemp = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
    </head>
    
    <body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">
    
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            
            <table width="500" cellpadding="0" cellspacing="0" 
                   style="background:#ffffff; border-radius:12px; padding:40px;">
              
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0; color:#6C63FF;">Saraha</h2>
                </td>
              </tr>
    
              <tr>
                <td align="center" style="padding-bottom:15px;">
                  <h1 style="margin:0; font-size:22px; color:#333;">
                    Verify Your Email
                  </h1>
                </td>
              </tr>
    
              <tr>
                <td align="center" style="padding-bottom:25px;">
                  <p style="margin:0; font-size:14px; color:#666; line-height:22px;">
                    Use the following One-Time Password (OTP) to complete your verification process.
                    This code will expire in 5 minutes.
                  </p>
                </td>
              </tr>
    
              <tr>
                <td align="center" style="padding-bottom:30px;">
                  <div style="
                      font-size:28px;
                      letter-spacing:6px;
                      font-weight:bold;
                      color:#6C63FF;
                      background:#f4f6ff;
                      padding:15px 30px;
                      border-radius:8px;
                      display:inline-block;">
                    ${otp}
                  </div>
                </td>
              </tr>
    
              <tr>
                <td align="center">
                  <p style="font-size:12px; color:#999; margin:0;">
                    If you didn’t request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
    
            </table>
    
            <p style="font-size:12px; color:#aaa; margin-top:20px;">
              © 2026 Saraha. All rights reserved.
            </p>
    
          </td>
        </tr>
      </table>
    
    </body>
    </html>
    `;
};
exports.htmlTemp = htmlTemp;
const sendOtpEmail = async (toEmail, otp) => {
    const from = process.env.EMAIL_USER;
    const subject = "Your OTP Code";
    const text = `Your OTP code is: ${otp}`;
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text,
        html: (0, exports.htmlTemp)(otp)
    });
    console.log(info.messageId);
    return info;
};
exports.sendOtpEmail = sendOtpEmail;
const sendResetPasswordEmail = async (toEmail, resetLink) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Copy and paste this link in your browser: ${resetLink}`,
        html: `<p>You requested a password reset.</p>
           <p>Click this <a href="${resetLink}">link</a> to reset your password.</p>
           <p>This link will expire in 1 hour.</p>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
