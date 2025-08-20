export type SafetyScoreResult = {
  allRoutes: {
    safetyScore: number;
    highlights: string[];
    originalIndex: number;
  }[];
  from: string;
  to: string;
};

export type IncidentReportResult = {
  confirmation: {
    confirmationId: string;
    message: string;
  }
}

export type ActionState = {
  result?: SafetyScoreResult | IncidentReportResult;
  error?: string;
  fieldErrors?: {
    from?: string[];
    to?: string[];
    location?: string[];
    reason?: string[];
  };
} | null;
