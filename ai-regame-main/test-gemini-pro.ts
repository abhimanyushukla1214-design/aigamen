import { generateStructuredJson } from './src/services/geminiService.js';
import { aiTestResponseSchema } from './src/services/geminiSchemas.js';

generateStructuredJson({
  prompt: 'Say hello',
  schema: aiTestResponseSchema,
  model: 'gemini-3.1-pro-preview'
}).then(console.log).catch(console.error);
