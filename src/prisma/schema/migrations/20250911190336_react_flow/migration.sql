-- CreateTable
CREATE TABLE "public"."IgReactFlowEdge" (
    "edgeId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."IgReactFlowNode" (
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "dragging" BOOLEAN NOT NULL DEFAULT false,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "hasConditionalNodes" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."IgReactFlowNodeData" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "prototypeResponse" TEXT,
    "aiPrompt" TEXT,

    CONSTRAINT "IgReactFlowNodeData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IgReactFlowEdge_edgeId_key" ON "public"."IgReactFlowEdge"("edgeId");

-- CreateIndex
CREATE UNIQUE INDEX "IgReactFlowNode_nodeId_key" ON "public"."IgReactFlowNode"("nodeId");

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."IgReactFlowNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowEdge" ADD CONSTRAINT "IgReactFlowEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."IgReactFlowNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgReactFlowNodeData" ADD CONSTRAINT "IgReactFlowNodeData_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."IgReactFlowNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
