/*
  Warnings:

  - A unique constraint covering the columns `[igUserId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[igUsername]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "igFollowers" INTEGER,
ADD COLUMN     "igFollowing" INTEGER,
ADD COLUMN     "igPostCount" INTEGER,
ADD COLUMN     "igUserId" TEXT,
ADD COLUMN     "igUsername" TEXT;

-- CreateTable
CREATE TABLE "public"."IgComment" (
    "accountId" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isReply" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "mediaOwnerId" TEXT NOT NULL,
    "parentCommentId" TEXT,

    CONSTRAINT "IgComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IgMedia" (
    "accountId" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IgMedia_pkey" PRIMARY KEY ("id","ownerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUserId_key" ON "public"."Account"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUsername_key" ON "public"."Account"("igUsername");

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_mediaId_mediaOwnerId_fkey" FOREIGN KEY ("mediaId", "mediaOwnerId") REFERENCES "public"."IgMedia"("id", "ownerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."IgComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgMedia" ADD CONSTRAINT "IgMedia_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Account"("igUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgMedia" ADD CONSTRAINT "IgMedia_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
