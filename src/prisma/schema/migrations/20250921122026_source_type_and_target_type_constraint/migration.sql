/*
  Warnings:

  - Made the column `sourceType` on table `IgReactFlowEdge` required. This step will fail if there are existing NULL values in that column.
  - Made the column `targetType` on table `IgReactFlowEdge` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowEdge" ALTER COLUMN "sourceType" SET NOT NULL,
ALTER COLUMN "targetType" SET NOT NULL;
