export type SafetyScoreResult = {
  safetyScore: number;
  highlights: string[];
};

export type ActionState = {
  result?: SafetyScoreResult;
  error?: string;
  fieldErrors?: {
    from?: string[];
    to?: string[];
  };
} | null;
