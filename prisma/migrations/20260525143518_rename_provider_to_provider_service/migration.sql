/*
  Warnings:

  - You are about to drop the column `bio` on the `ProviderProfile` table. All the data in the column will be lost.
  - You are about to drop the column `commercialName` on the `ProviderProfile` table. All the data in the column will be lost.
  - You are about to drop the column `coverageRadius` on the `ProviderProfile` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `ProviderProfile` table. All the data in the column will be lost.
  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Provider" DROP CONSTRAINT "Provider_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Provider" DROP CONSTRAINT "Provider_userId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_providerId_fkey";

-- AlterTable
ALTER TABLE "ProviderProfile" DROP COLUMN "bio",
DROP COLUMN "commercialName",
DROP COLUMN "coverageRadius",
DROP COLUMN "experience";

-- DropTable
DROP TABLE "Provider";

-- CreateTable
CREATE TABLE "ProviderService" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "bio" TEXT,
    "experience" INTEGER,
    "coverageRadius" DOUBLE PRECISION,
    "commercialName" TEXT,
    "documentUrls" TEXT[],
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "available" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderService_userId_serviceTypeId_key" ON "ProviderService"("userId", "serviceTypeId");

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
