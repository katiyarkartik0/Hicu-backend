import type { IgCommentAutomation } from 'src/automations/automations.types';
import { Leads as LeadsAsked } from 'src/leads/dto/create-lead.dto';
import { Prospect } from 'src/prospects/dto/create-prospect.dto';
import { IgAccount } from 'src/webhook/types/me.types';

export type ProspectIG = {
  username?: string;
  userId: string;
};

type SanitizedCommentPayload = {
  comment: {
    commentId: string;
    commenterUsername: string;
    commenterId: string;
    commentText: string;
    mediaOwnerId: string;
    mediaId: string;
    parentCommentId: string | null;
    isReply: boolean;
    timestamp: string;
  };
  media: {
    mediaOwnerId: string;
    mediaId: string;
  };
};

type ServiceContext = {
  name: string; // The function name (e.g., "fetchProductByTitle")
  description: string; // A brief explanation of what the service does
  input: string[]; // Expected input fields (e.g., ["title"])
  output: string; // A description of what the service returns
};

type ConversationHistory = {
  prospect: { message: string; createdTime: string }[];
  account: { message: string; createdTime: string }[];
};

export interface CommentLlmGraphState {
  conversationHistory: ConversationHistory;
  services: ServiceContext[];
  commentPayload: SanitizedCommentPayload;
  igAccount: IgAccount;
  prospect: GraphStateProspect;
  leadsAsked: Omit<LeadsAsked, 'accountId'>;
  accountId: number;
  error?: string;
  igCommentAutomation: IgCommentAutomation;
}

type GraphStateProspect = Omit<Prospect, 'username' | 'accountId'> & {
  username?: string | null;
  accountId?: number;
};

// node-types.ts
export type NodeType =
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

// export type HandlerFn<T = CommentLlmGraphState> = (state: T) => Promise<any> | any;

export type NodeCallback = (state: CommentLlmGraphState) => Promise<string | string[]>;

export type HandlerFn = (services: {
  geminiService: any;
  pineconeService: any;
  instagramService: any;
  conditionalEdgesToNodes?: Record<string, string>;
}) => NodeCallback;

export interface IgCommentAutomationWithFlow {
  id: number;
  name?: string | null;
  isActive: boolean;
  mediaId: string;
  commentAutomationId: number;
  accountId: number;
  createdAt: Date;   // ✅ Prisma returns Date
  updatedAt: Date;

  nodes: IgReactFlowNode[];
  edges: IgReactFlowEdge[];
}

export interface IgReactFlowNode {
  nodeId: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  parentId: string | null;
  extent: string | null;
  dragging: boolean;
  selected: boolean;
  createdAt: Date;   // ✅ Date instead of string
  updatedAt: Date;
  accountId: number;
  mediaId: string;
  automationId: number;
  data: IgReactFlowNodeData; // ✅ Prisma can return null
}

export interface IgReactFlowNodeData {
  accountId: number;
  nodeId: string;
  nodeType: NodeType;
  label: string;
  description: string;
  prototypeResponse: string | null;
  aiPrompt: string | null;
  hasConditionalEdges: boolean;
  mediaId: string;
  automationId: number;
  parentId: string | null;
  conditionalEdgesToNodes?: any; // 👈 NEW
}

export interface IgReactFlowEdge {
  accountId: number;
  edgeId: string;
  sourceId: string;
  targetId: string;
  createdAt: Date;   // ✅ Date
  updatedAt: Date;
  mediaId: string;
  automationId: number;
}

export type NodesAndEdges = {
  nodes: (Omit<IgReactFlowNode, 'type'> & {
    type: NodeType; // <-- narrow type
    data: IgReactFlowNodeData | null;
  })[];
  edges: IgReactFlowEdge[];
};