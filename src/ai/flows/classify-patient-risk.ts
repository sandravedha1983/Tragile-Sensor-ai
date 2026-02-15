'use server';
/**
 * @fileOverview This file implements a Genkit flow for classifying a patient's risk level.
 *
 * - classifyPatientRisk - A function that handles the patient risk classification process.
 * - PatientRiskClassificationInput - The input type for the classifyPatientRisk function.
 * - PatientRiskClassificationOutput - The return type for the classifyPatientRisk function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define the input schema
const PatientRiskClassificationInputSchema = z.object({
  age: z.number().int().min(0).max(120).describe('The age of the patient in years.'),
  gender: z.string().describe('The gender of the patient.'),
  systolicBp: z.number().int().min(50).max(250).describe('Patient\'s systolic blood pressure (mmHg).'),
  diastolicBp: z.number().int().min(30).max(150).describe('Patient\'s diastolic blood pressure (mmHg).'),
  heartRate: z.number().int().min(30).max(200).describe('Patient\'s heart rate (beats per minute).'),
  temperature: z.number().min(35.0).max(42.0).describe('Patient\'s body temperature (Celsius).'),
  symptoms: z.string().describe('A detailed description of the patient\'s symptoms.'),
  preExistingConditions: z.string().describe('A comma-separated list of the patient\'s pre-existing medical conditions, if any.'),
});
export type PatientRiskClassificationInput = z.infer<typeof PatientRiskClassificationInputSchema>;

// 2. Define the output schema
const DepartmentFitScoreSchema = z.object({
  department: z.string().describe('The name of the department (e.g., "Emergency", "Cardiology").'),
  score: z.number().min(0).max(1).describe('The fit score for the department, ranging from 0 to 1, indicating suitability for the patient\'s condition.'),
});

const TopFactorSchema = z.object({
  factor: z.string().describe('The description of the factor.'),
  value: z.number().describe('A numerical value representing the contribution of this factor. Higher is more impactful.')
});

const PatientRiskClassificationOutputSchema = z.object({
  riskProbability: z.number().min(0).max(1).describe('The calculated risk probability for the patient, between 0 and 1. This can be used as the confidence score.'),
  urgencyIndex: z.number().int().min(0).max(100).describe('A dynamic urgency index between 0 and 100, representing the immediate need for medical attention. This is calculated considering risk probability, vital instability, and symptom severity. 0-40 is Low, 41-70 is Medium, 71-100 is Critical.'),
  riskLevel: z.enum(['Low', 'Medium', 'Critical']).describe('The classified risk level: Low (0-40 urgency index), Medium (41-70 urgency index), or Critical (71-100 urgency index).'),
  explanation: z.string().describe('A natural language explanation for the determined risk level and urgency index, including the reasoning based on the provided patient data.'),
  topFactors: z.array(TopFactorSchema).describe('A list of the most significant factors (e.g., specific symptoms, vital signs, conditions) contributing to the risk assessment, with their relative impact values.'),
  departmentFitScores: z.array(DepartmentFitScoreSchema).describe('An array of department fit scores, sorted in descending order by score, indicating the most suitable departments.'),
  modelVersion: z.string().describe('The version of the AI model used for this classification.'),
});
export type PatientRiskClassificationOutput = z.infer<typeof PatientRiskClassificationOutputSchema>;

// 3. Define the prompt
const patientRiskClassificationPrompt = ai.definePrompt({
  name: 'patientRiskClassificationPrompt',
  input: { schema: PatientRiskClassificationInputSchema },
  output: { schema: PatientRiskClassificationOutputSchema },
  prompt: `You are an intelligent healthcare triage AI. Your task is to accurately assess a patient's risk level, compute a dynamic urgency index, and suggest suitable departments based on the provided medical information. The current model version is 1.3.0.

Based on the following patient data:
- Determine the risk probability (0-1) and urgency index (0-100).
- Classify the risk level: 'Low' (urgency 0-40), 'Medium' (41-70), or 'Critical' (71-100).
- Generate a list of at least 3 potential departments with a "fit score" (0-1) for each, sorted from most to least suitable. Consider departments like Cardiology, Neurology, General Medicine, Orthopedics, and Emergency.
- Provide a clear, natural language explanation for your assessment.
- List the top factors contributing to your decision, including a numerical 'value' for each factor's contribution.
- Set the modelVersion to "1.3.0".

Patient Age: {{{age}}} years
Patient Gender: {{{gender}}}
Systolic Blood Pressure: {{{systolicBp}}} mmHg
Diastolic Blood Pressure: {{{diastolicBp}}} mmHg
Heart Rate: {{{heartRate}}} bpm
Body Temperature: {{{temperature}}} °C
Symptoms: {{{symptoms}}}
Pre-Existing Conditions: {{{preExistingConditions}}}
`,
});

// 4. Define the Genkit flow
const classifyPatientRiskFlow = ai.defineFlow(
  {
    name: 'classifyPatientRiskFlow',
    inputSchema: PatientRiskClassificationInputSchema,
    outputSchema: PatientRiskClassificationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await patientRiskClassificationPrompt(input);
      if (!output) {
        throw new Error('Failed to classify patient risk: No output from AI model.');
      }
      return output;
    } catch (error: any) {
      console.error('Error in classifyPatientRiskFlow:', error);
      throw new Error(`Failed to classify patient risk: ${error.message || 'Unknown error'}`);
    }
  }
);

// 5. Define the exported wrapper function
export async function classifyPatientRisk(
  input: PatientRiskClassificationInput
): Promise<PatientRiskClassificationOutput> {
  return classifyPatientRiskFlow(input);
}
