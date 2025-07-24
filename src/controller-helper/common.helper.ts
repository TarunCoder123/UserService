import axios from "axios";
import { env } from "../config/env";
import redisHelper from "../helper/redis.helper";
import { REDIS_OTP_TTL_TIME } from "../constants/user.constant";
import { Fast2SMSPayload } from "@interfaces";
import MailService  from "../helper/email.helper";
import crypto from "crypto";

const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const generateResetToken = () => crypto.randomBytes(32).toString("hex");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit otp
};

const sendOTPviaFast = async (phone: string, otp: string): Promise<void> => {
    const apiKey = env.API_KEY_OTP;
    // create the payload of the fast2sms 
    const payload: Fast2SMSPayload = {
        route: "dlt_manual",
        message: "Your OTP is ##OTP##",
        variable_values: otp,
        numbers: phone.replace("+91", ""),
        flash: "0"
    };

    await axios.post(env.API_ENDPOINT, payload, {
        headers: {
            authorization: apiKey,
            "Content-Type": "application/json",
        },
    });
};

const sendOTPViaEmail = async (email: string, otp: string): Promise<void> => {
    await MailService.sendOTP(email, otp);
};

const storeOTP = async (identifier: string, otp: string): Promise<void> => {
    await redisHelper.client.set(`otp:${identifier}`, otp, {
        EX: REDIS_OTP_TTL_TIME.EXPIRE,
    });
};

const verifyOTP = async (identifier: string, otp: string): Promise<boolean> => {
    const storedOTP = await redisHelper.client.get(`otp:${identifier}`);
    return storedOTP === otp;
};

// const storeResetToken=async (email)

export { isValidEmail, generateOTP, verifyOTP, storeOTP, sendOTPviaFast, sendOTPViaEmail,generateResetToken };

