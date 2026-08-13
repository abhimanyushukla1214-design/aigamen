const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

const importStatement = "import { orchestrateGameDirector } from '../agents/gameDirector.js';\n";
code = importStatement + code;

const orchestrateEndpoint = `
// 3. Orchestrate Universe (Phase 4 MVP)
nexusRouter.post('/orchestrate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "prompt" is required and must be a non-empty string.');
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
    const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
    const plan = await orchestrateGameDirector(prompt, requestId);

    sendSuccess(res, plan, 'Phase 4 Game Director Orchestration', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Orchestrator Error]', error);
    sendError(res, 500, 'ORCHESTRATION_FAILED', 'NEXUS could not generate the design plan.');
  }
});
`;

code += orchestrateEndpoint;
fs.writeFileSync('src/server/routes.ts', code);
