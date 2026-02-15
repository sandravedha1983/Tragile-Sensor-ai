'use server';
/**
 * @fileOverview An orchestrator flow that coordinates multiple AI agents for patient triage.
 *
 * - triagePatientWithAgents - The main orchestration function.
 */

import { ai } from '@/ai/genkit';
import { classifyPatientRisk, type PatientRiskClassificationInput } from './classify-patient-risk';
import { recommendDepartment, type RecommendDepartmentInput } from './recommend-department';
import { performRegulatoryChecks } from './regulatory-agent';
import { monitorModelFairness } from './monitor-model-fairness';
import { TriageInputSchema, TriageOutputSchema, type TriageInput, type TriageOutput } from './orchestrator-types';

export async function triagePatientWithAgents(
  input: TriageInput
): Promise<TriageOutput> {
  return orchestratorFlow(input);
}


const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: TriageInputSchema,
    outputSchema: TriageOutputSchema,
  },
  async (input) => {
    // 1. Call Triage Agent (classifyPatientRisk)
    const triageAgentInput: PatientRiskClassificationInput = {
        age: input.age,
        gender: input.gender,
        systolicBp: input.systolicBp,
        diastolicBp: input.diastolicBp,
        heartRate: input.heartRate,
        temperature: input.temperature,
        symptoms: input.symptoms,
        preExistingConditions: input.preExistingConditions || 'None',
    };
    const triageResult = await classifyPatientRisk(triageAgentInput);

    // Mock hospital resources for the resource agent
    const hospitalResources = {
        cardiology_beds_available: 5,
        emergency_slots_available: 2,
        neurologist_on_duty: true,
        general_physicians_available: 10,
        icu_beds_available: 1,
    };

    // 2. Call Resource Agent (recommendDepartment)
    const resourceAgentInput: RecommendDepartmentInput = {
        patientId: 'temp-id', // Not used in logic
        riskLevel: triageResult.riskLevel,
        urgencyIndex: triageResult.urgencyIndex,
        departmentFitScores: triageResult.departmentFitScores,
        hospitalResources: hospitalResources
    };
    const resourceResult = await recommendDepartment(resourceAgentInput);

    // 3. Call Regulatory Agent
    const regulatoryResult = await performRegulatoryChecks({ consentGiven: input.consentGiven });

    // 4. Call Fairness Agent
    const fairnessResult = await monitorModelFairness({
        predictions: [{
            patientId: 'temp-id',
            age: input.age,
            gender: input.gender.toLowerCase() as 'male'|'female'|'other'|'unknown',
            riskLevel: triageResult.riskLevel,
            urgencyIndex: triageResult.urgencyIndex
        }],
        deviationThresholdPercentage: 15,
    });
    let fairness_warning: string | undefined;
    if (fairnessResult.isBiasDetected) {
        fairness_warning = fairnessResult.biasDetails[0]?.warning;
    }

    // 5. Assemble final response
    const output: TriageOutput = {
        name: input.name,
        age: input.age,
        gender: input.gender,
        symptoms: input.symptoms.split(',').map(s => s.trim()),
        preExistingConditions: input.preExistingConditions,
        riskLevel: triageResult.riskLevel,
        urgencyIndex: triageResult.urgencyIndex,
        aiExplanation: triageResult.explanation,
        confidence: triageResult.riskProbability, // Using riskProbability as confidence
        topFactors: triageResult.topFactors,
        departmentFitScores: triageResult.departmentFitScores,
        modelVersion: triageResult.modelVersion,
        assignedDepartment: resourceResult.recommendedDepartment,
        rerouting_reason: resourceResult.reroutedReason,
        compliance_status: regulatoryResult.compliance_status,
        fairness_warning: fairness_warning,
        status: 'Waiting',
        waitTime: Math.floor(Math.random() * 60) + 5, // Mock wait time
    };

    // The orchestrator stores the final decision in Firestore.
    // This step is omitted here as the frontend will handle patient creation.

    return output;
  }
);
