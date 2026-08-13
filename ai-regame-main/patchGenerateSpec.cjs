const fs = require('fs');

let content = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf-8');

if (!content.includes('AnimeVisualDirector')) {
  content = `import { generateAnimeVisualSpec, generateMotionSpec } from './animeVisualDirector.js';\n` + content;
}

if (!content.includes('animeVisual:') && content.includes('return spec;')) {
    content = content.replace(
      'return spec;',
      `
    const animeVisual = await generateAnimeVisualSpec(plan.originalPrompt || '', plan);
    const motion = await generateMotionSpec(plan.originalPrompt || '', plan);
    spec.animeVisual = animeVisual;
    spec.motion = motion;
    
    return spec;
      `
    );
}

fs.writeFileSync('src/agents/gameSpecAgent.ts', content);
