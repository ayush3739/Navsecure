'use server';

import { generateSafetyScore } from '@/ai/flows/generate-safety-score';
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
      generateSafetyScore({ routeData: `Route 1 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting'] }),
      generateSafetyScore({ routeData: `Route 2 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting'] }),
      generateSafetyScore({ routeData: `Route 3 from "${from}" to "${to}"`, availableDatasets: ['Crime Stats', 'Lighting'] }),
    ]);

    // Find the route with the highest safety score
    let safestRouteIndex = 0;
    let highestScore = -1;
    routeAnalyses.forEach((result, index) => {
      if (result.safetyScore > highestScore) {
        highestScore = result.safetyScore;
        safestRouteIndex = index;
      }
    });
    
    // We are returning the from/to here so the map can use it to render the route
    return { result: { allRoutes: routeAnalyses, from, to, safestRouteIndex } };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate safety score. Please try again.' };
  }
}
