/*
  Warnings:

  - Added the required column `lastLeadsGenerationAttempt` to the `Prospect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLeadsGenerationAttempts` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "lastLeadsGenerationAttempt" INTEGER NOT NULL,
ADD COLUMN     "totalLeadsGenerationAttempts" INTEGER NOT NULL;
