/*
  Warnings:

  - You are about to drop the `AccountIntegration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountIntegration" DROP CONSTRAINT "AccountIntegration_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountIntegration" DROP CONSTRAINT "AccountIntegration_integrationId_fkey";

-- DropTable
DROP TABLE "AccountIntegration";

-- CreateTable
CREATE TABLE "Configurations" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "Configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configurations_accountId_integrationId_key" ON "Configurations"("accountId", "integrationId");

-- AddForeignKey
ALTER TABLE "Configurations" ADD CONSTRAINT "Configurations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configurations" ADD CONSTRAINT "Configurations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
