/*
  Warnings:

  - A unique constraint covering the columns `[accountId,userId]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prospect_accountId_userId_key" ON "Prospect"("accountId", "userId");
