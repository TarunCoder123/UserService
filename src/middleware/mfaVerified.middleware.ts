import { ExpressRequest } from "@interfaces";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { Response, NextFunction } from "express";
import sendResponse from "responses/response.helper";

export const mfaCheck = (req: any, res: Response, next: NextFunction) => {
    try {
        if (req?.session?.mfaVerified) {
            return next();
        } else {
            return sendResponse(res, {
                message: RESPONSE_MESSAGES.INVERFIED_MFA,
                status: STATUS_CODES.INTERNALSERVER
            })
        }
    } catch (err) {
        return sendResponse(res, {
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            status: STATUS_CODES.INTERNALSERVER
        })
    }
};
