'use server';
/**
 * @fileOverview An AI agent that suggests a breakdown of a complex task into smaller sub-tasks.
 *
 * - suggestTaskBreakdown - A function that handles the task breakdown process.
 * - SuggestTaskBreakdownInput - The input type for the suggestTaskBreakdown function.
 * - SuggestTaskBreakdownOutput - The return type for the suggestTaskBreakdown function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskBreakdownInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A description of the complex task to be broken down.'),
});
export type SuggestTaskBreakdownInput = z.infer<
  typeof SuggestTaskBreakdownInputSchema
>;

const SuggestTaskBreakdownOutputSchema = z.object({
  subTasks: z.array(z.string()).describe('An array of smaller, manageable sub-tasks.'),
});
export type SuggestTaskBreakdownOutput = z.infer<
  typeof SuggestTaskBreakdownOutputSchema
>;

export async function suggestTaskBreakdown(
  input: SuggestTaskBreakdownInput
): Promise<SuggestTaskBreakdownOutput> {
  return suggestTaskBreakdownFlow(input);
}

const suggestTaskBreakdownPrompt = ai.definePrompt({
  name: 'suggestTaskBreakdownPrompt',
  input: {schema: SuggestTaskBreakdownInputSchema},
  output: {schema: SuggestTaskBreakdownOutputSchema},
  prompt: `You are an expert assistant for students, specializing in breaking down complex tasks into smaller, manageable sub-tasks.

Break down the following complex task into a list of actionable, smaller sub-tasks. Ensure each sub-task is distinct and contributes to the completion of the main task.

Complex Task: {{{taskDescription}}}`,
});

const suggestTaskBreakdownFlow = ai.defineFlow(
  {
    name: 'suggestTaskBreakdownFlow',
    inputSchema: SuggestTaskBreakdownInputSchema,
    outputSchema: SuggestTaskBreakdownOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskBreakdownPrompt(input);
    return output!;
  }
);
