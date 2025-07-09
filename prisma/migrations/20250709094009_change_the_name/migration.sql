/*
  Warnings:

  - You are about to alter the column `price` on the `PropertyDetails` table. The data in that column could be lost. The data in that column will be cast from `VarChar(104)` to `VarChar(90)`.

*/
-- AlterTable
ALTER TABLE "PropertyDetails" ALTER COLUMN "price" SET DATA TYPE VARCHAR(90);
