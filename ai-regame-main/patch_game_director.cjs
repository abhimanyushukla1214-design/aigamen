const fs = require('fs');
let code = fs.readFileSync('src/agents/gameDirector.ts', 'utf8');

code = code.replace(
  /if \(\(err as Error\).message.includes\('429'\)\) \{/g,
  `if ((err as Error).message.includes('429') || (err as Error).message.includes('503') || (err as Error).message.includes('500') || (err as Error).message.includes('UNAVAILABLE') || (err as Error).message.includes('model is currently experiencing high demand')) {`
);

fs.writeFileSync('src/agents/gameDirector.ts', code);
console.log("Game Director patched.");
