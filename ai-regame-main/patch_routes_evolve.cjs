const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf8');

const importStr = `import { evolveGameSpecification } from '../agents/evolutionAgent.js';`;
if (!code.includes('evolveGameSpecification')) {
  code = code.replace(
    `import { generateGameSpecification } from '../agents/gameSpecAgent.js';`,
    `import { generateGameSpecification } from '../agents/gameSpecAgent.js';\nimport { evolveGameSpecification } from '../agents/evolutionAgent.js';`
  );
}

const evolveRoute = `// Phase 8: Game Evolution endpoint
nexusRouter.post('/evolve-game', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { currentSpec, feedback } = req.body;

  if (!currentSpec || !feedback) {
    return sendError(res, 400, 'INVALID_INPUT', 'Fields "currentSpec" and "feedback" are required.');
  }

  if (!isGeminiConfigured()) {
    return sendError(res, 503, 'MISSING_GEMINI_API_KEY', 'Server configuration notice: GEMINI_API_KEY is not present.');
  }

  try {
    const result = await evolveGameSpecification(currentSpec, feedback);
    
    // Validate and rebuild
    const buildResult = buildGame({ spec: result.updatedSpec });
    if (!buildResult.success) {
      return sendError(res, 500, 'BUILD_FAILED', 'Evolution resulted in an invalid game build.');
    }

    return sendSuccess(
      res,
      {
        changes: result.changes,
        updatedSpec: result.updatedSpec,
        html: buildResult.html
      },
      'Phase 8 Game Evolution',
      Date.now() - startTime
    );
  } catch (error) {
    console.error('[NEXUS Evolution Error]', error);
    return sendError(res, 500, 'EVOLUTION_FAILED', 'NEXUS could not evolve the game specification.');
  }
});
`;

code = code.replace(
  /\/\/ Phase 7: Universe Evolution endpoint[\s\S]*?\}\);/m,
  evolveRoute
);

fs.writeFileSync('src/server/routes.ts', code);
console.log("Routes patched with evolveGameSpecification.");
