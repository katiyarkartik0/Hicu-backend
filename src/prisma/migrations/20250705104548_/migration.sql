/*
  Warnings:

  - You are about to drop the `UserProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_automationId_fkey";

-- DropTable
DROP TABLE "UserProgress";

-- CreateTable
CREATE TABLE "Prospect" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "accountId" INTEGER NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
