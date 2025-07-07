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
  username?: string;
  accountId?: number;
};
