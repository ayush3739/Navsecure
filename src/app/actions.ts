'use server';

import { generateSafetyScore } from '@/ai/flows/generate-safety-score';
import { submitIncidentReport } from '@/ai/flows/submit-incident-report';
import type { ActionState } from '@/lib/types';
import { z } from 'zod';

const routeSchema = z.object({
  from: z.string().min(3, 'Please enter a valid starting location.'),
  to: z.string().min(3, 'Please enter a valid destination.'),
});

export async function getSafetyScoreAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationResult = routeSchema.safeParse({
    from: formData.get('from'),
    to: formData.get('to'),
  });

  if (!validationResult.success) {
    return {
      error: 'Invalid input.',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { from, to } = validationResult.data;

  try {
    // In a real app, you'd get multiple route options from the Maps API first,
    // then send them to the AI to be scored.
    // For this demo, we'll simulate scoring 3 potential routes.
    const routeAnalyses = await Promise.all([
      generateSafetyScore({ routeData: `Route 1 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting', 'CCTV'] }),
      generateSafetyScore({ routeData: `Route 2 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting', 'CCTV'] }),
      generateSafetyScore({ routeData: `Route 3 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting', 'CCTV'] }),
    ]);

    // Sort routes from safest to least safe
    const sortedRoutes = routeAnalyses
      .map((route, index) => ({ ...route, originalIndex: index }))
      .sort((a, b) => b.safetyScore - a.safetyScore);

    // We are returning the from/to here so the map can use it to render the route
    return { result: { allRoutes: sortedRoutes, from, to } };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate safety score. Please try again.' };
  }
}

const incidentSchema = z.object({
  location: z.string().min(3, 'Please enter a valid location.'),
  reason: z.string().min(3, 'Please select a reason.'),
  description: z.string().optional(),
});

export async function submitIncidentReportAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
    const validationResult = incidentSchema.safeParse({
    location: formData.get('location'),
    reason: formData.get('reason'),
    description: formData.get('description'),
  });

  if (!validationResult.success) {
    return {
      error: 'Invalid input.',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await submitIncidentReport(validationResult.data);
    return { result: { confirmation: result } };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to submit report. Please try again.' };
  }
}
