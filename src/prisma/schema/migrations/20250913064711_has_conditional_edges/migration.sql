/*
  Warnings:

  - You are about to drop the column `hasConditionalNodes` on the `IgReactFlowNodeData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" DROP COLUMN "hasConditionalNodes",
ADD COLUMN     "hasConditionalEdges" BOOLEAN NOT NULL DEFAULT false;
