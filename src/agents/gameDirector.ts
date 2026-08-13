import { generateStructuredJson, generateText } from '../services/geminiService.js';
import { gameDirectorPlanSchema } from '../services/geminiSchemas.js';
import { GameDirectorPlan } from '../types/nexus.js';

export async function orchestrateGameDirector(prompt: string, requestId: string): Promise<GameDirectorPlan> {
  const promptArchitectInstruction = `
You are the NEXUS GAME PROMPT ARCHITECT.
Your job is to transform a short, vague natural-language game idea from the user into an extremely detailed, implementation-ready GAME CREATION PROMPT.

Your responsibility is to understand what the user means, expand the idea intelligently, remove ambiguity, preserve the user's original intent, and produce a highly detailed specification prompt that another AI system can use to design and build the game.

Follow the 32-section blueprint format precisely and exhaustively:
1. GAME IDENTITY: Working title, genre, subgenre, theme, tone, unique selling point.
2. USER INTENT: List of explicit requirements vs intelligently inferred assumptions.
3. PLAYER EXPERIENCE: Pacing, difficulty curve, feel of movement, combat, exploration, reward, and failure.
4. WORLD: Setting name, interactive environment elements, hazards, traversal paths, aesthetic depth.
5. STORY: Premise, protagonist motivation, central conflict, major quest checkpoints, end condition.
6. CHARACTER: Protagonist identity, aesthetic role, capabilities, animations, interactive states.
7. ENEMIES / NPCS: Types of threats/NPCs, AI behavior, movement patterns, reactions, defeat animations.
8. CORE GAMEPLAY: Core loop, secondary loops, player actions, key interaction systems.
9. PLAYER MOVEMENT: Speed, acceleration, deceleration, jump/gravity physics, dash, friction, collisions.
10. COMBAT / INTERACTION: Attack timing, ranges, hitboxes, knockback, damage types, defeat responses.
11. GAME OBJECTS: Key obstacles, platforms, gates, collectibles, triggers, checkpoints, projectiles.
12. LEVEL DESIGN: Detailed flow of Level 1 (spawn, tutorial, challenge 1, mini-boss/gimmick, checkpoint, final objective, exit).
13. PROGRESSION: Score tracking, health system, power-ups, levels.
14. WIN CONDITION: Explicit win condition state.
15. LOSS CONDITION: Explicit loss/game-over conditions.
16. PHYSICS: Specific gravity values, velocities, bounds, arcade behaviors.
17. CAMERA: Camera perspective (e.g. side-scroller, top-down), smoothing, zoom, boundaries, screenshake.
18. VISUAL STYLE: Distinctive art direction, rendering approach, lighting mood, UI style.
19. ENVIRONMENT ART: Layered assets (Background, Midground, Gameplay Layer, Foreground) and parallax behavior.
20. CHARACTER ART: Vector/procedural construction guides, silhouette parameters, color styling.
21. ANIMATION: Keyframe definitions for Idle, Walk, Jump, Attack, Hurt, and Die.
22. PARTICLES / EFFECTS: Impact sparks, trailing dust, explosions, glowing markers.
23. UI/UX: Layout configurations for Main Menu, Intro Cinematic HUD, Pause overlay, Win screen, Lose screen.
24. INTRO SEQUENCE: Specific cinematic text fade, title reveal, instructions flash, and spawn triggers.
25. AUDIO DIRECTION: Interactive audio feedback, score/synth style, SFX triggers.
26. RESPONSIVENESS: Multi-device scale handling, click/touch conversions.
27. PERFORMANCE: Framerate targets, optimization loops, rendering priority.
28. TECHNICAL IMPLEMENTATION: Isolated game-loop runtime, Canvas/DOM hybrid rendering.
29. SECURITY CONSTRAINTS: Sanitization, API protection.
30. QUALITY REQUIREMENTS: Minimum prototyping polish, visual hierarchy rules.
31. DIFFERENTIATION REQUIREMENTS: Contrast, color identity.
32. FINAL BUILD OBJECTIVE: A comprehensive summary description of the fully interactive final product.

CRITICAL RULE:
If the user's input does not mention any score-related details (e.g. points, scoring, coins, collectibles) or health-related details (e.g. hp, health bar, lives, damage, hurt items, enemies), you MUST proactively design and include:
1. Some score items or collectibles (e.g. glowing energy spheres, neon coins) to keep the player engaged.
2. A basic HP or health reducer item/hazard (e.g. spike hazard, environmental trap, or health reducer item) that decreases player's health when touched, ensuring there is a survival element.
This is mandatory unless they explicitly opt out of scoring or health systems. Do not forget this!

Return your final output strictly as a highly detailed, elegantly structured, professional markdown-formatted GAME CREATION PROMPT. Do not output anything else but the prompt itself.
  `;

  let expandedPrompt = '';
  try {
    const res = await generateText({
      prompt: `Transform this user game idea into an extremely detailed game creation prompt using the 32-step architect blueprint: "${prompt}"`,
      systemInstruction: promptArchitectInstruction,
    });
    expandedPrompt = res.data;
  } catch (err) {
    console.error('[NEXUS Game Director] Failed to generate expanded prompt, using original:', err);
    expandedPrompt = `ORIGINAL CONCEPT: ${prompt}\n\nPlease build a highly advanced game based on this concept, fleshing out all 32 design sections.`;
  }

  const systemInstruction = `
You are the Game Director for the NEXUS AI Game Universe Engine.
Your job is to analyze the user's natural-language game idea (which has been expanded into an extremely detailed design blueprint by our Prompt Architect) and extract the structured intent, as well as create a structured design plan for the specialized domains (world, story, character, gameplay, physics, cinematography) to execute in the next phase.

CRITICAL RULES:
1. Distinguish between what the user EXPLICITLY requested (constraints) and what you INFERRED (assumptions).
2. If the user doesn't specify a property (like camera perspective), set it to "unspecified" in the intent, and add your reasonable assumption in the "assumptions" array.
3. Your output MUST match the provided JSON schema EXACTLY.
4. Keep the design tasks concise and actionable.
  `;

  let result;
  try {
    result = await generateStructuredJson<Omit<GameDirectorPlan, 'requestId' | 'originalPrompt' | 'pipeline' | 'expandedPrompt'>>({
      prompt: `Analyze this detailed game design blueprint and extract the core intent, design plan, constraints, and assumptions as structured JSON:\n\n${expandedPrompt}`,
      systemInstruction,
      schema: gameDirectorPlanSchema,
    });
  } catch (err) {
    console.warn('[NEXUS GameDirector] generateStructuredJson failed or quota exceeded. Returning fallback MVP plan.', err);
    const fallback = getFallbackPlan(prompt, requestId);
    fallback.expandedPrompt = expandedPrompt;
    return fallback;
  }

  return {
    requestId,
    originalPrompt: prompt,
    expandedPrompt,
    intent: result.data.intent,
    designDomains: result.data.designDomains,
    constraints: result.data.constraints,
    assumptions: result.data.assumptions,
    pipeline: [
      { stage: 'Analyzing intent', status: 'complete' },
      { stage: 'World architecture', status: 'pending' },
      { stage: 'Narrative structure', status: 'pending' },
      { stage: 'Character design', status: 'pending' },
      { stage: 'Gameplay systems', status: 'pending' },
      { stage: 'Physics model', status: 'pending' },
      { stage: 'Cinematic direction', status: 'pending' },
      { stage: 'DESIGN PLAN READY', status: 'pending' }
    ]
  };
}


