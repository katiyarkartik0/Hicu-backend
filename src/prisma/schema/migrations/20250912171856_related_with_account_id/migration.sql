/*
  Warnings:

  - Added the required column `accountId` to the `IgReactFlowEdge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `IgReactFlowNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `IgReactFlowNodeData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IgReactFlowEdge" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."IgReactFlowNode" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNode" ADD CONSTRAINT "IgReactFlowNode_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNodeData" ADD CONSTRAINT "IgReactFlowNodeData_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
