const fs = require('fs');
let code = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf8');

code = code.replace("import { AI_MODELS } from '../config/ai-models.js';", "import { AI_CONFIG } from '../config/ai-models.js';");
code = code.replace("import { v4 as uuidv4 } from 'uuid';", "import crypto from 'crypto';");
code = code.replace("model: AI_MODELS.modelCode,", "model: AI_CONFIG.MODEL_CODE,");
code = code.replace("const text = response.text();", "const text = response.text;");
code = code.replace("gameId: uuidv4(),", "gameId: crypto.randomUUID(),");

fs.writeFileSync('src/agents/gameSpecAgent.ts', code);
