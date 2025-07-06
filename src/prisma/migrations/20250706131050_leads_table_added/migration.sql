/*
  Warnings:

  - Added the required column `leadsGenerationAttempt` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "leadsGenerationAttempt" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Leads" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "requirements" JSONB NOT NULL,
    "maxGenerationAttemptsPerProspect" INTEGER NOT NULL,
    "minGapBetweenPerGenerationAttempt" INTEGER NOT NULL,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
