'use server';
/**
 * @fileOverview A Genkit flow for generating quiz questions and flashcards from study notes or text.
 *
 * - generateStudyAidsFromText - A function that generates study aids (quizzes and flashcards) from provided text.
 * - GenerateStudyAidsFromTextInput - The input type for the generateStudyAidsFromText function.
 * - GenerateStudyAidsFromTextOutput - The return type for the generateStudyAidsFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of possible answer options.'),
  correctAnswer: z.string().describe('The correct answer among the options.'),
});

const FlashcardSchema = z.object({
  front: z.string().describe('The term or concept for the front of the flashcard.'),
  back: z.string().describe('The definition or explanation for the back of the flashcard.'),
});

const GenerateStudyAidsFromTextInputSchema = z.object({
  text: z.string().describe('The study notes or text from which to generate study aids.'),
});
export type GenerateStudyAidsFromTextInput = z.infer<typeof GenerateStudyAidsFromTextInputSchema>;

const GenerateStudyAidsFromTextOutputSchema = z.object({
  quizQuestions: z
    .array(QuizQuestionSchema)
    .describe('An array of generated quiz questions.'),
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateStudyAidsFromTextOutput = z.infer<typeof GenerateStudyAidsFromTextOutputSchema>;

export async function generateStudyAidsFromText(
  input: GenerateStudyAidsFromTextInput
): Promise<GenerateStudyAidsFromTextOutput> {
  return generateStudyAidsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyAidsPrompt',
  input: {schema: GenerateStudyAidsFromTextInputSchema},
  output: {schema: GenerateStudyAidsFromTextOutputSchema},
  prompt: `You are an AI assistant specialized in creating study aids. Your task is to generate relevant quiz questions and flashcards from the provided study notes or text.

Generate at least 3-5 quiz questions with 3-4 multiple-choice options each, and clearly identify the correct answer. Also, generate at least 5-10 flashcards, each with a term/concept on the front and its definition/explanation on the back.

Ensure the output is formatted as a JSON object, strictly following the provided schema.

Here are the study notes/text:

---
{{{text}}}
---
`,
});

const generateStudyAidsFlow = ai.defineFlow(
  {
    name: 'generateStudyAidsFromTextFlow',
    inputSchema: GenerateStudyAidsFromTextInputSchema,
    outputSchema: GenerateStudyAidsFromTextOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate study aids.');
    }
    return output;
  }
);
