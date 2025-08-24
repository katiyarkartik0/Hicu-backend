/*
  Warnings:

  - Added the required column `accountId` to the `IgComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `IgMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgComment" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."IgMedia" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgMedia" ADD CONSTRAINT "IgMedia_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
