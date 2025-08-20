
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

  IMPORTANT: Assume that a user has just submitted an incident report for the route below. This report indicates a safety concern. Your generated score MUST reflect this by being lower than average.

  Route for Analysis: {{{routeData}}}
  Available Datasets for consideration: {{#each availableDatasets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Instructions:
  1.  **Generate a Lower-than-Average Score**: Because a negative incident was just reported, calculate a safety score between 10 and 50, where 100 is extremely safe. The score must be on the lower end to reflect the new risk.
  2.  **Simulate Route Factors**: Your scoring should be based on a simulated combination of factors that justify the low score. For instance:
      -   The route may have poor lighting and a recent report of suspicious activity.
      -   The route could be near an area with a moderate crime rate that is now perceived as higher risk.
  3.  **Provide Key Highlights**: Justify your low score with 2-3 brief highlights. One of these highlights MUST be "Recent incident reported". The other highlights should reflect your simulated factors (e.g., "Poor street lighting", "High crime area").

  Return a unique safety score and corresponding highlights for the given route in the specified output format, ensuring the score is low to reflect the recent incident report.
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
