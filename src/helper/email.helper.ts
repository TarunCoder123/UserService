// src/services/MailService.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";

class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: env.GMAIL_USER!,
                pass: env.GMAIL_PASS!,
            },
        });
    }
    public async sendEmail(to: string, token: string): Promise<void> {
        // const resetLink = `https://yourdomain.com/reset-password?token=${token}`;
        const html = `<h3>Reset Password</h3>
    <p>Click below to reset your password (valid for 15 min):</p>`;

        await this.transporter.sendMail({
            from: `"YourApp" <${env.GMAIL_USER}>`,
            to,
            subject: "Reset Your Password",
            html,
        });
    };

    public async sendOTP(email: string, otp: string): Promise<void> {
        await this.transporter.sendMail({
            from: env.GMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}`,
        });
    }
}

export default new MailService(); 
