export type SafetyScoreResult = {
  allRoutes: {
    safetyScore: number;
    highlights: string[];
  }[];
  from?: string;
  to?: string;
  safestRouteIndex?: number;
};

export type ActionState = {
  result?: SafetyScoreResult;
  error?: string;
  fieldErrors?: {
    from?: string[];
    to?: string[];
  };
} | null;
