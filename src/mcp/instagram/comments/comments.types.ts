import type {
  Automation,
  IgCommentAutomation,
  LeadsAsked,
} from 'src/automations/automations.types';

export type AccountIG = {
  username?: string;
  userId: string; //instagram id of this user
};

export type ProspectIG = {
  username?: string;
  userId: string;
};

export type Prospect = {
  id?: number; //pgsql id of this user
  userId: string; //instagram id of this user
  username?: string;
  accountId?: number;
  details: string[];
  lastLeadsGenerationAttempt: number;
  totalLeadsGenerationAttempts: number;
};

export type Leads = {
  details: Record<string, any>;
  requirements: string[];
  maxGenerationAttempts: number;
  totalAttempts: number;
  lastAttempt: number; // store as milliseconds (Date.now())
  minGapBetweenGeneration: number; // also in ms
};

export type SanitizedCommentPayload = {
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

export type ServiceContext = {
  name: string; // The function name (e.g., "fetchProductByTitle")
  description: string; // A brief explanation of what the service does
  input: string[]; // Expected input fields (e.g., ["title"])
  output: string; // A description of what the service returns
};

export type ConversationHistory = {
  prospect: { message: string; createdTime: string }[];
  account: { message: string; createdTime: string }[];
};

export interface CommentLlmGraphState {
  history: ConversationHistory;
  services: ServiceContext[];
  commentPayload: SanitizedCommentPayload;
  accountIg: AccountIG;
  prospect: Prospect;
  leadsAsked: LeadsAsked;
  accountId: number;
  error?: string;
  igCommentAutomation: IgCommentAutomation;
}
