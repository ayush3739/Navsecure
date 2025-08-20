export type SafetyScoreResult = {
  safetyScore: number;
  reasoning: string;
};

export type ActionState = {
  result?: SafetyScoreResult;
  error?: string;
  fieldErrors?: {
    from?: string[];
    to?: string[];
  };
} | null;
