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
     * @returns
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
    /**
     * The user can update the details of the about his profile like (bio,name,avatarUrl and location)
     * @param {string} email
     * @param {any} UpdatedFields
     * @returns
     */
    public updateProfileDetails = async (email: string, UpdatedFields: any): Promise<ApiResponse> => {
        try {
            if (Object.keys(UpdatedFields).length === 0) {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.MISSING_FIELD,
                    status: STATUS_CODES.BADREQUEST
                }
            }

            const updatedUser = await prisma.user.update({
                where: { email: email },
                data: UpdatedFields
            })

            return {
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROFILE_UPDATED,
                data: updatedUser,
                error: false
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
     * The helper by which user can upload there avatar in there bio
     * @param {string} email
     * @param {any} file
     * @returns
     */
    public uploadAvatars = async (email: string, file: any): Promise<ApiResponse> => {
        try {
            if (!file || email == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
                    status: STATUS_CODES.BADREQUEST
                }
            }

            const relativePath = `/uploads/avatars/${file.filename}`;

            const updatedUser = await prisma.user.update({
                where: { email },
                data: { avatarUrl: relativePath },
            });

            return {
                error: false,
                message: RESPONSE_MESSAGES.AVATAR_UPLOADED,
                data: {
                    avatarUrl: relativePath,
                    user: updatedUser,
                },
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
     * The helper by which a user can delete (soft delete)
     * @param {string} email
     * @returns
     */
    public deleteUser = async (email: string) => {
        try {

            if (email == "undefined") {
                return {
                    error: true,
                    message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
                    status: STATUS_CODES.BADREQUEST
                }
            }

            const dbUserDeleted = await prisma.user.update({
                where: { email },
                data: {
                    isDeleted: true
                }
            });

            return {
                message: RESPONSE_MESSAGES.SUCCESS_DELETED,
                error: false,
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

export default new UserHelper();