/*
  Warnings:

  - A unique constraint covering the columns `[mediaId]` on the table `Automation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Automation_mediaId_key" ON "Automation"("mediaId");
