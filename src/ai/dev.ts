import { config } from 'dotenv';
config();

import '@/ai/flows/generate-safety-score.ts';
import '@/ai/flows/submit-incident-report.ts';
