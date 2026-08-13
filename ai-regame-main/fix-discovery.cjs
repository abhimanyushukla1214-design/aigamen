const fs = require('fs');
let code = fs.readFileSync('src/agents/discoveryAgent.ts', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
code = code.replace(/\\n/g, '\n');

fs.writeFileSync('src/agents/discoveryAgent.ts', code);
