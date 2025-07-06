/*
  Warnings:

  - Made the column `username` on table `Prospect` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "username" SET NOT NULL;
