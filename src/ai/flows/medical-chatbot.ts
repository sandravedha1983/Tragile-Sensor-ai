'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
});

const MedicalChatbotInputSchema = z.object({
    symptoms: z.string().describe('The current symptoms described by the patient.'),
    history: z.array(ChatMessageSchema).optional().describe('Previous messages in the conversation.'),
});

const MedicalChatbotOutputSchema = z.object({
    analysis: z.string().describe('Analysis of the symptoms.'),
    suggestions: z.array(z.string()).describe('Possible condition suggestions.'),
    nextSteps: z.array(z.string()).describe('Recommended next steps.'),
    riskLevel: z.enum(['Low', 'Moderate', 'High']).describe('Risk indication.'),
    precautions: z.array(z.string()).describe('Basic precaution advice.'),
    isEmergency: z.boolean().describe('Whether the symptoms indicate a medical emergency.'),
    disclaimer: z.string().describe('Mandatory medical disclaimer.'),
});

const medicalChatbotPrompt = ai.definePrompt({
    name: 'medicalChatbotPrompt',
    input: { schema: MedicalChatbotInputSchema },
    output: { schema: MedicalChatbotOutputSchema },
    prompt: `You are an AI medical assistant for a healthcare platform.
Analyze the patient's symptoms and provide guidance.

IMPORTANT:
- Always include the disclaimer: "This is not a medical diagnosis. Please consult a doctor for accurate medical advice."
- If critical symptoms like chest pain, low oxygen, or stroke signs are detected, set isEmergency to true and advise seeking immediate emergency attention.
- Be empathetic but professional.

Symptoms: {{{symptoms}}}
History: {{{history}}}
`,
});

export const medicalChatbotFlow = ai.defineFlow(
    {
        name: 'medicalChatbotFlow',
        inputSchema: MedicalChatbotInputSchema,
        outputSchema: MedicalChatbotOutputSchema,
    },
    async (input) => {
        const { output } = await medicalChatbotPrompt(input);
        if (!output) throw new Error('No output from AI');
        return output;
    }
);

export async function runMedicalChatbot(input: z.infer<typeof MedicalChatbotInputSchema>) {
    return medicalChatbotFlow(input);
}
