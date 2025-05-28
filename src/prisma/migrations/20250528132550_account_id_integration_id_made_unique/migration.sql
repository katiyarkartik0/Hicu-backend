/*
  Warnings:

  - A unique constraint covering the columns `[accountId,integrationId]` on the table `AccountIntegration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccountIntegration_accountId_integrationId_key" ON "AccountIntegration"("accountId", "integrationId");
