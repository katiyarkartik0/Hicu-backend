/*
  Warnings:

  - You are about to drop the column `comment_auto` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `dm_auto` on the `Automation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Automation" DROP COLUMN "comment_auto",
DROP COLUMN "dm_auto",
ADD COLUMN     "commentAutomationId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dmAutomationId" INTEGER NOT NULL DEFAULT 0;
