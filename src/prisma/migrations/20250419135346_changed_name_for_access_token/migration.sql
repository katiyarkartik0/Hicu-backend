/*
  Warnings:

  - You are about to drop the column `instaAccessToken` on the `Account` table. All the data in the column will be lost.
  - Added the required column `providerAccessToken` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "instaAccessToken",
ADD COLUMN     "providerAccessToken" TEXT NOT NULL;
