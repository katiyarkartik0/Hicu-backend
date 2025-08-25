/*
  Warnings:

  - You are about to drop the column `igFollowers` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igFollowing` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igPostCount` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igUserId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igUsername` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `IgComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IgMedia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."IgComment" DROP CONSTRAINT "IgComment_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IgComment" DROP CONSTRAINT "IgComment_mediaId_mediaOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IgComment" DROP CONSTRAINT "IgComment_parentCommentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IgMedia" DROP CONSTRAINT "IgMedia_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IgMedia" DROP CONSTRAINT "IgMedia_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."Account_igUserId_key";

-- DropIndex
DROP INDEX "public"."Account_igUsername_key";

-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "igFollowers",
DROP COLUMN "igFollowing",
DROP COLUMN "igPostCount",
DROP COLUMN "igUserId",
DROP COLUMN "igUsername";

-- DropTable
DROP TABLE "public"."IgComment";

-- DropTable
DROP TABLE "public"."IgMedia";
