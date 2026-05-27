/*
  Warnings:

  - You are about to drop the column `phone` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the column `phoneCountryIso` on the `ProviderService` table. All the data in the column will be lost.
  - You are about to drop the `ClientContact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `countryIso` to the `ClientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ClientWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryIso` to the `ProviderService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ProviderWallet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientContact" DROP CONSTRAINT "ClientContact_phoneCountryIso_fkey";

-- DropForeignKey
ALTER TABLE "ClientContact" DROP CONSTRAINT "ClientContact_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProviderService" DROP CONSTRAINT "ProviderService_phoneCountryIso_fkey";

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "countryIso" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ClientWallet" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProviderService" DROP COLUMN "phone",
DROP COLUMN "phoneCountryIso",
ADD COLUMN     "countryIso" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProviderWallet" ADD COLUMN     "currency" TEXT NOT NULL;

-- DropTable
DROP TABLE "ClientContact";

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderContact" (
    "id" TEXT NOT NULL,
    "providerServiceId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phone_key" ON "Contact"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderContact_phone_key" ON "ProviderContact"("phone");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_countryIso_fkey" FOREIGN KEY ("countryIso") REFERENCES "Country"("iso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderContact" ADD CONSTRAINT "ProviderContact_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_countryIso_fkey" FOREIGN KEY ("countryIso") REFERENCES "Country"("iso") ON DELETE RESTRICT ON UPDATE CASCADE;
