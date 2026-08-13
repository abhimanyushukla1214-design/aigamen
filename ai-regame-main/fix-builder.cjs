const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

const importToAdd = "import { generateGameHTML } from '../engine/template.js';\nimport { ComprehensiveGameSpec } from '../types/nexusSpec.js';\n";
code = importToAdd + code;

const endpointToAdd = `
// Phase 7: Game Builder (Deterministic Engine)
nexusRouter.post('/build-game', (req: Request, res: Response) => {
  const startTime = Date.now();
  const { spec } = req.body as { spec: ComprehensiveGameSpec };

  if (!spec) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "spec" is required.');
  }

  try {
    const html = generateGameHTML(spec);
    return sendSuccess(res, { html }, 'Phase 7 Game Builder', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Game Builder Error]', error);
    return sendError(res, 500, 'BUILD_FAILED', 'NEXUS could not build the game html.');
  }
});
`;

code = code.replace(
  /\/\/ 5\. Build Game Endpoint[\s\S]*?(?=\/\/ 6\. QA Validate Endpoint)/,
  endpointToAdd
);

fs.writeFileSync('src/server/routes.ts', code);
