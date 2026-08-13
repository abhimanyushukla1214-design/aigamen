const fs = require('fs');
let code = fs.readFileSync('src/agents/gameDirector.ts', 'utf-8');

const old = `else if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('space') || lowerPrompt.includes('alien')) theme = ['sci-fi'];`;
const replace = `else if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('space') || lowerPrompt.includes('alien') || lowerPrompt.includes('europa') || lowerPrompt.includes('astronaut')) theme = ['sci-fi'];`;

code = code.replace(old, replace);
fs.writeFileSync('src/agents/gameDirector.ts', code);
