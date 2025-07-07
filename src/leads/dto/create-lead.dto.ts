export type Leads = {
  id?: number;
  requirements: string[];
  maxGenerationAttemptsPerProspect: number;
  minGapBetweenPerGenerationAttempt: number; // also in ms
};
