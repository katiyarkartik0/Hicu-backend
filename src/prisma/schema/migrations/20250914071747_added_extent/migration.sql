-- CreateEnum
CREATE TYPE "public"."IgReactFlowNodeExtent" AS ENUM ('parent');

-- AlterTable
ALTER TABLE "public"."IgReactFlowNode" ADD COLUMN     "extent" "public"."IgReactFlowNodeExtent";
