const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

const importStatement = "import { runDiscoveryPipeline } from '../agents/discoveryAgent.js';\n";
code = importStatement + code;

// Replace the existing discover stub
code = code.replace(
  /\/\/ 4\. Discover Endpoint.*?return sendSuccess\([\s\S]*?\/\/ 5\. Build Game Endpoint/s,
`// 4. Discover Endpoint (Phase 5)
nexusRouter.post('/discover', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { naturalPrompt } = req.body as GameDiscoveryRequest;

  if (!naturalPrompt || typeof naturalPrompt !== 'string' || !naturalPrompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "naturalPrompt" is required and must be a non-empty string.');
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
    const discoveryResponse = await runDiscoveryPipeline(naturalPrompt, 3);
    return sendSuccess(res, discoveryResponse, 'Phase 5 Discovery Agent', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Discovery Error]', error);
    return sendError(res, 500, 'DISCOVERY_FAILED', 'NEXUS could not complete the discovery pipeline.');
  }
});

// 5. Build Game Endpoint`
);

fs.writeFileSync('src/server/routes.ts', code);
