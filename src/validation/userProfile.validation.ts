import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import sendResponse from "responses/response.helper";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";

/**
 * Validation while connecting wallet or logging in
 */
const userProfileValidation = (req: any, res: any, next: NextFunction) => {
    const schema = z.object({
        name: z.string().min(1).max(50).optional(),
        bio: z.string().max(255).optional(),
        avatarUrl: z.string().url().optional(),
        location: z.string().optional(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.flatten();
        return sendResponse(res, {
            message: RESPONSE_MESSAGES.INVALID_DATA,
            status: STATUS_CODES.FORBIDDEN,
            data: { "message": message }
        })
    } else {
        req.updateUser=result.data;
        next();
    }
};

export default userProfileValidation;