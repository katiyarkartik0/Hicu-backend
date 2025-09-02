import { IgAccount } from 'src/webhook/types/me.types';
import { Prospect } from 'src/prospects/dto/create-prospect.dto';
import { Leads as LeadsAsked } from 'src/leads/dto/create-lead.dto';
import { IgDmAutomation } from 'src/automations/automations.types';

export type SanitizedDmPayload = {
  dm: {
    senderId: string;
    recipientId: string;
    messageId: string;
    messageText: string;
    timestamp: string;
  };
};

export interface DmLlmGraphState {
  conversationHistory: ConversationHistory;
  services: ServiceContext[];
  dmPayload: SanitizedDmPayload;
  igAccount: IgAccount;
  prospect: GraphStateProspect;
  leadsAsked: Omit<LeadsAsked, 'accountId'>;
  accountId: number;
  error?: string;
  igDmAutomation: IgDmAutomation | null;
}

type ConversationHistory = {
  prospect: { message: string; createdTime: string }[];
  account: { message: string; createdTime: string }[];
};

type ServiceContext = {
  name: string; // The function name (e.g., "fetchProductByTitle")
  description: string; // A brief explanation of what the service does
  input: string[]; // Expected input fields (e.g., ["title"])
  output: string; // A description of what the service returns
};

type GraphStateProspect = Omit<Prospect, 'username' | 'accountId'> & {
  username?: string;
  accountId?: number;
};