/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `IgDmAutomation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IgDmAutomation_accountId_key" ON "IgDmAutomation"("accountId");
