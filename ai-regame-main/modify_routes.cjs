const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

code = code.replace(/import \{ generateGameHTML \} from '\.\.\/engine\/template\.js';/, `import { buildGame } from '../engine/gameBuilder.js';`);

code = code.replace(/\/\/ Phase 7: Game Builder \(Deterministic Engine\)\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n\}\);/s, `// Phase 6: Game Builder (Deterministic Engine)
nexusRouter.post('/build-game', (req: Request, res: Response) => {
  const startTime = Date.now();
  const { spec } = req.body as { spec: ComprehensiveGameSpec };

  if (!spec) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "spec" is required.');
  }

  const result = buildGame({ spec });
  if (!result.success) {
    return sendError(res, 400, 'VALIDATION_FAILED', result.error || 'Game validation failed');
  }

  return sendSuccess(res, { html: result.html }, 'Phase 6 Game Builder', Date.now() - startTime);
});`);

fs.writeFileSync('src/server/routes.ts', code);
console.log("Routes modified.");
