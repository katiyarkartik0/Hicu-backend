/*
  Warnings:

  - The primary key for the `IgReactFlowNodeData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `IgReactFlowNodeData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nodeId]` on the table `IgReactFlowNodeData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nodeId` to the `IgReactFlowNodeData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."IgReactFlowNodeData" DROP CONSTRAINT "IgReactFlowNodeData_id_fkey";

-- AlterTable
ALTER TABLE "public"."IgReactFlowNodeData" DROP CONSTRAINT "IgReactFlowNodeData_pkey",
DROP COLUMN "id",
ADD COLUMN     "nodeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IgReactFlowNodeData_nodeId_key" ON "public"."IgReactFlowNodeData"("nodeId");

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNodeData" ADD CONSTRAINT "IgReactFlowNodeData_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."IgReactFlowNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
