/*
  Warnings:

  - Added the required column `nodeType` to the `IgReactFlowNodeData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" ADD COLUMN     "nodeType" TEXT NOT NULL;
