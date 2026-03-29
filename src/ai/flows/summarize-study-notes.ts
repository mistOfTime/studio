'use server';
/**
 * @fileOverview An AI agent that summarizes study notes or articles.
 *
 * - summarizeStudyNotes - A function that handles the summarization process.
 * - SummarizeStudyNotesInput - The input type for the summarizeStudyNotes function.
 * - SummarizeStudyNotesOutput - The return type for the summarizeStudyNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStudyNotesInputSchema = z.object({
  notesContent: z.string().describe('The content of the study notes or article to be summarized.'),
});
export type SummarizeStudyNotesInput = z.infer<typeof SummarizeStudyNotesInputSchema>;

const SummarizeStudyNotesOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the study notes.'),
});
export type SummarizeStudyNotesOutput = z.infer<typeof SummarizeStudyNotesOutputSchema>;

export async function summarizeStudyNotes(
  input: SummarizeStudyNotesInput
): Promise<SummarizeStudyNotesOutput> {
  return summarizeStudyNotesFlow(input);
}

const summarizeStudyNotesPrompt = ai.definePrompt({
  name: 'summarizeStudyNotesPrompt',
  input: {schema: SummarizeStudyNotesInputSchema},
  output: {schema: SummarizeStudyNotesOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing educational content. Your task is to condense the provided study notes or article into a concise summary, highlighting key information and essential concepts.

Here are the notes to summarize:

Notes: {{{notesContent}}}`,
});

const summarizeStudyNotesFlow = ai.defineFlow(
  {
    name: 'summarizeStudyNotesFlow',
    inputSchema: SummarizeStudyNotesInputSchema,
    outputSchema: SummarizeStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeStudyNotesPrompt(input);
    return output!;
  }
);
