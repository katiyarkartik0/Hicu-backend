/*
  Warnings:

  - You are about to drop the column `igCommentAutomationId` on the `IgReactFlowEdge` table. All the data in the column will be lost.
  - Added the required column `automationId` to the `IgReactFlowEdge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."IgReactFlowEdge" DROP CONSTRAINT "IgReactFlowEdge_igCommentAutomationId_fkey";

-- AlterTable
ALTER TABLE "public"."IgReactFlowEdge" DROP COLUMN "igCommentAutomationId",
ADD COLUMN     "automationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "public"."IgCommentAutomation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
