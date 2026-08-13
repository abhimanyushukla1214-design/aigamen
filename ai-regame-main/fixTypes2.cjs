const fs = require('fs');
let code = fs.readFileSync('src/types/gameBuilder.ts', 'utf-8');

code = code.replace(
  "import { ComprehensiveGameSpec } from './nexusSpec.js';",
  "import { ComprehensiveGameSpec } from './nexusSpec.js';\nimport { VisualGameSpecification } from '../agents/visualDesignAgent.js';"
);

code = code.replace(
  "export interface PlayableGameDefinition {",
  "export interface PlayableGameDefinition {\n  visuals: VisualGameSpecification;\n  seed: string;\n  objectives: string[];"
);

fs.writeFileSync('src/types/gameBuilder.ts', code);
