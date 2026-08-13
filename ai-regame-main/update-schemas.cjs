const fs = require('fs');
let code = fs.readFileSync('src/services/geminiSchemas.ts', 'utf8');

const newSchema = `
// 4. Schema for Discovery Explanation (Phase 5)
export const discoveryExplanationSchema = {
  type: Type.OBJECT,
  properties: {
    games: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          matchReason: { type: Type.STRING },
          keyDifferences: { type: Type.STRING }
        },
        required: ['id', 'matchReason', 'keyDifferences']
      }
    },
    aiAnalysis: { type: Type.STRING }
  },
  required: ['games', 'aiAnalysis']
};
`;

code += newSchema;
fs.writeFileSync('src/services/geminiSchemas.ts', code);
