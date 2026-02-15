'use server';
/**
 * @fileOverview A Genkit flow for calculating a dynamic urgency index for patients.
 *
 * - calculateUrgencyIndex - A function that calculates the patient's urgency index and risk classification.
 * - CalculateUrgencyIndexInput - The input type for the calculateUrgencyIndex function.
 * - CalculateUrgencyIndexOutput - The return type for the calculateUrgencyIndex function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateUrgencyIndexInputSchema = z.object({
  risk_probability: z
    .number()
    .min(0)
    .max(1)
    .describe('The probability of risk, a value between 0 and 1.'),
  vital_instability_score: z
    .number()
    .min(0)
    .max(100)
    .describe('A score representing the instability of vital signs, typically between 0 and 100.'),
  symptom_severity_score: z
    .number()
    .min(0)
    .max(100)
    .describe('A score representing the severity of symptoms, typically between 0 and 100.'),
});
export type CalculateUrgencyIndexInput = z.infer<typeof CalculateUrgencyIndexInputSchema>;

const CalculateUrgencyIndexOutputSchema = z.object({
  urgency_index: z
    .number()
    .min(0)
    .max(100)
    .describe('The calculated dynamic urgency index, a value between 0 and 100.'),
  risk_classification: z
    .enum(['Low', 'Medium', 'Critical'])
    .describe('The risk classification based on the urgency index.'),
});
export type CalculateUrgencyIndexOutput = z.infer<typeof CalculateUrgencyIndexOutputSchema>;

export async function calculateUrgencyIndex(
  input: CalculateUrgencyIndexInput
): Promise<CalculateUrgencyIndexOutput> {
  return calculateUrgencyIndexFlow(input);
}

const calculateUrgencyIndexFlow = ai.defineFlow(
  {
    name: 'calculateUrgencyIndexFlow',
    inputSchema: CalculateUrgencyIndexInputSchema,
    outputSchema: CalculateUrgencyIndexOutputSchema,
  },
  async ({risk_probability, vital_instability_score, symptom_severity_score}) => {
    // urgency_index = (0.5 × risk_probability × 100) + (0.3 × vital_instability_score) + (0.2 × symptom_severity_score)
    const urgency_index =
      0.5 * risk_probability * 100 +
      0.3 * vital_instability_score +
      0.2 * symptom_severity_score;

    let risk_classification: 'Low' | 'Medium' | 'Critical';
    if (urgency_index <= 40) {
      risk_classification = 'Low';
    } else if (urgency_index <= 70) {
      risk_classification = 'Medium';
    } else {
      risk_classification = 'Critical';
    }

    return {
      urgency_index: Math.min(Math.max(urgency_index, 0), 100), // Ensure index is within 0-100
      risk_classification,
    };
  }
);
