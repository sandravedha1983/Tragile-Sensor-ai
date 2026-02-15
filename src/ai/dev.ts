import { config } from 'dotenv';
config();

import '@/ai/flows/calculate-urgency-index.ts';
import '@/ai/flows/generate-synthetic-patients.ts';
import '@/ai/flows/monitor-model-fairness.ts';
import '@/ai/flows/generate-ai-explanation.ts';
import '@/ai/flows/classify-patient-risk.ts';
import '@/ai/flows/recommend-department.ts';
import '@/ai/flows/regulatory-agent.ts';
import '@/ai/flows/orchestrator-flow.ts';
