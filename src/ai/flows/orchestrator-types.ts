import { z } from 'zod';

// The input schema for the orchestrator is the patient intake form data
export const TriageInputSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female', 'Other']),
  systolicBp: z.number(),
  diastolicBp: z.number(),
  heartRate: z.number(),
  temperature: z.number(),
  symptoms: z.string(),
  preExistingConditions: z.string().optional(),
  consentGiven: z.boolean(),
});
export type TriageInput = z.infer<typeof TriageInputSchema>;

// The output is a combination of results from all agents
export const TriageOutputSchema = z.object({
    // from patient
    name: z.string(),
    age: z.number(),
    gender: z.enum(['Male', 'Female', 'Other']),
    symptoms: z.array(z.string()),
    preExistingConditions: z.string().optional(),

    // from triage agent
    riskLevel: z.enum(['Low', 'Medium', 'Critical']),
    urgencyIndex: z.number(),
    aiExplanation: z.string(),
    confidence: z.number(),
    topFactors: z.array(z.object({ factor: z.string(), value: z.number() })),
    departmentFitScores: z.array(z.object({
        department: z.string(),
        score: z.number(),
    })),
    modelVersion: z.string(),

    // from resource agent
    assignedDepartment: z.string(),
    rerouting_reason: z.string().optional(),

    // from regulatory agent
    compliance_status: z.string(),
    
    // from fairness agent
    fairness_warning: z.string().optional(),
    
    // Default values
    status: z.string(),
    waitTime: z.number(),
});
export type TriageOutput = z.infer<typeof TriageOutputSchema>;
