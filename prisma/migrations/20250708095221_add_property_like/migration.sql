-- CreateTable
CREATE TABLE "PropertyLike" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyGallery" (
    "id" UUID NOT NULL,
    "imageUrl" VARCHAR(255) NOT NULL,
    "propertyId" UUID NOT NULL,

    CONSTRAINT "PropertyGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyComments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "comment" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyComments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyLike" ADD CONSTRAINT "PropertyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyLike" ADD CONSTRAINT "PropertyLike_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyDetails"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyGallery" ADD CONSTRAINT "PropertyGallery_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyDetails"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyComments" ADD CONSTRAINT "PropertyComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyComments" ADD CONSTRAINT "PropertyComments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyDetails"("property_id") ON DELETE RESTRICT ON UPDATE CASCADE;
