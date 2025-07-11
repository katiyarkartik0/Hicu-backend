export interface Prospect {
    id?: number; //pgsql id of this user
    userId: string; //instagram id of this user
    username?: string | null;
    accountId: number;
    details: Record<string, any>;
    lastLeadsGenerationAttempt: number;
    totalLeadsGenerationAttempts: number;
  }
  