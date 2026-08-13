import { generateStructuredJson } from '../services/geminiService.js';
import { animeVisualSpecificationSchema, motionSpecificationSchema } from '../services/geminiSchemas.js';
import { AnimeVisualSpecification, MotionSpecification } from '../types/nexusSpec.js';

export async function generateAnimeVisualSpec(prompt: string, gameDirectorPlan: any): Promise<AnimeVisualSpecification> {
  const systemInstruction = `You are the Anime Visual Director for the NEXUS AI Game Universe Engine.
Your job is to take the Game Director's plan and the user's prompt, and output a highly detailed 2D anime visual, environment, animation, motion, camera, and UI specification.
Create a specification for a cinematic 2D anime game. Focus on layered environments, parallax, procedural effects, particles, lighting, and sophisticated anime UI.
Do NOT use copyrighted material. Make it a unique anime-inspired art direction.`;

  const inputPrompt = `User Prompt: ${prompt}
  
Game Director Plan:
${JSON.stringify(gameDirectorPlan, null, 2)}`;

  let result;
  try {
    result = await generateStructuredJson<AnimeVisualSpecification>({
      prompt: inputPrompt,
      systemInstruction,
      schema: animeVisualSpecificationSchema,
    });
  } catch (err) {
    console.log('[NEXUS AnimeVisualDirector] Quota exceeded. Returning fallback visual spec.');
    return getFallbackAnimeVisualSpec();
  }

  return result.data;
}

export async function generateMotionSpec(prompt: string, gameDirectorPlan: any): Promise<MotionSpecification> {
  const systemInstruction = `You are the Motion Director for the NEXUS AI Game Universe Engine.
Your job is to generate physical motion constraints for a 2D anime game based on the user prompt and Game Director's plan.
Specify smooth acceleration, velocity-based movement, and camera responses.`;

  const inputPrompt = `User Prompt: ${prompt}
  
Game Director Plan:
${JSON.stringify(gameDirectorPlan, null, 2)}`;

  let result;
  try {
    result = await generateStructuredJson<MotionSpecification>({
      prompt: inputPrompt,
      systemInstruction,
      schema: motionSpecificationSchema,
    });
  } catch (err) {
    console.log('[NEXUS MotionDirector] Quota exceeded. Returning fallback motion spec.');
    return getFallbackMotionSpec();
  }

  return result.data;
}

function getFallbackAnimeVisualSpec(): AnimeVisualSpecification {
  return {
    visualStyle: ['cinematic 2D anime', 'layered environment', 'detailed silhouettes'],
    artDirection: 'Dark, atmospheric sci-fi with glowing neon highlights.',
    colorPalette: ['#0f172a', '#3b82f6', '#ef4444', '#1e293b'],
    environment: {
      background: ['sky', 'moon', 'distant structures'],
      midground: ['mountains', 'buildings'],
      gameplay: ['terrain', 'platforms', 'objects'],
      foreground: ['grass', 'particles', 'foreground structures'],
      atmosphere: ['fog', 'dust', 'snow']
    },
    characterVisuals: {
      proportions: 'anime-inspired proportions',
      clothing: ['exploration suit', 'animated visor'],
      accessories: ['equipment backpack']
    },
    animation: ['idle', 'walk', 'run', 'jump', 'fall'],
    camera: ['smooth follow', 'cinematic framing', 'screen shake'],
    lighting: ['ambient light', 'point lights', 'character glow'],
    particles: ['snow', 'ice particles', 'energy effects'],
    effects: ['fog', 'glow'],
    composition: ['dynamic', 'rule of thirds'],
    uiDirection: 'minimalist, glassmorphism, glowing accents',
    motionDirection: 'smooth, weighty, responsive'
  };
}

function getFallbackMotionSpec(): MotionSpecification {
  return {
    acceleration: 1500,
    deceleration: 1000,
    maximumSpeed: 300,
    jump: -500,
    gravity: 900,
    airControl: 0.5,
    friction: 0.8,
    dash: 800,
    knockback: 400,
    animationSpeed: 1,
    cameraResponse: ['slight vertical response on jump', 'shake on landing'],
    environmentalMovement: ['parallax layers']
  };
}
