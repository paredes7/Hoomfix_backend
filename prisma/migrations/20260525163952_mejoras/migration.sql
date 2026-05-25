/*
  Warnings:

  - You are about to drop the column `phoneDialCode` on the `ClientContact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneDialCode` on the `ProviderService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientContact" DROP COLUMN "phoneDialCode";

-- AlterTable
ALTER TABLE "ProviderService" DROP COLUMN "phoneDialCode";

-- CreateTable
CREATE TABLE "Country" (
    "iso" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("iso")
);

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_phoneCountryIso_fkey" FOREIGN KEY ("phoneCountryIso") REFERENCES "Country"("iso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_phoneCountryIso_fkey" FOREIGN KEY ("phoneCountryIso") REFERENCES "Country"("iso") ON DELETE SET NULL ON UPDATE CASCADE;
