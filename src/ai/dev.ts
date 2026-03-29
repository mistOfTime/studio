import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-study-notes.ts';
import '@/ai/flows/suggest-task-breakdown.ts';
import '@/ai/flows/generate-study-aids-from-text.ts';