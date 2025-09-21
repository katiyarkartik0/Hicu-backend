export interface IgCommentAutomationWithFlow {
  id: number;
  name?: string | null;
  isActive: boolean;
  mediaId: string;
  commentAutomationId: number;
  accountId: number;
  createdAt: Date; // ✅ Prisma returns Date
  updatedAt: Date;

  nodes: IgReactFlowNode[];
  edges: IgReactFlowEdge[];
}

export interface IgReactFlowNode {
  nodeId: string;
  type: string;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  parentId: string | null;
  extent: string | null;
  dragging: boolean;
  selected: boolean;
  createdAt: Date; // ✅ Date instead of string
  updatedAt: Date;
  accountId: number;
  mediaId: string;
  automationId: number;
  data: IgReactFlowNodeData | null; // ✅ Prisma can return null
}

export interface IgReactFlowNodeData {
  accountId: number;
  nodeId: string;
  nodeType: string;
  label: string;
  description: string;
  prototypeResponse: string | null;
  aiPrompt: string | null;
  hasConditionalEdges: boolean;
  mediaId: string;
  automationId: number;
  conditionalEdgesToNodes?: any; // 👈 NEW
}

export interface IgReactFlowEdge {
  accountId: number;
  edgeId: string;
  sourceId: string;
  targetId: string;
  createdAt: Date; // ✅ Date
  updatedAt: Date;
  mediaId: string;
  automationId: number;
  sourceType: string;
  targetType: string;
}

export type NodesAndEdges = {
  nodes: (Omit<IgReactFlowNode, 'type'> & {
    type: IgReactFlowNodeType; // <-- narrow type
    data: IgReactFlowNodeData | null;
  })[];
  edges: IgReactFlowEdge[];
};

// node-types.ts
export type IgReactFlowNodeType =
  | '__start__'
  | '__end__'
  | 'route'
  | 'aiRouter'
  // DM
  | 'dmAiVectorDb'
  | 'dmAi'
  | 'dmManual'
  // Comments
  | 'commentReplyAiVectorDb'
  | 'commentReplyAi'
  | 'commentReplyManual';