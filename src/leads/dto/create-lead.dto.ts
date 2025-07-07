export type Leads = {
  id?: number;
  accountId: number;
  requirements: string[];
  maxGenerationAttemptsPerProspect: number;
  minGapBetweenPerGenerationAttempt: number; // also in ms
};
