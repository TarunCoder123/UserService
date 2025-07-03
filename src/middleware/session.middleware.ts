import { NextFunction, Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { decodeToken, verifyAccessToken } from "../utils/jwt.utils";
import prisma from "../client/prisma.client";


/**
 * This is middleware function which is used to validate the user.
 */
export const sessionCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // step 1:Fetch the token from the cookies only the access token
        const access_token = req.cookies?.accessToken;
        if (!access_token) {
            return sendResponse(res, {
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                status: STATUS_CODES.UNAUTHORIZED
            })
        }

        // step 2:Verify the jwt token 
        const verifyToken = verifyAccessToken(access_token);
        if (!verifyToken) {
            return sendResponse(res, {
                message: RESPONSE_MESSAGES.MISSING_TOKEN,
                status: STATUS_CODES.NOTFOUND
            })
        }

        // step 3:Decode the verified Token
        const decodedToken = decodeToken(access_token) as any;
        if (!decodedToken) {
            return sendResponse(res, {
                message: RESPONSE_MESSAGES.INVALID_TOKEN,
                status: STATUS_CODES.BADREQUEST
            })
        }

        // step 4:Chcek the email is present in the DB
        const { access_uuid,refresh_uuid,email } = decodedToken;

        const userData=await prisma.user.findUnique({where:{email}});
        if(!userData){
            return sendResponse(res,{
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                status: STATUS_CODES.NOTFOUND
            })
        }

        // step 5: add the important detail inside the req.user
        (req as any).user = {
            access_uuid:access_uuid,
            refresh_uuid:refresh_uuid,
            email:email
        }

        next();
    }catch(err){
        return sendResponse(res,{
            message: RESPONSE_MESSAGES.INVALID_TOKEN,
            status: STATUS_CODES.UNAUTHORIZED
        })
    }
}