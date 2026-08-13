const fs = require('fs');
let code = fs.readFileSync('src/agents/gameDirector.ts', 'utf8');

code = code.replace(
  `  try {
    const result = await generateStructuredJson<Omit<GameDirectorPlan, 'requestId' | 'originalPrompt' | 'pipeline'>>({
    prompt,
    systemInstruction,
    schema: gameDirectorPlanSchema,
  });
    } catch (err) {`,
  `  let result;
  try {
    result = await generateStructuredJson<Omit<GameDirectorPlan, 'requestId' | 'originalPrompt' | 'pipeline'>>({
      prompt,
      systemInstruction,
      schema: gameDirectorPlanSchema,
    });
  } catch (err) {`
);

// wait, the problem is it didn't match. 
