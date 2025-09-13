/*
  Warnings:

  - Added the required column `mediaId` to the `IgReactFlowNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNode" ADD COLUMN     "mediaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNode" ADD CONSTRAINT "IgReactFlowNode_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."IgMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
