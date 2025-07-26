import { RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import prisma from "../client/prisma.client";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class UserHelper {
    constructor() {
        (async () => { })()
    }
    /**
     * The user can get the detial of his bio completly
     * @param {string} email
     * @retunrs
     */
    public getProfileDetails = async (email: string): Promise<ApiResponse> => {
        try {
            if (email == UNDEFINED) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.EMAIL_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                }
            }

            const dbUser = await prisma.user.findUnique({
                where: { email },
                select: { name: true, email: true, avatarUrl: true, preferences: true }
            });

            if (!dbUser) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                    status: STATUS_CODES.NOTFOUND
                }
            }

            return {
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                status: STATUS_CODES.SUCCESS,
                data: dbUser
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

export default new UserHelper();