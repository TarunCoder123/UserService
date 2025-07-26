import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import prisma from "../client/prisma.client";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { generateOTP, generateResetToken, generateSecret, isValidEmail, sendOTPViaEmail, sendOTPviaFast, storeOTP, verifyOTP, qrCode, verifyMFA } from "./common.helper";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import redisHelper from '../helper/redis.helper';
import MailService from "../helper/email.helper";
import { REDIS_ACCESS_TOKEN_EXP_TIME, REDIS_REFRESH_TOKEN_EXP_TIME } from '../constants/user.constant';


class AuthHelper {
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
     *  @param {any} user
     * @returns {Promise<ApiResponse>} return after changing the password 
     */
    public userLogout = async (user: any): Promise<ApiResponse> => {
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
    /**
     * The user can change the password by the api end point here
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<ApiResponse>} return after changing the password 
     */
    public userChangePassword = async (oldPassword: string, newPassword: string, email: string): Promise<ApiResponse> => {
        // check that email is valid or not
        try {
            const valid = isValidEmail(email);
            if (!valid) {
                return {
                    error: true,
                    message: "email is not valid",
                    status: 400
                }
            }

            // check that email is present in the user table or not
            const responseData = await prisma.user.findUnique({ where: { email } });
            if (!responseData) {
                return {
                    status: STATUS_CODES.UNAUTHORIZED,
                    message: RESPONSE_MESSAGES.UNAUTHORIZED,
                    error: true
                }
            }

            // check that old password is right or not
            const compared = await bcrypt.compare(oldPassword, responseData.password);

            if (!compared) {
                return {
                    error: true,
                    message: "Invalid password",
                    status: 401
                }
            }

            // change the date means update the data 
            const newHashedPassword = await bcrypt.hash(newPassword, 10);

            const updataUser = await prisma.user.update({
                where: { email },
                data: { password: newHashedPassword },
            });

            if (!updataUser) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                    status: STATUS_CODES.INTERNALSERVER
                }
            }

            return {
                error: false,
                data: { message: "Password successfully changed" },
                status: STATUS_CODES.SUCCESS
            }
        } catch (err: any) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * Any user can get the list of the user 
     * @returns 
     */
    public getUserList = async (): Promise<ApiResponse> => {
        try {
            const responseData = await prisma.user.findMany();
            if (!responseData) {
                return {
                    status: STATUS_CODES.UNAUTHORIZED,
                    message: RESPONSE_MESSAGES.UNAUTHORIZED,
                    error: true
                }
            }

            return {
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_USER_SUCCESS,
                error: false,
                data: responseData
            };
        } catch (err: any) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can generate the otp and send to their mobile number
     * @param {string} phone
     * @returns
     */
    public sendOTP = async (phone: string): Promise<ApiResponse> => {
        try {
            if (!phone || phone == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.PHONE_NUMBER_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                };
            }
            // OTP is generated 
            const otp: string = generateOTP();

            await sendOTPviaFast(phone, otp);
            await storeOTP(phone, otp);

            return {
                error: false,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.SUCCESS_OTP
            };
        } catch (err: any) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can verify the otp which is  send on your mobile number
     * @param {string} phone
     * @param {string} otp
     * @returns
     */
    public verifyOTP = async (phone: string, otp: string): Promise<ApiResponse> => {
        try {
            if (!phone || phone == "undefined" || !otp || otp == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.PHONE_NUMBER_OR_OTP_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                };
            }
            // verift the otp OTP is generated 
            const isValid = await verifyOTP(phone, otp);
            if (!isValid) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INVALID_OTP,
                    status: STATUS_CODES.SUCCESS,
                    data: { message: "Invalid otp is given" }
                };
            }

