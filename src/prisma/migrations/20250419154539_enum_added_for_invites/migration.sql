/*
  Warnings:

  - Changed the type of `status` on the `AccountMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'REMOVED');

-- AlterTable
ALTER TABLE "AccountMember" DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL;
