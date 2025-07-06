/*
  Warnings:

  - You are about to drop the column `action` on the `Automation` table. All the data in the column will be lost.
  - Added the required column `leads` to the `Automation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Automation" DROP COLUMN "action",
ADD COLUMN     "leads" JSONB NOT NULL;
