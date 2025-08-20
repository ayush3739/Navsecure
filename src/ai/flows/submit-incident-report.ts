
'use server';

/**
 * @fileOverview This file defines a Genkit flow for submitting an incident report.
 *
 * - submitIncidentReport - A function that takes report data and returns a confirmation.
 * - SubmitIncidentReportInput - The input type for the submitIncidentReport function.
 * - SubmitIncidentReportOutput - The return type for the submitIncidentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubmitIncidentReportInputSchema = z.object({
  location: z.string().describe('The location of the incident.'),
  reason: z.string().describe('The reason for the report (e.g., "Poor lighting", "Suspicious activity").'),
  description: z.string().optional().describe('A more detailed description of the incident.'),
});
export type SubmitIncidentReportInput = z.infer<typeof SubmitIncidentReportInputSchema>;

const SubmitIncidentReportOutputSchema = z.object({
  confirmationId: z.string().describe('A unique ID for the submitted report.'),
  message: z.string().describe('A confirmation message to the user.'),
});
export type SubmitIncidentReportOutput = z.infer<typeof SubmitIncidentReportOutputSchema>;

export async function submitIncidentReport(input: SubmitIncidentReportInput): Promise<SubmitIncidentReportOutput> {
  return submitIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'submitIncidentReportPrompt',
  input: {schema: SubmitIncidentReportInputSchema},
  output: {schema: SubmitIncidentReportOutputSchema},
  prompt: `You are an AI assistant that processes incident reports for a safety app. A user has submitted the following report:

  Location: {{{location}}}
  Reason: {{{reason}}}
  Description: {{{description}}}

  Your task is to:
  1.  Acknowledge the report.
  2.  Generate a unique confirmation ID for the report.
  3.  Provide a thank you message to the user, letting them know the data will be used to improve safety scores.
  
  In a real application, this submission would trigger a process to verify the report and adjust safety data for the specified location. For now, just generate the confirmation.
`,
});

const submitIncidentReportFlow = ai.defineFlow(
  {
    name: 'submitIncidentReportFlow',
    inputSchema: SubmitIncidentReportInputSchema,
    outputSchema: SubmitIncidentReportOutputSchema,
  },
  async input => {
    // In a real app, you would save the incident to a database here.
    // For this demo, we'll just have the AI generate a confirmation.
    const {output} = await prompt(input);
    return output!;
  }
);
