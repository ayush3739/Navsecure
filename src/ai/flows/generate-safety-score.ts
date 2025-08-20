
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a safety score for potential routes.
 *
 * - generateSafetyScore - A function that takes route data and returns a safety score.
 * - GenerateSafetyScoreInput - The input type for the generateSafetyScore function.
 * - GenerateSafetyScoreOutput - The return type for the generateSafetyScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafetyScoreInputSchema = z.object({
  routeData: z.string().describe('Data representing the route, including location data, time of day, and other relevant factors.'),
  availableDatasets: z.array(z.string()).describe('A list of available datasets that can be used to calculate the safety score.'),
});
export type GenerateSafetyScoreInput = z.infer<typeof GenerateSafetyScoreInputSchema>;

const GenerateSafetyScoreOutputSchema = z.object({
  safetyScore: z.number().describe('A numerical score representing the safety of the route (higher is safer).'),
  highlights: z.array(z.string()).describe('A list of 2-3 key factors or highlights in a few words (e.g., "Police station nearby", "Poor street lighting") that influenced the safety score.'),
});
export type GenerateSafetyScoreOutput = z.infer<typeof GenerateSafetyScoreOutputSchema>;

export async function generateSafetyScore(input: GenerateSafetyScoreInput): Promise<GenerateSafetyScoreOutput> {
  return generateSafetyScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafetyScorePrompt',
  input: {schema: GenerateSafetyScoreInputSchema},
  output: {schema: GenerateSafetyScoreOutputSchema},
  prompt: `You are an AI assistant that generates a safety score for a given route. Your task is to act as a creative safety analysis engine.

  For the given input, you must simulate a realistic and **unique** safety profile. Do not use a fixed score. Instead, generate a dynamic score based on a fictional but plausible assessment of the route's characteristics.

  **IMPORTANT**: To ensure variability, you must come up with a creative and different set of circumstances for each route you analyze. The scores should not be the same.

  Route for Analysis: {{{routeData}}}
  Available Datasets for consideration: {{#each availableDatasets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Instructions:
  1.  **Simulate Unique Route Factors**: First, determine a baseline safety score by simulating a combination of fictional factors. Be creative. For instance:
      -   Route A might be well-lit, pass a university campus, but have a recently reported "suspicious person" incident. Baseline: 80.
      -   Route B might go through a deserted industrial park with known poor lighting, but has a police station nearby. Baseline: 65.
      -   Route C could be a busy main road with heavy traffic (which can be a safety factor) and a report of a "road rage" incident. Baseline: 70.
  2.  **Apply a Penalty for an Incident**: A negative incident has just been reported for the route. You MUST reduce your calculated baseline score by a small but meaningful amount (e.g., 5% to 15%). The penalty should be justifiable.
  3.  **Provide Key Highlights**: Justify your final score with 2-3 brief highlights. One of these highlights MUST be "Recent incident reported". The other highlights should reflect your simulated factors (e.g., "Poor street lighting", "University campus nearby").

  Return a unique safety score and corresponding highlights for the given route in the specified output format. The final scores for different routes should be different. For example: 82, 65, 73.
`,
});

const generateSafetyScoreFlow = ai.defineFlow(
  {
    name: 'generateSafetyScoreFlow',
    inputSchema: GenerateSafetyScoreInputSchema,
    outputSchema: GenerateSafetyScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
