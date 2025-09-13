/*
  Warnings:

  - You are about to drop the column `hasConditionalNodes` on the `IgReactFlowNode` table. All the data in the column will be lost.
  - Made the column `width` on table `IgReactFlowNode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `IgReactFlowNode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `label` on table `IgReactFlowNodeData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `IgReactFlowNodeData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNode" DROP COLUMN "hasConditionalNodes",
ALTER COLUMN "width" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" ADD COLUMN     "hasConditionalNodes" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "label" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
