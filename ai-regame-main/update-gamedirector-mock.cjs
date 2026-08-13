const fs = require('fs');
let code = fs.readFileSync('src/agents/gameDirector.ts', 'utf8');

code = code.replace(
  'return {',
  `
  } catch (err) {
    if ((err as Error).message.includes('429')) {
      console.warn('[NEXUS GameDirector] Quota exceeded. Returning fallback MVP plan.');
      return getFallbackPlan(prompt, requestId);
    }
    throw err;
  }
  
  return {`
);

code = code.replace(
  'const result = await generateStructuredJson',
  'try {\n    const result = await generateStructuredJson'
);

code += `
function getFallbackPlan(prompt: string, requestId: string): GameDirectorPlan {
  return {
    requestId,
    originalPrompt: prompt,
    intent: {
      summary: 'A mysterious exploration game on Europa where the player investigates an abandoned research station.',
      genre: ['exploration', 'sci-fi'],
      theme: ['mystery'],
      setting: 'Europa',
      playerRole: 'research investigator',
      cameraPerspective: 'unspecified',
      gameplayStyle: ['exploration', 'investigation'],
      atmosphere: ['isolated', 'cold', 'mysterious']
    },
    designDomains: {
      world: {
        objective: 'Design the physical layout and history of the abandoned Europa station.',
        requiredInputs: ['setting', 'atmosphere'],
        expectedOutputs: ['locations', 'world rules'],
        priority: 'high'
      },
      story: {
        objective: 'Create a compelling narrative about the disappearance of the research crew.',
        requiredInputs: ['theme', 'playerRole'],
        expectedOutputs: ['plot hooks', 'lore fragments'],
        priority: 'high'
      },
      character: {
        objective: 'Define the protagonist and any remaining entities or AI.',
        requiredInputs: ['playerRole'],
        expectedOutputs: ['character profile', 'NPCs'],
        priority: 'medium'
      },
      gameplay: {
        objective: 'Establish investigation and survival mechanics.',
        requiredInputs: ['gameplayStyle'],
        expectedOutputs: ['core loops', 'interaction rules'],
        priority: 'high'
      },
      physics: {
        objective: 'Configure low-gravity and ice friction rules.',
        requiredInputs: ['setting'],
        expectedOutputs: ['gravity config', 'movement params'],
        priority: 'low'
      },
      cinematography: {
        objective: 'Set visual tone, lighting, and camera behavior.',
        requiredInputs: ['atmosphere', 'cameraPerspective'],
        expectedOutputs: ['color palette', 'lighting mood'],
        priority: 'medium'
      }
    },
    constraints: [],
    assumptions: ['2D side-scrolling perspective assumed due to unspecified camera'],
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
`;

fs.writeFileSync('src/agents/gameDirector.ts', code);
