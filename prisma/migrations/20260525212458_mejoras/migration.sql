/*
  Warnings:

  - You are about to drop the column `billingRegion` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `ProviderServiceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeRateUsdBob` on the `SystemConfig` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Call` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ClientWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountUsd` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProviderWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "billingRegion";

-- AlterTable
ALTER TABLE "ClientWallet" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "amount",
ADD COLUMN     "amountUsd" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ProviderDocument" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProviderService" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "ProviderServiceProfile" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "ProviderWallet" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Recharge" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "commission" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "exchangeRateUsdBob";

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPurchase" (
    "id" TEXT NOT NULL,
    "providerWalletId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" "RechargeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- AddForeignKey
ALTER TABLE "ProviderPurchase" ADD CONSTRAINT "ProviderPurchase_providerWalletId_fkey" FOREIGN KEY ("providerWalletId") REFERENCES "ProviderWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPurchase" ADD CONSTRAINT "ProviderPurchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
