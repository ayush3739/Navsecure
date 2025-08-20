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
  reasoning: z.string().describe('Explanation of how the safety score was calculated.'),
});
export type GenerateSafetyScoreOutput = z.infer<typeof GenerateSafetyScoreOutputSchema>;

export async function generateSafetyScore(input: GenerateSafetyScoreInput): Promise<GenerateSafetyScoreOutput> {
  return generateSafetyScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafetyScorePrompt',
  input: {schema: GenerateSafetyScoreInputSchema},
  output: {schema: GenerateSafetyScoreOutputSchema},
  prompt: `You are an AI assistant that generates a safety score for a given route based on available datasets.

  Input route data: {{{routeData}}}
  Available datasets: {{#each availableDatasets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Based on the route data and available datasets, calculate a safety score and explain your reasoning. The safety score should be a number between 0 and 100, where 100 is the safest.
  Consider factors such as:
    - Crime rates in the area
    - Street lighting
    - Traffic conditions
    - Population density
    - Time of day

  Return the safety score and your reasoning in the output format specified. Adhere to the output schema description when generating the reasoning.
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
