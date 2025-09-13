/*
  Warnings:

  - Added the required column `mediaId` to the `IgReactFlowNodeData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" ADD COLUMN     "mediaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNodeData" ADD CONSTRAINT "IgReactFlowNodeData_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."IgMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
