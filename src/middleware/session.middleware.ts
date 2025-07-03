import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import sendResponse from "../responses/response.helper";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { decodeToken, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.utils";
import prisma from "../client/prisma.client";
import { REDIS_ACCESS_TOKEN_EXP_TIME, REDIS_REFRESH_TOKEN_EXP_TIME } from "../constants/user.constant";
import redisHelper from "../helper/redis.helper";


/**
 * This is middleware function which is used to validate the user.
 */
export const sessionCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const access_token = req.cookies?.accessToken;
        const refresh_token = req.cookies?.refreshToken;
        let decodedToken: any = null;

        if (access_token && verifyAccessToken(access_token)) {
            decodedToken = decodeToken(access_token) as any;
            if (!decodedToken) {
                return sendResponse(res, {
                    message: RESPONSE_MESSAGES.INVALID_TOKEN,
                    status: STATUS_CODES.BADREQUEST
                })
            }
        } else if (refresh_token && verifyRefreshToken(refresh_token)) {
            // Decode the refresh token
            const decodedRefreshToken = decodeToken(refresh_token) as any;
            if (!decodedRefreshToken) {
                return sendResponse(res, {
                    message: RESPONSE_MESSAGES.INVALID_TOKEN,
                    status: STATUS_CODES.BADREQUEST
                })
            }
            const { email } = decodedRefreshToken;
            // generate the token and store the token in the redis
            const new_access_uuid = uuidv4();
            const new_refresh_uuid = uuidv4();

            const refresh_token_payload = {
                refresh_uuid: new_refresh_uuid,
                email: email,
            };

            const access_token_payload = {
                access_uuid: new_access_uuid,
                refresh_uuid: new_refresh_uuid,
                email: email,
            };

            // generate the token both access token and refresh token
            const new_access_token = generateAccessToken(access_token_payload);
            const new_refresh_token = generateRefreshToken(refresh_token_payload);

            const setDataAccess = {
                access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
                refresh_token_uuid: new_refresh_uuid,
            };

            const setDataRefresh = {
                access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
                refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
                access_token_uuid: new_access_uuid,
            };

            await redisHelper.client.set(new_access_uuid, JSON.stringify(setDataAccess), {
                EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE
            });

            await redisHelper.client.set(new_refresh_uuid, JSON.stringify(setDataRefresh), {
                EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE
            });

            res.cookie("accessToken", new_access_token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            res.cookie("refreshToken", new_refresh_token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });

            decodedToken = decodeToken(access_token) as any;
        } else {
             return sendResponse(res,{
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
             })
        }
        // step 4:Chcek the email is present in the DB
        const { access_uuid, refresh_uuid, email } = decodedToken;

        const userData = await prisma.user.findUnique({ where: { email } });
        if (!userData) {
            return sendResponse(res, {
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                status: STATUS_CODES.NOTFOUND
            })
        }

        // step 5: add the important detail inside the req.user
        (req as any).user = {
            access_uuid: access_uuid,
            refresh_uuid: refresh_uuid,
            email: email
        }

        next();
    } catch (err) {
        return sendResponse(res, {
            message: RESPONSE_MESSAGES.INVALID_TOKEN,
            status: STATUS_CODES.UNAUTHORIZED
        })
    }
    // try {
    //     // step 1:Fetch the token from the cookies only the access token
    //     const access_token = req.cookies?.accessToken;
    //     const refresh_token = req.cookies?.refreshToken;

    //     if (!access_token) {

    //         return sendResponse(res, {
    //             message: RESPONSE_MESSAGES.UNAUTHORIZED,
    //             status: STATUS_CODES.UNAUTHORIZED
    //         })
    //     }

    //     // step 2:Verify the jwt token 
    //     const verifyToken = verifyAccessToken(access_token);
    //     if (!verifyToken) {
    //         return sendResponse(res, {
    //             message: RESPONSE_MESSAGES.MISSING_TOKEN,
    //             status: STATUS_CODES.NOTFOUND
    //         })
    //     }

    //     // step 3:Decode the verified Token
    //     const decodedToken = decodeToken(access_token) as any;
    //     if (!decodedToken) {
    //         return sendResponse(res, {
    //             message: RESPONSE_MESSAGES.INVALID_TOKEN,
    //             status: STATUS_CODES.BADREQUEST
    //         })
    //     }

    //     // step 4:Chcek the email is present in the DB
    //     const { access_uuid, refresh_uuid, email } = decodedToken;

    //     const userData = await prisma.user.findUnique({ where: { email } });
    //     if (!userData) {
    //         return sendResponse(res, {
    //             message: RESPONSE_MESSAGES.USER_NOT_FOUND,
    //             status: STATUS_CODES.NOTFOUND
    //         })
    //     }

    //     // step 5: add the important detail inside the req.user
    //     (req as any).user = {
    //         access_uuid: access_uuid,
    //         refresh_uuid: refresh_uuid,
    //         email: email
    //     }

    //     next();
    // } catch (err) {
    //     return sendResponse(res, {
    //         message: RESPONSE_MESSAGES.INVALID_TOKEN,
    //         status: STATUS_CODES.UNAUTHORIZED
    //     })
    // }
}