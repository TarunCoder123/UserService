import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import prisma from "../client/prisma.client";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { isValidEmail } from "./common.helper";
import { generateAccessToken, generateRefreshToken } from 'utils/jwt.utils';
import redisHelper from '../helper/redis.helper';
import { REDIS_ACCESS_TOKEN_EXP_TIME, REDIS_REFRESH_TOKEN_EXP_TIME } from '../constants/user.constant';


class UserHelper {
    constructor() {
        (async () => { })();
    }
    /**
     * The user signup helper handles all the login opertions and checks for valid users
     * @param {string} email
     * @param {string} name
     * @param {string} password
     * @returns {Promise<ApiResponse>} return after saving the user data
     */
    public userSignup = async (email: string, name: string, password: string): Promise<ApiResponse> => {
        try {
            // check the email is valid or not
            const valid = isValidEmail(email);
            if (!valid) {
                return {
                    error: true,
                    message: "email is not valid",
                    status: 400
                }
            }

            // check if user is present in the user table 
            const user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                return {
                    error: true,
                    message: "Email is already registered",
                    status: 409
                }
            }

            // register the email and name and password to the table
            const hashed = await bcrypt.hash(password, 10);

            const data = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: hashed
                }
            });

            return {
                error: false,
                data: { message: "Sign up is successfully" },
                status: STATUS_CODES.CREATED
            };
        } catch (e) {
            return {
                error: true,
                data: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: Number(STATUS_CODES.INTERNALSERVER)
            }
        }
    }
    /** 
     * The user sign-in helper handles all the login operations and check the user exists
     * @param {string} email
     * @param {string} password
     * @returns {Promise<ApiResponse>} return after generating the token
    */
    public userLogin = async (email: string, password: string): Promise<ApiResponse> => {
        // check the email is valid email or not
        try {
            const valid = isValidEmail(email);
            if (!valid) {
                return {
                    error: true,
                    message: "email is not valid",
                    status: 400
                }
            }

            // check if user is present in the user table 
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return {
                    error: true,
                    message: "Email is not registered",
                    status: 404
                }
            }

            //check the password with the user password
            const compared = await bcrypt.compare(password, user.password);

            if (!compared) {
                return {
                    error: true,
                    message: "Invalid credential",
                    status: 401
                }
            }

            // generate the token and store the token in the redis
            const access_uuid = uuidv4();
            const refresh_uuid = uuidv4();

            const refresh_token_payload = {
                refresh_uuid: refresh_uuid,
                email: email,
            };

            const access_token_payload = {
                access_uuid: access_uuid,
                refresh_uuid: refresh_uuid,
                email: email,
            };

            // generate the token both access token and refresh token
            const access_token = generateAccessToken(access_token_payload);
            const refresh_token = generateRefreshToken(refresh_token_payload);

            const setDataAccess = {
                access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
                refresh_token_uuid: refresh_uuid,
            };

            const setDataRefresh = {
                access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
                refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
                access_token_uuid: access_uuid,
            };

            await redisHelper.client.set(access_uuid, JSON.stringify(setDataAccess), {
                EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE
            });

            await redisHelper.client.set(refresh_uuid, JSON.stringify(setDataRefresh), {
                EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE
            });

            return {
                error: false,
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token,
                },
                status: Number(STATUS_CODES.SUCCESS)
            }
        } catch (err: any) {
            return {
                error: true,
                data: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: Number(STATUS_CODES.INTERNALSERVER),
            }
        }
    }
    /**
     * The user can logout by this api end point is there
     *  
     */
    public userLogout = async (user: any) => {
        // remove both the token access and refresh token from the redis
        try {
            await redisHelper.removeFromRedis(user.refresh_uuid);
            await redisHelper.removeFromRedis(user.access_uuid);
            return {
                message: RESPONSE_MESSAGES.LOGOUT,
                status: Number(STATUS_CODES.SUCCESS),
                error: false,
            };
        } catch (err) {
            return {
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: Number(409)
            }
        }
    }

}

export default new UserHelper();