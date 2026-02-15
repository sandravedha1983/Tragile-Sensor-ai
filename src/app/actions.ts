'use server';

import { triagePatientWithAgents } from "@/ai/flows/orchestrator-flow";
import type { TriageInput, TriageOutput } from "@/ai/flows/orchestrator-types";

export async function triagePatientAction(input: TriageInput): Promise<TriageOutput> {
    try {
        const result = await triagePatientWithAgents(input);
        return result;
    } catch (error: any) {
        console.error("Error in triagePatientAction:", error);
        // Throw the actual error message to debugging easier on the client
        throw new Error(`Failed to triage patient: ${error.message || 'Unknown error'}`);
    }
}

// Mock data generation removed to enforce strict real-time AI analysis.
