const fs = require('fs');
let code = fs.readFileSync('src/agents/evolutionAgent.ts', 'utf8');

const regex = /catch\s*\(\s*error\s*\)\s*\{\s*console\.error\('Error evolving game specification:', error\);\s*throw\s*error;\s*\}/g;

code = code.replace(regex, `catch (error: any) {
    console.error('Error evolving game specification:', error);
    if (error.message && (error.message.includes('429') || error.message.includes('503'))) {
      throw new Error('Evolution could not be completed. Your current game is unchanged.');
    }
    throw new Error('Evolution could not be completed. Your current game is unchanged.');
  }`);

fs.writeFileSync('src/agents/evolutionAgent.ts', code);
console.log("Evolution agent error patched.");
