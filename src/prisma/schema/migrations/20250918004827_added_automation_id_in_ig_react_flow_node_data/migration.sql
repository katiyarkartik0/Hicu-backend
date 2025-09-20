/*
  Warnings:

  - Added the required column `automationId` to the `IgReactFlowNodeData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" ADD COLUMN     "automationId" INTEGER NOT NULL;
