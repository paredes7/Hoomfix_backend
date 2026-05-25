/*
  Warnings:

  - You are about to drop the column `preferredCurrency` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `documentUrls` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `walletId` on the `Recharge` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneCountryIso` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneDialCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `amountBob` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `amountUsd` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `walletId` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientWalletId` to the `Recharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerWalletId` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Recharge" DROP CONSTRAINT "Recharge_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_providerId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_walletId_fkey";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "preferredCurrency",
ADD COLUMN     "avatarPublicId" TEXT;

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "avatarPublicId" TEXT;

-- AlterTable
ALTER TABLE "ProviderService" DROP COLUMN "documentUrls",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneCountryIso" TEXT,
ADD COLUMN     "phoneDialCode" TEXT;

-- AlterTable
ALTER TABLE "Recharge" DROP COLUMN "walletId",
ADD COLUMN     "clientWalletId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "providerId",
ADD COLUMN     "providerServiceId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
DROP COLUMN "phoneCountryIso",
DROP COLUMN "phoneDialCode",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "amountBob",
DROP COLUMN "amountUsd",
DROP COLUMN "walletId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "providerWalletId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Wallet";

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneDialCode" TEXT NOT NULL,
    "phoneCountryIso" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderDocument" (
    "id" TEXT NOT NULL,
    "providerServiceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientWallet" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderWallet" (
    "id" TEXT NOT NULL,
    "providerServiceId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientContact_userId_key" ON "ClientContact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientContact_phone_key" ON "ClientContact"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ClientWallet_clientProfileId_key" ON "ClientWallet"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderWallet_providerServiceId_key" ON "ProviderWallet"("providerServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderDocument" ADD CONSTRAINT "ProviderDocument_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientWallet" ADD CONSTRAINT "ClientWallet_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderWallet" ADD CONSTRAINT "ProviderWallet_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_clientWalletId_fkey" FOREIGN KEY ("clientWalletId") REFERENCES "ClientWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_providerWalletId_fkey" FOREIGN KEY ("providerWalletId") REFERENCES "ProviderWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
