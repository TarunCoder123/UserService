import { env } from "../config/env";
import jwt, { SignOptions } from "jsonwebtoken"


export const generateAccessToken = (payload: any) => {
    const options: SignOptions | any = { expiresIn: env.ACCESS_TOKEN_EXPIRY };
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: any) => {
    const options: SignOptions | any = { expiresIn: env.REFRESH_TOKEN_EXPIRY };
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as any;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as any;
    } catch (error) {
        return null;
    }
};

export const decodeToken = (token: string) => {
    try {
        const decode = jwt.decode(token);
        return decode as any;
    } catch (error) {
        return null;
    }
};