function getFallbackPlan(prompt: string, requestId: string): GameDirectorPlan {
  const lowerPrompt = prompt.toLowerCase();
  
  let genre = ['action'];
  if (lowerPrompt.includes('racing') || lowerPrompt.includes('race') || lowerPrompt.includes('drive')) genre = ['racing'];
  else if (lowerPrompt.includes('platform')) genre = ['platformer'];
  else if (lowerPrompt.includes('puzzle')) genre = ['puzzle'];
  else if (lowerPrompt.includes('surviv')) genre = ['survival'];
  else if (lowerPrompt.includes('rpg') || lowerPrompt.includes('role play')) genre = ['rpg'];
  else if (lowerPrompt.includes('explor')) genre = ['exploration'];

  let theme = ['custom'];
  if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('neon')) theme = ['cyberpunk', 'sci-fi'];
  else if (lowerPrompt.includes('fantasy') || lowerPrompt.includes('medieval') || lowerPrompt.includes('magic')) theme = ['fantasy'];
  else if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('space') || lowerPrompt.includes('alien') || lowerPrompt.includes('europa') || lowerPrompt.includes('astronaut')) theme = ['sci-fi'];
  else if (lowerPrompt.includes('horror') || lowerPrompt.includes('dark')) theme = ['horror'];

  let setting = 'Unknown World';
  if (theme.includes('cyberpunk')) setting = 'Neon City';
  if (theme.includes('fantasy')) setting = 'Ancient Kingdom';
  if (theme.includes('sci-fi')) setting = 'Space Station';

  let playerRole = 'protagonist';
  if (lowerPrompt.includes('motorcycle') || lowerPrompt.includes('car') || lowerPrompt.includes('vehicle')) playerRole = 'driver';
  else if (lowerPrompt.includes('warrior') || lowerPrompt.includes('knight')) playerRole = 'warrior';
  else if (lowerPrompt.includes('astronaut')) playerRole = 'astronaut';

  let cameraPerspective = 'unspecified';
  if (genre.includes('racing') || lowerPrompt.includes('top down') || lowerPrompt.includes('top-down')) cameraPerspective = '2D_TOP_DOWN';
  else if (genre.includes('platformer') || lowerPrompt.includes('side scroll')) cameraPerspective = '2D_SIDE_SCROLLER';

  return {
    requestId,
    originalPrompt: prompt,
    intent: {
      summary: prompt,
      genre,
      theme,
      setting,
      playerRole,
      cameraPerspective,
      gameplayStyle: genre,
      atmosphere: theme
    },
    designDomains: {
      world: { objective: 'Design the physical layout', requiredInputs: [], expectedOutputs: [], priority: 'high' },
      story: { objective: 'Create narrative', requiredInputs: [], expectedOutputs: [], priority: 'high' },
      character: { objective: 'Define protagonist', requiredInputs: [], expectedOutputs: [], priority: 'medium' },
      gameplay: { objective: 'Establish mechanics', requiredInputs: [], expectedOutputs: [], priority: 'high' },
      physics: { objective: 'Configure physics', requiredInputs: [], expectedOutputs: [], priority: 'low' },
      cinematography: { objective: 'Set visual tone', requiredInputs: [], expectedOutputs: [], priority: 'medium' }
    },
    constraints: [],
    assumptions: ['Generated from fallback regex parser'],
    pipeline: [
      { stage: 'Analyzing intent', status: 'complete' },
      { stage: 'DESIGN PLAN READY', status: 'pending' }
    ]
  };
}

