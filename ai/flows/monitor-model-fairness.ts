'use server';
/**
 * @fileOverview Monitors the AI's prediction distribution by demographic groups (gender, age)
 * and alerts to potential biases.
 *
 * - monitorModelFairness - A function that monitors AI model fairness.
 * - MonitorModelFairnessInput - The input type for the monitorModelFairness function.
 * - MonitorModelFairnessOutput - The return type for the monitorModelFairness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Helper to determine age group
function getAgeGroup(age: number): string {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 35) return 'young_adult';
  if (age <= 64) return 'adult';
  return 'senior';
}

const PredictionLogSchema = z.object({
  patientId: z.string().describe('Unique identifier for the patient.'),
  age: z.number().int().min(0).max(120).describe('Age of the patient.'),
  gender: z.enum(['male', 'female', 'other', 'unknown']).describe('Gender of the patient.'),
  riskLevel: z.enum(['Low', 'Medium', 'Critical']).describe('The predicted risk level for the patient.'),
  urgencyIndex: z.number().min(0).max(100).describe('The calculated urgency index for the patient.'),
});

const BiasDetailSchema = z.object({
  demographicGroup: z.string().describe('The demographic group where bias was detected (e.g., "gender:male", "age_group:child").'),
  metric: z.string().describe('The metric that showed deviation (e.g., "critical_risk_proportion").'),
  groupValue: z.number().describe('The value of the metric for this specific group.'),
  overallAverage: z.number().describe('The overall average value of the metric across all groups.'),
  deviationPercentage: z.number().describe('The percentage deviation from the overall average or across groups.'),
  warning: z.string().describe('A human-readable warning message.'),
});

const MonitorModelFairnessInputSchema = z.object({
  predictions: z.array(PredictionLogSchema).describe('A list of AI prediction logs, each including patient demographics and prediction outcomes.'),
  deviationThresholdPercentage: z.number().min(0).max(100).default(15).describe('The percentage deviation threshold above which a bias alert is triggered.'),
});
export type MonitorModelFairnessInput = z.infer<typeof MonitorModelFairnessInputSchema>;

const MonitorModelFairnessOutputSchema = z.object({
  isBiasDetected: z.boolean().describe('True if any bias exceeding the threshold was detected, false otherwise.'),
  biasDetails: z.array(BiasDetailSchema).describe('Details of each detected bias.'),
});
export type MonitorModelFairnessOutput = z.infer<typeof MonitorModelFairnessOutputSchema>;

export async function monitorModelFairness(input: MonitorModelFairnessInput): Promise<MonitorModelFairnessOutput> {
  return monitorModelFairnessFlow(input);
}

const monitorModelFairnessFlow = ai.defineFlow(
  {
    name: 'monitorModelFairnessFlow',
    inputSchema: MonitorModelFairnessInputSchema,
    outputSchema: MonitorModelFairnessOutputSchema,
  },
  async (input) => {
    const { predictions, deviationThresholdPercentage } = input;
    const biasDetails: z.infer<typeof BiasDetailSchema>[] = [];

    if (predictions.length === 0) {
      return { isBiasDetected: false, biasDetails: [] };
    }

    // 1. Monitor by Gender
    const genderGroups: Record<string, typeof PredictionLogSchema._type[]> = {};
    for (const pred of predictions) {
      if (!genderGroups[pred.gender]) {
        genderGroups[pred.gender] = [];
      }
      genderGroups[pred.gender].push(pred);
    }

    const genderCriticalRiskProportions: Record<string, number> = {};
    let totalCriticalCount = 0;
    for (const gender in genderGroups) {
      const group = genderGroups[gender];
      const criticalCount = group.filter(p => p.riskLevel === 'Critical').length;
      genderCriticalRiskProportions[gender] = group.length > 0 ? (criticalCount / group.length) : 0;
      totalCriticalCount += criticalCount;
    }

    const overallCriticalRiskProportion = predictions.length > 0 ? (totalCriticalCount / predictions.length) : 0;

    for (const gender in genderCriticalRiskProportions) {
      const proportion = genderCriticalRiskProportions[gender];
      // Calculate deviation as absolute difference from overall average
      const deviation = Math.abs(proportion - overallCriticalRiskProportion) * 100;

      if (deviation > deviationThresholdPercentage) {
        biasDetails.push({
          demographicGroup: `gender:${gender}`,
          metric: 'critical_risk_proportion',
          groupValue: proportion,
          overallAverage: overallCriticalRiskProportion,
          deviationPercentage: parseFloat(deviation.toFixed(2)),
          warning: `Potential bias detected for gender '${gender}': Critical risk proportion (${(proportion * 100).toFixed(2)}%) deviates significantly from overall average (${(overallCriticalRiskProportion * 100).toFixed(2)}%).`,
        });
      }
    }

    // 2. Monitor by Age Group
    const ageGroups: Record<string, typeof PredictionLogSchema._type[]> = {};
    for (const pred of predictions) {
      const ageGroup = getAgeGroup(pred.age);
      if (!ageGroups[ageGroup]) {
        ageGroups[ageGroup] = [];
      }
      ageGroups[ageGroup].push(pred);
    }

    const ageGroupCriticalRiskProportions: Record<string, number> = {};
    for (const ageGroup in ageGroups) {
      const group = ageGroups[ageGroup];
      const criticalCount = group.filter(p => p.riskLevel === 'Critical').length;
      ageGroupCriticalRiskProportions[ageGroup] = group.length > 0 ? (criticalCount / group.length) : 0;
    }

    for (const ageGroup in ageGroupCriticalRiskProportions) {
      const proportion = ageGroupCriticalRiskProportions[ageGroup];
      // Calculate deviation as absolute difference from overall average
      const deviation = Math.abs(proportion - overallCriticalRiskProportion) * 100;

      if (deviation > deviationThresholdPercentage) {
        biasDetails.push({
          demographicGroup: `age_group:${ageGroup}`,
          metric: 'critical_risk_proportion',
          groupValue: proportion,
          overallAverage: overallCriticalRiskProportion,
          deviationPercentage: parseFloat(deviation.toFixed(2)),
          warning: `Potential bias detected for age group '${ageGroup}': Critical risk proportion (${(proportion * 100).toFixed(2)}%) deviates significantly from overall average (${(overallCriticalRiskProportion * 100).toFixed(2)}%).`,
        });
      }
    }

    // Note: False positive rate comparison would require actual ground truth labels for patient outcomes.
    // This implementation focuses on the distribution of 'Critical' risk predictions across demographic groups.

    return {
      isBiasDetected: biasDetails.length > 0,
      biasDetails: biasDetails,
    };
  }
);
