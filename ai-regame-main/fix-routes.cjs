const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

const importToAdd = "import { generateGameSpecification } from '../agents/gameSpecAgent.js';\nimport { GameDirectorPlan } from '../types/nexus.js';\n";
code = importToAdd + code;

const endpointToAdd = `
// Phase 6: Game Specification Pipeline
nexusRouter.post('/generate-spec', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { plan } = req.body as { plan: GameDirectorPlan };

  if (!plan) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "plan" is required.');
  }

  if (!isGeminiConfigured()) {
    return sendError(
      res,
      503,
      'MISSING_GEMINI_API_KEY',
      'Server configuration notice: GEMINI_API_KEY environment variable is not present. Configure key in Settings > Secrets.'
    );
  }

  try {
    const spec = await generateGameSpecification(plan);
    return sendSuccess(res, spec, 'Phase 6 Game Specification Generation', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Specification Error]', error);
    return sendError(res, 500, 'SPECIFICATION_FAILED', 'NEXUS could not generate the game specification.');
  }
});
`;

code = code.replace("// 5. Build Game Endpoint", endpointToAdd + "\n// 5. Build Game Endpoint");

fs.writeFileSync('src/server/routes.ts', code);
