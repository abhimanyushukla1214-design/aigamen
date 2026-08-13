const fs = require('fs');
let code = fs.readFileSync('src/agents/discoveryAgent.ts', 'utf8');

const regex = /const intentResult = await generateStructuredJson<any>\(\{[\s\S]*?\}\);/g;

code = code.replace(regex, `
  let intentResult;
  try {
    intentResult = await generateStructuredJson<any>({
      prompt: \`Extract the discovery intent from this game idea: "\${prompt}"\`,
      systemInstruction: "You are the NEXUS Discovery Agent. Extract genres, themes, and mechanics from the prompt.",
      schema: discoveryIntentSchema
    });
  } catch(e) {
    console.error('Discovery intent failed:', e);
    intentResult = { data: { extractedGenres: [], extractedThemes: [], desiredMechanics: [], pacing: 'unspecified' } };
  }
`);

const regex2 = /const explanationResult = await generateStructuredJson<any>\(\{[\s\S]*?\}\);/g;
code = code.replace(regex2, `
  let explanationResult;
  try {
    explanationResult = await generateStructuredJson<any>({
      prompt: explanationPrompt,
      systemInstruction: "You are the NEXUS Discovery Agent. Analyze how the given games relate to the user's game idea. For each game, provide a short matchReason and keyDifferences. Then provide an overall aiAnalysis.",
      schema: discoveryExplanationSchema
    });
  } catch(e) {
    console.error('Discovery explanation failed:', e);
    explanationResult = { data: { games: [], aiAnalysis: "Fallback analysis due to API limit." } };
  }
`);

fs.writeFileSync('src/agents/discoveryAgent.ts', code);
console.log("Discovery agent patched.");
