-- CreateTable
CREATE TABLE "PropertyDetails" (
    "property_id" UUID NOT NULL,
    "propertyName" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "lat" VARCHAR(50) NOT NULL,
    "long" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" VARCHAR(100) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "PropertyDetails_pkey" PRIMARY KEY ("property_id")
);

-- AddForeignKey
ALTER TABLE "PropertyDetails" ADD CONSTRAINT "PropertyDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
