/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Leads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Leads_accountId_key" ON "Leads"("accountId");
