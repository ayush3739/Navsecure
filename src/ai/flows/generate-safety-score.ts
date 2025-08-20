
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
  prompt: `You are an AI assistant that generates a safety score for a given route. Your task is to act as a safety analysis engine.

  For the given input, you must simulate a realistic safety profile. Do not use a fixed score. Instead, generate a dynamic score based on a fictional but plausible assessment of the route's characteristics.

  IMPORTANT: Assume that a user has just submitted an incident report for the route below. This report indicates a safety concern. Your generated score MUST reflect this by being lower than it would otherwise be.

  Route for Analysis: {{{routeData}}}
  Available Datasets for consideration: {{#each availableDatasets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Instructions:
  1.  **Simulate Route Factors**: First, determine a baseline safety score by simulating a combination of factors. For instance:
      -   A route with good lighting, CCTV, and low crime might have a baseline score of 85.
      -   A route with poor lighting and proximity to a high-crime area might have a baseline of 60.
  2.  **Apply a Small Penalty for the Incident**: Because a negative incident was just reported, you MUST reduce your calculated baseline score by a small but meaningful amount (e.g., 5% to 15%). The penalty should be justifiable. For example, "Suspicious activity" might warrant a 10-15% reduction, while "Damaged pavement" might only be a 5% reduction.
  3.  **Provide Key Highlights**: Justify your final score with 2-3 brief highlights. One of these highlights MUST be "Recent incident reported". The other highlights should reflect your simulated factors (e.g., "Poor street lighting", "High crime area").

  Return a unique safety score and corresponding highlights for the given route in the specified output format, ensuring the score is slightly lower to reflect the recent incident report. For example, if the baseline was 85, a final score might be 76.
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
