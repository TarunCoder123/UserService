import prisma from "../client/prisma.client";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { status } from "@grpc/grpc-js";


class propertyHelper {
    constructor() {
        (async () => { })();
    }
    /** 
     * The propertyData helper to get the list of the property data under the filter condition
     * @param {string} userId
     * @param {string} propertyId
     * @param {string} address
     * @param {number} minPrice
     * @param {number} maxPrice
     * @param {boolean} isActive
     * @param {number} limit
     * @param {number} page
    */
    public getAllPropertyFilter = async (userId: string, propertyId: string, address: string, minPrice: number, maxPrice: number, isActive: boolean, limit: number, page: number): Promise<ApiResponse> => {
        try {
            limit = limit || Number(10);
            page = page || Number(1);
            const offset: number = (page - 1) * limit;

            let properties = [];

            if (userId && userId !== "undefined") {
                properties = await prisma.propertyDetails.findMany({
                    where: {
                        userId,
                    },
                    include: {
                        user: true,
                        PropertyLike: true,
                        PropertyGallery: true,
                        PropertyComments: true,
                    },
                    skip: offset,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            else if (propertyId && propertyId !== "undefined") {
                properties = await prisma.propertyDetails.findMany({
                    where: {
                        property_id: propertyId,
                    },
                    include: {
                        user: true,
                        PropertyLike: true,
                        PropertyGallery: true,
                        PropertyComments: true,
                    },
                    skip: offset,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            } else {
                const filters: any = {};

                if (address && address !== "undefined") {
                    filters.address = {
                        contains: address,
                        mode: "insensitive",
                    }
                }

                if (typeof isActive === 'boolean') {
                    filters.isActive = isActive;
                }

                if (minPrice !== undefined || maxPrice !== undefined) {
                    filters.AND = [];
                    if (minPrice !== undefined) {
                        filters.AND.push({
                            price: {
                                gte: String(minPrice),
                            },
                        });
                    }
                    if (maxPrice !== undefined) {
                        filters.AND.push({
                            price: {
                                lte: String(maxPrice),
                            },
                        });
                    }
                }

                properties = await prisma.propertyDetails.findMany({
                    where: filters,
                    include: {
                        user: true,
                        PropertyLike: true,
                        PropertyGallery: true,
                        PropertyComments: true,
                    },
                    skip: offset,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }

            return {
                data: {
                    properties: properties,
                },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                status: Number(STATUS_CODES.SUCCESS)
            }
        } catch (err) {
            return {
                error: true,
                data: { isLogin: false },
                status: Number(STATUS_CODES.INTERNALSERVER),
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            };
        }

    }
    /**
     * The user can post the property for the user
     * @param {any} body
     * @param {string} email
     * @returns
    */
    public postProperty = async (body: any, email: string): Promise<ApiResponse> => {
        try {
            // step 1:Fetch the userId from the user table
            const user = await prisma.user.findUnique({
                where: { email: email },
                select: { user_id: true },
            });

            if (!user) {
                return {
                    error: true,
                    data: { message: RESPONSE_MESSAGES.USER_NOT_FOUND },
                    status: Number(STATUS_CODES.NOTFOUND)
                }
            }

            // step 2:Create the property 
            const property = await prisma.propertyDetails.create({
                data: {
                    propertyName: String(body?.propertyName),
                    address: String(body?.propertyName),
                    lat: String(body?.propertyName),
                    long: String(body?.propertyName),
                    price: String(body?.propertyName),
                    userId: String(user.user_id),
                },
            });

            return {
                data: { property: property },
                message: RESPONSE_MESSAGES.SAVEDATA,
                status: STATUS_CODES.SUCCESS,
                error: false
            }
        } catch (err) {
            return {
                error: true,
                data: { isLogin: false },
                status: Number(STATUS_CODES.INTERNALSERVER),
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            };
        }
    }
    /** 
     * The user can see the property post by him 
     * @param {string} email
     * @returns
    */
    public getPropertyByMe = async (email: string): Promise<ApiResponse> => {
        try {
            // step 1:Fetch the userId from the user table
            const user = await prisma.user.findUnique({
                where: { email: email },
                select: { user_id: true },
            });

            if (!user) {
                return {
                    error: true,
                    data: { message: RESPONSE_MESSAGES.USER_NOT_FOUND },
                    status: Number(STATUS_CODES.NOTFOUND)
                }
            }

            //step 2:Fetch the property by this userId
            const propertyDetails = await prisma.propertyDetails.findMany({
                where: { userId: user.user_id },
                include: {
                    //     PropertyComments:true,
                    //     _count: {
                    //         select: {
                    //           PropertyLike: true,
                    //         },
                    //       },
                    PropertyGallery: true
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return {
                data: { property: propertyDetails },
                message: RESPONSE_MESSAGES.SAVEDATA,
                status: STATUS_CODES.SUCCESS,
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
    /***
     * The user can see the property post by him the list of the like and comments
     * 
     * 
    */
    public getPropertyLikeAndCommentByMe = async (property_id: string): Promise<ApiResponse> => {
        try {
            // fetch the properity like and comment on the basis of the property_id
            const [propertiesLikeData, propertiesCommentData] = await Promise.all([
                prisma.propertyLike.findMany({
                    where: { propertyId: property_id },
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                }),
                prisma.propertyComments.findMany({
                    where: { propertyId: property_id },
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                }),
            ]);
            return {
                data: {
                    LikeData: propertiesLikeData,
                    CommentData: propertiesCommentData
                },
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false,
                status: Number(STATUS_CODES.SUCCESS)
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
     * 
     * 
     * 
     */
    public uploadPropertyPhoto = async (propertyId: string, files: any): Promise<ApiResponse> => {
        try {
            if (!files || (files as Express.Multer.File[]).length === 0) {
                return {
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.NOT_FOUND,
                    error: true
                };
            }

            const galleryItems = await Promise.all(
                files.map((file: any) =>
                    prisma.propertyGallery.create({
                        data: {
                            imageUrl: `/uploads/properties/${file.filename}`,
                            propertyId,
                        },
                    })
                )
            );

            return {
                error: false,
                data: galleryItems,
                message: RESPONSE_MESSAGES.UPDATED_SUCCESS,
                status: STATUS_CODES.CREATED,
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
     * 
     * 
     * 
     */
    public likeProperty = async (propertyId: string, email: string) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return {
                    error: false,
                    message: RESPONSE_MESSAGES.BADREQUEST,
                    status: STATUS_CODES.BADREQUEST
                }
            }

            const response = await prisma.propertyLike.create({
                data: {
                    userId: user.user_id,
                    propertyId
                }
            });

            return {
                error: false,
                status: STATUS_CODES.CREATED,
                message: RESPONSE_MESSAGES.PROPERTY_LIKED,
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

export default new propertyHelper();