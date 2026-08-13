const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

code = code.replace(
  "async buildGame(payload: { gameSpecId: string }): Promise<ApiResponse<unknown>> {",
  "async buildGame(payload: { spec: ComprehensiveGameSpec }): Promise<ApiResponse<{ html: string }>> {"
);

fs.writeFileSync('src/services/apiClient.ts', code);