            return {
                error: false,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.OTP_VERIFIED
            };
        } catch (err: any) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can generate the otp and send to their email
     * @param {string} email
     * @returns
     */
    public sendOTPEmail = async (email: string) => {
        try {
            if (!email || email == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.EMAIL_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                };
            }

            const otp = generateOTP();

            await sendOTPViaEmail(email, otp);
            await storeOTP(email, otp);

            return {
                error: false,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.SUCCESS_OTP
            };

        } catch {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can verify the otp which is  send on your mobile number
     * @param {string} email
     * @param {string} otp
     * @returns
     */
    public verifyOTPEmail = async (email: string, otp: string): Promise<ApiResponse> => {
        try {
            if (!email || email == "undefined" || !otp || otp == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.PHONE_NUMBER_OR_OTP_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                };
            }
            // verift the otp OTP is generated 
            const isValid = await verifyOTP(email, otp);
            if (!isValid) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INVALID_OTP,
                    status: STATUS_CODES.SUCCESS,
                    data: { message: "Invalid otp is given" }
                };
            }

            return {
                error: false,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.OTP_VERIFIED
            };
        } catch (err: any) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can reset the password throught the reset link 
     * @param {string} email
     * @returns
     */
    public forgetPassword = async (email: string): Promise<ApiResponse> => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return {
                    error: true,
                    status: STATUS_CODES.NOTFOUND,
                    message: RESPONSE_MESSAGES.INVALID_USER
                }
            }

            const token = generateResetToken();
            // store the token in the redis
            await redisHelper.client.set(token, user.user_id.toString());

            await MailService.sendEmail(email, token);

            return {
                error: false,
                message: RESPONSE_MESSAGES.EMAIL_SENT,
                status: STATUS_CODES.SUCCESS
            }
        } catch (err) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can reset his password by the token that is send on the email
     * @param {string} token
     * @param {string} newPassword
     * @returns
     */
    public userChangePasswordEmail = async (token: string, newPassword: string): Promise<ApiResponse> => {
        try {
            const user_id = await redisHelper.client.get(token);
            if (!user_id) {
                return {
                    error: true,
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
                }
            }

            const user = await prisma.user.findUnique({ where: { user_id } });
            if (!user) {
                return {
                    error: true,
                    status: STATUS_CODES.NOTFOUND,
                    message: RESPONSE_MESSAGES.INVALID_USER
                }
            }

            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { user_id: "abc" },
                data: {
                    password: newHashedPassword,
                },
            });

            await redisHelper.client.del(token);

            return {
                error: false,
                message: RESPONSE_MESSAGES.SUCCESS_CHANGED_PASSWORD,
                status: STATUS_CODES.SUCCESS
            }
        } catch (err) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can generate the secret and QRcode for the google authenticator
     * @param {any} user
     * @returns
     */
    public userGenerateMFASecret = async (user: any): Promise<ApiResponse> => {
        try {
            // generate the secret from the speakeasy
            const secret = generateSecret(user?.email);
            if (!secret || user.id === "undefined") {
                return {
                    error: true,
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.BADREQUEST

                }
            }

            await prisma.user.update({
                where: { email: user.email },
                data: { mfaSecret: secret.base32 },
            });

            const QrCode = await qrCode(secret);


            return {
                error: false,
                data: {
                    qrCode: QrCode,
                },
                message: RESPONSE_MESSAGES.SUCESS_QR_CODE,
                status: STATUS_CODES.SUCCESS
            }
        } catch (err) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
    /**
     * The user can verify the generate token by the QR code by the google authenticator
     * @param {string} token
     * @param {any} user
     * @returns
     */
    public verifyMFASecret = async (token: string, user: any): Promise<ApiResponse> => {
        try {
            const dbuser = await prisma.user.findUnique({ where: { email: user.email } });
            if (!dbuser) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.UNAUTHORIZED,
                    status: STATUS_CODES.UNAUTHORIZED
                }
            }

            const verified = verifyMFA(token, String(dbuser?.mfaSecret));

            if (!verified) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INVALID_TOKEN_MFA,
                    status: STATUS_CODES.UNAUTHORIZED
                }
            }

            return {
                error: false,
                data: { isVerified: verified },
                message: RESPONSE_MESSAGES.VERFIED_MFA,
                status: STATUS_CODES.SUCCESS
            }
        } catch (err) {
            return {
                error: true,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            }
        }
    }
}

export default new AuthHelper();