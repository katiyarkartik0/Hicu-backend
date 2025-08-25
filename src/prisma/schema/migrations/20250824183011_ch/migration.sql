/*
  Warnings:

  - The primary key for the `IgMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ownerId` on the `IgMedia` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `IgMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."IgComment" DROP CONSTRAINT "IgComment_mediaId_mediaOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IgMedia" DROP CONSTRAINT "IgMedia_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."IgMedia" DROP CONSTRAINT "IgMedia_pkey",
DROP COLUMN "ownerId";

-- CreateIndex
CREATE UNIQUE INDEX "IgMedia_id_key" ON "public"."IgMedia"("id");

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."IgMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
