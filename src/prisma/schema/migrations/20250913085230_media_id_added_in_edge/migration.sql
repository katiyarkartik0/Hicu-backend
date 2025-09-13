/*
  Warnings:

  - Added the required column `mediaId` to the `IgReactFlowEdge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowEdge" ADD COLUMN     "mediaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."IgMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
