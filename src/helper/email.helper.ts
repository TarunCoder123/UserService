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
