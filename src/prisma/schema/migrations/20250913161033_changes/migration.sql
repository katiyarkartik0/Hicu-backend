/*
  Warnings:

  - Added the required column `updatedAt` to the `IgCommentAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `automationId` to the `IgReactFlowNode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."IgCommentAutomation_mediaId_key";

-- AlterTable
ALTER TABLE "public"."IgCommentAutomation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."IgReactFlowEdge" ADD COLUMN     "igCommentAutomationId" INTEGER;

-- AlterTable
ALTER TABLE "public"."IgReactFlowNode" ADD COLUMN     "automationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgCommentAutomation" ADD CONSTRAINT "IgCommentAutomation_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."IgMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_igCommentAutomationId_fkey" FOREIGN KEY ("igCommentAutomationId") REFERENCES "public"."IgCommentAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNode" ADD CONSTRAINT "IgReactFlowNode_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "public"."IgCommentAutomation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
