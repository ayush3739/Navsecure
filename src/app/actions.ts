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
    const routeData = `A route from "${from}" to "${to}" during the evening.`;
    const availableDatasets = ['City Crime Statistics (2023)', 'Public Lighting Grid', 'Real-time Traffic Data', 'Safe Spot Locations'];

    const result = await generateSafetyScore({
      routeData,
      availableDatasets,
    });

    return { result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate safety score. Please try again.' };
  }
}
