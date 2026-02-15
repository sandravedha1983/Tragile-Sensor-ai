'use server';
/**
 * @fileOverview A Genkit flow for generating synthetic patient data for ER rush simulation.
 *
 * - generateSyntheticPatients - A function that handles the generation of synthetic patient data.
 * - GenerateSyntheticPatientsInput - The input type for the generateSyntheticPatients function.
 * - GenerateSyntheticPatientsOutput - The return type for the generateSyntheticPatients function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSyntheticPatientsInputSchema = z.object({
  numberOfPatients: z.number().int().min(1).describe('The number of synthetic patients to generate.'),
});
export type GenerateSyntheticPatientsInput = z.infer<typeof GenerateSyntheticPatientsInputSchema>;

const SyntheticPatientSchema = z.object({
  patientId: z.string().describe('A unique identifier for the patient.'),
  age: z.number().int().min(1).max(120).describe('The patient\'s age in years.'),
  gender: z.enum(['Male', 'Female', 'Other']).describe('The patient\'s gender.'),
  symptoms: z.array(z.string()).describe('A list of symptoms the patient is experiencing.'),
  bloodPressureSystolic: z.number().int().min(70).max(200).describe('The patient\'s systolic blood pressure (mmHg).'),
  bloodPressureDiastolic: z.number().int().min(40).max(120).describe('The patient\'s diastolic blood pressure (mmHg).'),
  heartRate: z.number().int().min(40).max(200).describe('The patient\'s heart rate (beats per minute).'),
  temperature: z.number().min(35.0).max(42.0).describe('The patient\'s body temperature (Celsius).'),
  preExistingConditions: z.array(z.string()).describe('A list of pre-existing medical conditions.'),
  riskLevel: z.enum(['Low', 'Medium', 'Critical']).optional().describe('The predicted risk level for the patient (optional for training data).'),
});

const GenerateSyntheticPatientsOutputSchema = z.array(SyntheticPatientSchema);
export type GenerateSyntheticPatientsOutput = z.infer<typeof GenerateSyntheticPatientsOutputSchema>;

export async function generateSyntheticPatients(
  input: GenerateSyntheticPatientsInput
): Promise<GenerateSyntheticPatientsOutput> {
  return generateSyntheticPatientsFlow(input);
}

const generateSyntheticPatientsPrompt = ai.definePrompt({
  name: 'generateSyntheticPatientsPrompt',
  input: { schema: GenerateSyntheticPatientsInputSchema },
  output: { schema: GenerateSyntheticPatientsOutputSchema },
  prompt: `You are an expert data generator for healthcare systems.
Your task is to generate a batch of synthetic patient data for emergency room simulations.
Each patient object must adhere to the provided JSON schema, including realistic and varied values for each field.
Ensure that patient IDs are unique and sequential or random-like strings.
Generate exactly {{numberOfPatients}} synthetic patient records.
The output must be a JSON array of patient objects.`,
});

const generateSyntheticPatientsFlow = ai.defineFlow(
  {
    name: 'generateSyntheticPatientsFlow',
    inputSchema: GenerateSyntheticPatientsInputSchema,
    outputSchema: GenerateSyntheticPatientsOutputSchema,
  },
  async (input) => {
    const { output } = await generateSyntheticPatientsPrompt(input);
    return output!;
  }
);
