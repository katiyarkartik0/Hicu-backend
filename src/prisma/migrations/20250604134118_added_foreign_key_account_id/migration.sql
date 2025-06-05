/*
  Warnings:

  - Added the required column `accountId` to the `Automation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
