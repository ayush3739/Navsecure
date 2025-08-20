
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

  Route for Analysis: {{{routeData}}}
  Available Datasets for consideration: {{#each availableDatasets}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Instructions:
  1.  **Generate a Dynamic Score**: Calculate a safety score between 0 and 100, where 100 is extremely safe. Each route should have a different score. For example, if you are asked to score three routes, produce three distinct and varied scores.
  2.  **Simulate Route Factors**: Your scoring should be based on a simulated combination of factors. Imagine what the conditions might be like. For instance:
      -   **Route 1** might have good lighting but pass through an area with a moderate crime rate.
      -   **Route 2** could be poorly lit but have a visible police presence and CCTV.
      -   **Route 3** may be well-lit, have low crime, and be near a hospital.
  3.  **Provide Key Highlights**: Justify your score with 2-3 brief highlights. These should reflect your simulated factors (e.g., "Well-lit streets", "High crime area", "CCTV coverage", "No police stations nearby").

  Return a unique safety score and corresponding highlights for the given route in the specified output format.
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
