import prisma from "client/prisma.client";


class propertyHelper {
    constructor() {
        (async () => { })();
    }
    /** 
     * The propertyData helper to get the list of the property data under the filter condition
     * 
     * 
     * 
    */
    public getAllPropertyFilter = async (userId: string, propertyId: string, address: string, minPrice: number, maxPrice: number, isActive: boolean, limit: number, page: number) => {
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

                }
            }
        } catch (err) {

        }

    }
}

export default new propertyHelper();