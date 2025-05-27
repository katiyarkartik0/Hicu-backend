/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Integration_name_key" ON "Integration"("name");
