'use server';
/**
 * @fileOverview A Genkit flow for generating natural language explanations for AI risk classification and department recommendations.
 *
 * - generateAIExplanation - A function that handles the AI explanation generation process.
 * - GenerateAIExplanationInput - The input type for the generateAIExplanation function.
 * - GenerateAIExplanationOutput - The return type for the generateAIExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateAIExplanationInputSchema = z.object({
  patientId: z.string().describe('The auto-generated patient ID.'),
  age: z.number().describe("Patient's age."),
  gender: z.string().describe("Patient's gender (e.g., 'Male', 'Female', 'Other')."),
  symptoms: z.string().describe('A comprehensive summary of patient symptoms, possibly derived from multi-select and free text inputs.'),
  bloodPressureSystolic: z.number().describe('Patient systolic blood pressure in mmHg.'),
  bloodPressureDiastolic: z.number().describe('Patient diastolic blood pressure in mmHg.'),
  heartRate: z.number().describe('Patient heart rate in beats per minute.'),
  temperature: z.number().describe('Patient body temperature in Celsius.'),
  preExistingConditions: z.string().describe('A comprehensive summary of patient pre-existing conditions.'),
  riskLevel: z.enum(['Low', 'Medium', 'Critical']).describe('The classified risk level for the patient by the ML model.'),
  urgencyIndex: z.number().min(0).max(100).describe('The calculated urgency index for the patient (0-100).'),
  recommendedDepartment: z.string().describe('The department recommended for the patient by the AI.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the ML model prediction, ranging from 0 to 1.'),
  topFactors: z.array(z.string()).describe('A list of key contributing factors (e.g., from SHAP values) that led to the AI decision.'),
});
export type GenerateAIExplanationInput = z.infer<typeof GenerateAIExplanationInputSchema>;

// Output Schema
const GenerateAIExplanationOutputSchema = z.object({
  naturalExplanation: z.string().describe('A natural language explanation of the AI\'s risk classification and department recommendation, incorporating confidence and key contributing factors.'),
});
export type GenerateAIExplanationOutput = z.infer<typeof GenerateAIExplanationOutputSchema>;

export async function generateAIExplanation(input: GenerateAIExplanationInput): Promise<GenerateAIExplanationOutput> {
  return generateAIExplanationFlow(input);
}

// Internal Prompt Input Schema (with pre-calculated confidence percentage)
const GenerateAIExplanationPromptInputSchema = GenerateAIExplanationInputSchema.extend({
  confidencePercentage: z.number().describe('The confidence score of the ML model prediction, expressed as a percentage (0-100).'),
});

const prompt = ai.definePrompt({
  name: 'generateAIExplanationPrompt',
  input: { schema: GenerateAIExplanationPromptInputSchema },
  output: { schema: GenerateAIExplanationOutputSchema },
  prompt: `You are an expert medical AI assistant designed to provide clear, concise, and trustworthy explanations of patient triage decisions.
Your goal is to help doctors and triage staff understand the rationale behind the AI's risk classification and department recommendation.
Generate a natural language explanation based on the provided patient data and AI predictions.
Your explanation must:
1.  State the patient's overall risk level and urgency.
2.  Clearly explain the recommendation for the department.
3.  Explicitly mention and elaborate on the "Top Contributing Factors" and how they influenced the decision.
4.  Include the "Confidence" level of the AI's prediction.
5.  Maintain a professional, empathetic, and easily understandable tone for medical professionals.

---
Patient ID: {{{patientId}}}
Age: {{{age}}}
Gender: {{{gender}}}
Symptoms: {{{symptoms}}}
Blood Pressure: {{{bloodPressureSystolic}}}/{{{bloodPressureDiastolic}}} mmHg
Heart Rate: {{{heartRate}}} bpm
Temperature: {{{temperature}}} °C
Pre-Existing Conditions: {{{preExistingConditions}}}

AI Classification:
Risk Level: {{{riskLevel}}} (Urgency Index: {{{urgencyIndex}}})
Recommended Department: {{{recommendedDepartment}}}
Confidence: {{{confidencePercentage}}}%
Top Contributing Factors:
{{#each topFactors}}
- {{{this}}}
{{/each}}
---

Explanation:`,
});

const generateAIExplanationFlow = ai.defineFlow(
  {
    name: 'generateAIExplanationFlow',
    inputSchema: GenerateAIExplanationInputSchema,
    outputSchema: GenerateAIExplanationOutputSchema,
  },
  async (input) => {
    // Pre-process confidence to a percentage for the prompt.
    const promptInput = {
      ...input,
      confidencePercentage: Math.round(input.confidence * 100),
    };
    const { output } = await prompt(promptInput);
    return output!;
  }
);
