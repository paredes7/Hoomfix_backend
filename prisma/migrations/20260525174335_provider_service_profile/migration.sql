/*
  Warnings:

  - You are about to drop the column `bio` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `commercialName` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `coverageRadius` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `ProviderService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProviderService" DROP COLUMN "bio",
DROP COLUMN "commercialName",
DROP COLUMN "coverageRadius",
DROP COLUMN "experience",
DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "ProviderServiceProfile" (
    "id" TEXT NOT NULL,
    "providerServiceId" TEXT NOT NULL,
    "phone" TEXT,
    "bio" TEXT,
    "experience" INTEGER,
    "coverageRadius" DOUBLE PRECISION,
    "commercialName" TEXT,
    "customServiceName" TEXT,
    "servicePhoto" TEXT,
    "servicePhotoPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderServiceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderServiceProfile_providerServiceId_key" ON "ProviderServiceProfile"("providerServiceId");

-- AddForeignKey
ALTER TABLE "ProviderServiceProfile" ADD CONSTRAINT "ProviderServiceProfile_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
