import { generateStructuredJson } from './src/services/geminiService.js';
import { aiTestResponseSchema } from './src/services/geminiSchemas.js';

generateStructuredJson({
  prompt: 'Say hello',
  schema: aiTestResponseSchema,
  model: 'gemini-3.6-flash'
}).then(console.log).catch(console.error);
