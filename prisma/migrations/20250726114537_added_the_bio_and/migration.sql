-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" VARCHAR(500),
ADD COLUMN     "bio" VARCHAR(300),
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "preferences" JSONB;
