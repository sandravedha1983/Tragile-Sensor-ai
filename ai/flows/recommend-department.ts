'use server';
/**
 * @fileOverview A Genkit flow to recommend the most suitable hospital department for a patient,
 * considering their predicted condition and real-time hospital resource availability.
 *
 * - recommendDepartment - A function that handles the department recommendation process.
 * - RecommendDepartmentInput - The input type for the recommendDepartment function.
 * - RecommendDepartmentOutput - The return type for the recommendDepartment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const DepartmentFitScoreSchema = z.object({
  department: z.string().describe('The name of the department (e.g., "Emergency", "Cardiology").'),
  score: z.number().min(0).max(1).describe('The fit score for the department, ranging from 0 to 1.'),
});

const HospitalResourcesSchema = z.object({
  cardiology_beds_available: z.number().min(0).describe('Number of available beds in Cardiology.'),
  emergency_slots_available: z.number().min(0).describe('Number of available slots in Emergency.'),
  neurologist_on_duty: z.boolean().describe('Whether a neurologist is currently on duty.'),
  general_physicians_available: z.number().min(0).describe('Number of available general physicians.'),
  icu_beds_available: z.number().min(0).describe('Number of available beds in ICU.'),
});

const RecommendDepartmentInputSchema = z.object({
  patientId: z.string().describe('Unique identifier for the patient.'),
  riskLevel: z.enum(['Low', 'Medium', 'Critical']).describe('The classified risk level for the patient.'),
  urgencyIndex: z.number().min(0).max(100).describe('A dynamic urgency index for the patient (0-100).'),
  departmentFitScores: z.array(DepartmentFitScoreSchema).describe('An array of department fit scores, sorted descending by score.'),
  hospitalResources: HospitalResourcesSchema.describe('Current real-time availability of hospital resources.'),
});
export type RecommendDepartmentInput = z.infer<typeof RecommendDepartmentInputSchema>;

// Output Schema
const RecommendDepartmentOutputSchema = z.object({
  recommendedDepartment: z.string().describe('The name of the recommended department.'),
  reroutedReason: z.string().optional().describe('Reason for rerouting if the primary recommended department was unavailable.'),
});
export type RecommendDepartmentOutput = z.infer<typeof RecommendDepartmentOutputSchema>;

export async function recommendDepartment(input: RecommendDepartmentInput): Promise<RecommendDepartmentOutput> {
  return recommendDepartmentFlow(input);
}

const recommendDepartmentFlow = ai.defineFlow(
  {
    name: 'recommendDepartmentFlow',
    inputSchema: RecommendDepartmentInputSchema,
    outputSchema: RecommendDepartmentOutputSchema,
  },
  async (input) => {
    const { departmentFitScores, hospitalResources } = input;

    let recommendedDepartment: string | undefined;
    let reroutedReason: string | undefined;
    let initialRecommendedDepartment: string | undefined;

    // Helper to check availability based on resource key
    const isResourceAvailable = (departmentName: string): boolean => {
      switch (departmentName.toLowerCase()) {
        case 'emergency':
          return hospitalResources.emergency_slots_available > 0;
        case 'cardiology':
          return hospitalResources.cardiology_beds_available > 0;
        case 'neurology':
          return hospitalResources.neurologist_on_duty;
        case 'general medicine': // Assuming a mapping for 'General Medicine' to 'general_physicians_available'
          return hospitalResources.general_physicians_available > 0;
        case 'icu':
          return hospitalResources.icu_beds_available > 0;
        default:
          // For departments not explicitly mapped or without specific resource constraints, assume availability
          return true;
      }
    };

    for (const fitScore of departmentFitScores) {
      const department = fitScore.department;

      if (!initialRecommendedDepartment) {
        initialRecommendedDepartment = department; // Capture the very first recommended department based on fit score
      }

      if (isResourceAvailable(department)) {
        recommendedDepartment = department;
        break; // Found an available department
      }
    }

    // If no suitable department was found (e.g., all mapped departments are full), provide a fallback.
    // Or if the initial top choice was unavailable and we had to reroute.
    if (!recommendedDepartment) {
      // Fallback: If all specific departments are unavailable, route to a general observation area.
      recommendedDepartment = 'General Observation';
      reroutedReason = `No high-priority specialized departments were available. Patient routed to ${recommendedDepartment}.`;
    } else if (initialRecommendedDepartment && recommendedDepartment !== initialRecommendedDepartment) {
      reroutedReason = `Re-routed from ${initialRecommendedDepartment} to ${recommendedDepartment} due to capacity constraints.`;
    }

    return {
      recommendedDepartment,
      reroutedReason,
    };
  }
);
