const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');
code = code.replace(
  'export interface OrchestrateRequest {',
  `import { GameDirectorPlan } from '../types/nexus';\nexport interface OrchestrateRequest {`
);
code = code.replace(
  'async orchestrateUniverse(payload: OrchestrateRequest): Promise<ApiResponse<OrchestrateResponse>> {',
  'async orchestrateUniverse(payload: OrchestrateRequest): Promise<ApiResponse<GameDirectorPlan>> {'
);
fs.writeFileSync('src/services/apiClient.ts', code);
