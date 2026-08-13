import { Type, Schema } from '@google/genai';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import { AI_CONFIG } from '../config/ai-models.js';
import { getGeminiClient } from '../services/geminiService.js';

const evolutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    changes: {
      type: Type.ARRAY,
      description: "List of changes made based on user feedback.",
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING, description: "e.g., gameplay, physics, world" },
          target: { type: Type.STRING },
          action: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["domain", "target", "action", "reason"]
      }
    },
    updatedSpec: {
      type: Type.OBJECT,
      description: "The full, modified comprehensive game specification incorporating the changes.",
      properties: {
        title: { type: Type.STRING },
        world: { type: Type.OBJECT, properties: { settingName: { type: Type.STRING }, environmentType: { type: Type.STRING }, atmosphere: { type: Type.STRING }, keyLocations: { type: Type.ARRAY, items: { type: Type.STRING } }, loreBackground: { type: Type.STRING } }, required: ['settingName', 'environmentType', 'atmosphere', 'keyLocations', 'loreBackground'] },
        story: { type: Type.OBJECT, properties: { logline: { type: Type.STRING }, theme: { type: Type.STRING }, incitingIncident: { type: Type.STRING }, mainQuest: { type: Type.STRING }, narrativeTone: { type: Type.STRING } }, required: ['logline', 'theme', 'incitingIncident', 'mainQuest', 'narrativeTone'] },
        character: { type: Type.OBJECT, properties: { protagonist: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING }, motivation: { type: Type.STRING }, abilities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['name', 'role', 'motivation', 'abilities'] }, antagonistOrHazard: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['name', 'description'] }, keyNPCs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING } }, required: ['name', 'role'] } } }, required: ['protagonist', 'antagonistOrHazard'] },
        gameplay: { type: Type.OBJECT, properties: { coreLoop: { type: Type.STRING }, primaryMechanics: { type: Type.ARRAY, items: { type: Type.STRING } }, progressionSystem: { type: Type.STRING }, winCondition: { type: Type.STRING }, lossCondition: { type: Type.STRING }, controls: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { key: { type: Type.STRING }, action: { type: Type.STRING } }, required: ['key', 'action'] } } }, required: ['coreLoop', 'primaryMechanics', 'progressionSystem', 'winCondition', 'lossCondition', 'controls'] },
        physics: { type: Type.OBJECT, properties: { gravity: { type: Type.NUMBER }, movementSpeed: { type: Type.NUMBER }, jumpForce: { type: Type.NUMBER }, friction: { type: Type.NUMBER }, collisionType: { type: Type.STRING }, environmentalHazards: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['gravity', 'movementSpeed', 'jumpForce', 'friction', 'collisionType', 'environmentalHazards'] },
        cinematography: { type: Type.OBJECT, properties: { cameraPerspective: { type: Type.STRING }, visualStyle: { type: Type.STRING }, colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } }, lightingMood: { type: Type.STRING }, uiStyle: { type: Type.STRING } }, required: ['cameraPerspective', 'visualStyle', 'colorPalette', 'lightingMood', 'uiStyle'] }
      },
      required: ['title', 'world', 'story', 'character', 'gameplay', 'physics', 'cinematography']
    }
  },
  required: ["changes", "updatedSpec"]
};

export async function evolveGameSpecification(currentSpec: ComprehensiveGameSpec, feedback: string): Promise<{ changes: any[], updatedSpec: ComprehensiveGameSpec }> {
  const prompt = `You are the NEXUS Game Evolution Agent.
Your task is to take an existing Game Specification Document and user feedback, and produce a structured change plan AND an updated game specification.

EXISTING SPECIFICATION:
${JSON.stringify(currentSpec, null, 2)}

USER FEEDBACK:
"${feedback}"

INSTRUCTIONS:
1. Preserve the existing game's identity unless explicitly asked to change it.
2. Produce a list of "changes" outlining what you modified.
3. Produce the full "updatedSpec" with those changes applied.
4. Output must match the JSON schema perfectly.`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: evolutionSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const result = JSON.parse(text);
    return {
      changes: result.changes,
      updatedSpec: {
        ...result.updatedSpec,
        gameId: currentSpec.gameId // Preserve gameId
      }
    };
  } catch (error: any) {
    if (error.message && (error.message.includes('429') || error.message.includes('503') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('UNAVAILABLE') || error.message.includes('high demand'))) {
      console.log('Rate limit/quota exceeded evolving game specification. Returning unchanged.');
      throw new Error('Evolution could not be completed. Your current game is unchanged.');
    }
    console.error('Error evolving game specification:', error);
    throw new Error('Evolution could not be completed. Your current game is unchanged.');
  }
}
