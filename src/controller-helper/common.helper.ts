import axios from "axios";
import { env } from "../config/env";
import redisHelper from "../helper/redis.helper";
import { REDIS_OTP_TTL_TIME } from "../constants/user.constant";
import { Fast2SMSPayload } from "@interfaces";

const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit otp
};

const sendOTPviaFast = async (phone: string, otp: string):Promise<void> => {
    const apiKey = env.API_KEY_OTP;
    // create the payload of the fast2sms 
    const payload : Fast2SMSPayload= {
        route: "otp",
        variable_values: otp,
        numbers: phone.toString()
    };

    await axios.post(env.API_ENDPOINT, payload, {
        headers: {
            authorization: apiKey,
            "Content-Type": "application/json",
        },
    });
};

const storeOTP=async (phone:string,otp:string):Promise<void>=>{
    await redisHelper.client.set(`otp:${phone}`, otp, {
        EX: REDIS_OTP_TTL_TIME.EXPIRE,
      });
};

const verifyOTP=async (phone:string,otp:string):Promise<boolean>=>{
    const storedOTP=await redisHelper.client.get(`otp:${phone}`);
    return storedOTP===otp;
};



export { isValidEmail,generateOTP,verifyOTP,storeOTP,sendOTPviaFast };

