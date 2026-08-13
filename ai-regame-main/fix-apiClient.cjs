const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

code = code.replace(
  "import {", 
  "import { ComprehensiveGameSpec } from '../types/nexusSpec.js';\nimport {"
);

const methodToAdd = `
  async generateSpec(payload: { plan: GameDirectorPlan }): Promise<ApiResponse<ComprehensiveGameSpec>> {
    return this.request('/generate-spec', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
`;

code = code.replace(
  "async buildGame(payload: { gameSpecId: string }): Promise<ApiResponse<unknown>> {",
  methodToAdd + "\n  async buildGame(payload: { gameSpecId: string }): Promise<ApiResponse<unknown>> {"
);

fs.writeFileSync('src/services/apiClient.ts', code);
