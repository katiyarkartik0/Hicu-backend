/*
  Warnings:

  - You are about to drop the column `igFollowers` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igFollowing` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `igPostCount` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "igFollowers",
DROP COLUMN "igFollowing",
DROP COLUMN "igPostCount",
ADD COLUMN     "igAccountType" TEXT,
ADD COLUMN     "igBiography" TEXT,
ADD COLUMN     "igFollowersCount" INTEGER,
ADD COLUMN     "igFollowingCount" INTEGER,
ADD COLUMN     "igMediaCount" INTEGER,
ADD COLUMN     "igName" TEXT,
ADD COLUMN     "igProfilePictureUrl" TEXT;
