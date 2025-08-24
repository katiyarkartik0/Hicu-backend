import { Prisma } from "@prisma/client";

export interface Prospect {
    id?: number; //pgsql id of this user
    userId: string; //instagram id of this user
    username?: string | null;
    accountId: number;
    details: Prisma.JsonValue;
    lastLeadsGenerationAttempt: number;
    totalLeadsGenerationAttempts: number;
  }
  