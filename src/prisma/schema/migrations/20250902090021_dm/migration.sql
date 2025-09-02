/*
  Warnings:

  - You are about to drop the column `text` on the `IgDm` table. All the data in the column will be lost.
  - Added the required column `messageText` to the `IgDm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgDm" DROP COLUMN "text",
ADD COLUMN     "messageText" TEXT NOT NULL;
