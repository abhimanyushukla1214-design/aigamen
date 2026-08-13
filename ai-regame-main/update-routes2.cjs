const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

// Remove the appended one at the very end
code = code.replace(/\/\/ 3\. Orchestrate Universe \(Phase 4 MVP\).*$/s, '');

// Replace the existing stub
code = code.replace(
  /\/\/ 3\. Orchestrate Endpoint \(Game Director Pipeline Contract\).*?\/\/ 4\. Discover Endpoint/s,
`// 3. Orchestrate Endpoint (Phase 4 MVP)
nexusRouter.post('/orchestrate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  // We expect userPrompt based on OrchestrateRequest
  const { userPrompt } = req.body as OrchestrateRequest;

  if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "userPrompt" is required and must be a non-empty string.');
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
    const plan = await orchestrateGameDirector(userPrompt, requestId);

    return sendSuccess(res, plan, 'Phase 4 Game Director Orchestration', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Orchestrator Error]', error);
    return sendError(res, 500, 'ORCHESTRATION_FAILED', 'NEXUS could not generate the design plan.');
  }
});

// 4. Discover Endpoint`
);

if (!code.includes('orchestrateGameDirector')) {
    code = "import { orchestrateGameDirector } from '../agents/gameDirector.js';\n" + code;
}

fs.writeFileSync('src/server/routes.ts', code);
