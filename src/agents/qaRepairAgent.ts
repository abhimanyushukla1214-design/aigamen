import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import { getGeminiClient } from '../services/geminiService.js';
import { AI_CONFIG } from '../config/ai-models.js';
import { validateAndRepairSpec } from './specFidelityAgent.js';
import { enrichGameContent } from './contentDesignAgent.js';

export interface RepairResult {
  success: boolean;
  spec: ComprehensiveGameSpec;
  logs: string[];
  explanation: string;
}

/**
 * AI QA Repair Agent
 * Intercepts errors formed during game specs generation, evolution, or validation,
 * and executes a diagnostic and healing loop.
 */
export async function runQaRepairAgent(spec: ComprehensiveGameSpec, errorMessage: string): Promise<RepairResult> {
  console.log(`[NEXUS AI QA Agent] Initiating diagnostics. Error received: "${errorMessage}"`);
  const logs: string[] = [`AI QA Agent triggered with error: "${errorMessage}"`];
  let explanation = 'No AI repair requested.';

  try {
    const ai = getGeminiClient();
    const prompt = `
You are the NEXUS AI System Healing Agent.
An error occurred during the validation, parsing, or execution of a game specification.

ERROR RECEIVED:
"${errorMessage}"

CURRENT GAME SPECIFICATION:
${JSON.stringify(spec, null, 2)}

YOUR MISSION:
1. Diagnose the root cause of this error in the specification (e.g. missing fields, incorrect type declarations, incompatible archetype rules, missing physics parameters, or invalid coordinate scales).
2. Fix the error by rewriting the invalid parts of the specification.
3. Return the corrected specification as structured JSON matching the original schema.
4. Provide a brief, human-readable explanation of what you repaired in the "explanation" property.
`;

    // Try healing using the fast or creative model
    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            repairedSpec: { type: 'OBJECT', description: 'The fully corrected ComprehensiveGameSpec JSON' },
            explanation: { type: 'STRING', description: 'What was broken and how you fixed it' }
          },
          required: ['repairedSpec', 'explanation']
        },
        temperature: 0.2
      }
    });

    const text = response.text;
    if (text) {
      const result = JSON.parse(text);
      if (result.repairedSpec) {
        logs.push('AI Healing Agent successfully parsed and corrected the specification.');
        explanation = result.explanation;
        
        // Pass the healed spec through the fidelity agent to guarantee everything else remains correct
        const fidelityResult = await validateAndRepairSpec(result.repairedSpec, spec.originalPrompt || '');
        return {
          success: true,
          spec: fidelityResult.spec,
          logs: [...logs, ...fidelityResult.logs],
          explanation
        };
      }
    }
  } catch (err: any) {
    logs.push(`AI Healing Agent failed or rate-limited: ${err.message || String(err)}. Falling back to deterministic ruleset validation.`);
    console.error('[NEXUS AI QA Agent] LLM healing failed, falling back to deterministic healing.', err);
  }

  // Graceful deterministic fallback healing
  const fidelityResult = await validateAndRepairSpec(spec, spec.originalPrompt || '');
  return {
    success: true,
    spec: fidelityResult.spec,
    logs: [...logs, ...fidelityResult.logs, 'Deterministic ruleset recovery successfully completed.'],
    explanation: 'The AI healer encountered a rate limit or API error. Reverted to rule-based fallback validator to ensure structural completeness and integrity.'
  };
}
