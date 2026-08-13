const fs = require('fs');
let code = fs.readFileSync('src/agents/gameDirector.ts', 'utf-8');

const fallbackRegex = /function getFallbackPlan.*?return \{.*?\}\;/s;

const newFallback = `
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
  else if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('space') || lowerPrompt.includes('alien')) theme = ['sci-fi'];
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
`;

code = code.replace(fallbackRegex, newFallback);
fs.writeFileSync('src/agents/gameDirector.ts', code);
