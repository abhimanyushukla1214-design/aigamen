const fs = require('fs');

let content = fs.readFileSync('src/engine/gameBuilder.ts', 'utf-8');

const promptAddition = `
const prompt = \`Here is the Game Specification:
\${JSON.stringify(spec, null, 2)}

Please generate the complete HTML file for this game according to the instructions.\`;
`;

content = content.replace(
  'const prompt = `Here is the Game Specification:',
  'const prompt = `Here is the Game Specification:'
);

fs.writeFileSync('src/engine/gameBuilder.ts', content);
