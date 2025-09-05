'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing insights into appointment cancellations.
 *
 * - cancellationInsights - An async function that takes cancellation data and returns insights.
 * - CancellationInsightsInput - The input type for the cancellationInsights function.
 * - CancellationInsightsOutput - The return type for the cancellationInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CancellationInsightsInputSchema = z.object({
  cancellationData: z.string().describe('A description of appointment cancellations, including dates, times, client information, and any cancellation reasons provided.'),
});
export type CancellationInsightsInput = z.infer<typeof CancellationInsightsInputSchema>;

const CancellationInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the cancellation patterns and potential reasons behind them.'),
  suggestions: z.string().describe('Suggestions for how to reduce cancellations in the future.'),
});
export type CancellationInsightsOutput = z.infer<typeof CancellationInsightsOutputSchema>;

export async function cancellationInsights(input: CancellationInsightsInput): Promise<CancellationInsightsOutput> {
  return cancellationInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cancellationInsightsPrompt',
  input: {schema: CancellationInsightsInputSchema},
  output: {schema: CancellationInsightsOutputSchema},
  prompt: `You are an expert in business operations and customer service. Analyze the following data about appointment cancellations and provide insights into the cancellation patterns and suggest ways to reduce cancellations.

Cancellation Data: {{{cancellationData}}}

Provide a summary of the cancellation patterns and potential reasons behind them, as well as suggestions for how to reduce cancellations in the future.`,
});

const cancellationInsightsFlow = ai.defineFlow(
  {
    name: 'cancellationInsightsFlow',
    inputSchema: CancellationInsightsInputSchema,
    outputSchema: CancellationInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
