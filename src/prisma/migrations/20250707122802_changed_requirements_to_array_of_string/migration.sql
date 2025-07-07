/*
  Warnings:

  - The `requirements` column on the `Leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `details` on the `Prospect` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Leads" DROP COLUMN "requirements",
ADD COLUMN     "requirements" TEXT[];

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "details",
ADD COLUMN     "details" JSONB NOT NULL;
