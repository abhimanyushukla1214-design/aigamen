const fs = require('fs');

const code = `import { GameBuildRequest, GameBuildResult, PlayableGameDefinition } from '../types/gameBuilder.js';
import { generateGameHTML } from './template.js';
import { generateText } from '../services/geminiService.js';
import { AI_CONFIG } from '../config/ai-models.js';

export function validateGameSpec(spec: any): string | null {
  if (!spec) return 'Game Specification is missing.';
  if (!spec.title) return 'Game title is missing.';
  if (!spec.world || !spec.world.settingName) return 'World setting is missing.';
  if (!spec.gameplay || !spec.gameplay.controls) return 'Controls are missing.';
  if (!spec.gameplay.winCondition && !spec.gameplay.lossCondition) return 'Objectives (win/lose conditions) are missing.';
  if (!spec.physics) return 'Physics domain is missing.';
  if (!spec.cinematography) return 'Cinematography domain is missing.';
  return null;
}

export async function buildGame(request: GameBuildRequest): Promise<GameBuildResult> {
  const err = validateGameSpec(request.spec);
  if (err) {
    return { success: false, error: err };
  }

  const spec = request.spec;
  const isTopDown = spec.cinematography.cameraPerspective === '2D_TOP_DOWN';
  const hasEnemies = spec.character.antagonistOrHazard?.name ? true : false;
  
  // Create deterministic representation for fallback
  const definition: PlayableGameDefinition = {
    title: spec.title,
    theme: {
      background: spec.cinematography.colorPalette?.[0] || '#111827',
      player: spec.cinematography.colorPalette?.[1] || '#06b6d4',
      platform: spec.cinematography.colorPalette?.[3] || '#374151',
      enemy: spec.cinematography.colorPalette?.[2] || '#ef4444',
      collectible: '#f59e0b',
    },
    physics: {
      gravity: isTopDown ? 0 : (spec.physics.gravity || 9.8) / 16.3, // scale down for pixel physics
      jumpForce: (spec.physics.jumpForce || 10) * 1.2,
      movementSpeed: (spec.physics.movementSpeed || 5) * 1.5,
      friction: spec.physics.friction || 0.8,
    },
    world: { width: 3000, height: 1000 },
    player: { width: 30, height: 30, startX: 100, startY: 800 },
    entities: {
      platforms: [
        { x: -500, y: 900, width: 4000, height: 100 },
        { x: 400, y: 750, width: 200, height: 20 },
        { x: 800, y: 600, width: 150, height: 20 },
        { x: 1200, y: 450, width: 100, height: 20 },
        { x: 1600, y: 300, width: 80, height: 20 },
      ],
      enemies: hasEnemies ? [
        { x: 500, y: 860, width: 30, height: 30, speedX: 2, speedY: 0 },
        { x: 1200, y: 860, width: 30, height: 30, speedX: -2, speedY: 0 },
      ] : [],
      collectibles: [
        { x: 490, y: 700, width: 16, height: 16 },
        { x: 860, y: 550, width: 16, height: 16 },
        { x: 1240, y: 400, width: 16, height: 16 },
      ],
      portal: { x: 1610, y: 200, width: 60, height: 100 },
    },
    winCondition: spec.gameplay.winCondition,
    loseCondition: spec.gameplay.lossCondition,
    controls: spec.gameplay.controls
  };

  const systemInstruction = \`You are a senior game engineer, interaction designer, UI/UX designer, procedural graphics programmer and gameplay programmer.
Generate a polished browser-game prototype from the supplied GameSpecification.
The game must prioritize:
1. Playability
2. Smooth movement
3. Clear controls
4. Strong visual hierarchy
5. Procedural graphics
6. Responsive UI
7. Camera quality
8. Physics consistency
9. Cinematic presentation
10. Performance
Use HTML/CSS for interface.
Use Canvas/WebGL for game rendering.
Use JavaScript/TypeScript for gameplay systems.
Never represent the complete game visually using simple static rectangles.
Use geometry, gradients, particles, lighting, animation and camera effects to create visual depth.

Return ONLY the raw HTML source code, beginning with <!DOCTYPE html> and ending with </html>. Do not wrap it in markdown blockquotes.\`;

  const prompt = \`Here is the Game Specification:
\${JSON.stringify(spec, null, 2)}

Please generate the complete HTML file for this game according to the instructions.\`;

  try {
    const result = await generateText({
      prompt,
      systemInstruction,
      model: AI_CONFIG.MODEL_FAST // keep it fast
    });
    
    let html = result.data;
    
    // Clean up possible markdown wrappers
    if (html.startsWith('\`\`\`html')) {
        html = html.replace(/^\`\`\`html\\n/, '');
    } else if (html.startsWith('\`\`\`')) {
        html = html.replace(/^\`\`\`\\n/, '');
    }
    if (html.endsWith('\`\`\`')) {
        html = html.replace(/\\n\`\`\`$/, '');
    }
    
    // Validate we actually got some HTML out of it
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
        throw new Error("Invalid output format from model.");
    }
    
    return { success: true, definition, html };
  } catch (e: any) {
    console.warn('[NEXUS GameBuilder] AI generation failed or rate limited, using procedural fallback template.', e.message);
    try {
      const html = generateGameHTML(definition);
      return { success: true, definition, html };
    } catch (fallbackError: any) {
      return { success: false, error: fallbackError.message || 'Error generating HTML sandbox fallback' };
    }
  }
}
\`;

fs.writeFileSync('src/engine/gameBuilder.ts', code);
