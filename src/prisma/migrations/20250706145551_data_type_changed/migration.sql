/*
  Warnings:

  - The `details` column on the `Prospect` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "details",
ADD COLUMN     "details" TEXT[];
