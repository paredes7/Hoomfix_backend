/*
  Warnings:

  - You are about to drop the column `clientProfileId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ClientProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientWallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProviderProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientProfile" DROP CONSTRAINT "ClientProfile_countryIso_fkey";

-- DropForeignKey
ALTER TABLE "ClientProfile" DROP CONSTRAINT "ClientProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ClientWallet" DROP CONSTRAINT "ClientWallet_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ProviderProfile" DROP CONSTRAINT "ProviderProfile_countryIso_fkey";

-- DropForeignKey
ALTER TABLE "ProviderProfile" DROP CONSTRAINT "ProviderProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recharge" DROP CONSTRAINT "Recharge_clientWalletId_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "clientProfileId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "ClientProfile";

-- DropTable
DROP TABLE "ClientWallet";

-- DropTable
DROP TABLE "ProviderProfile";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countryIso" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "avatarPublicId" TEXT,
    "referralCode" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_referralCode_key" ON "Profile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_profileId_key" ON "Wallet"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_countryIso_fkey" FOREIGN KEY ("countryIso") REFERENCES "Country"("iso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_clientWalletId_fkey" FOREIGN KEY ("clientWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
