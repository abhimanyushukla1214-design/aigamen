const fs = require('fs');
let code = fs.readFileSync('src/types/nexus.ts', 'utf8');

const newTypes = `
// Game Director Phase 4 Types
export interface DesignTask {
  objective: string;
  requiredInputs: string[];
  expectedOutputs: string[];
  priority: "high" | "medium" | "low";
}

export interface GameDirectorPlan {
  requestId: string;
  originalPrompt: string;

  intent: {
    summary: string;
    genre: string[];
    theme: string[];
    setting: string;
    playerRole: string;
    cameraPerspective: string;
    gameplayStyle: string[];
    atmosphere: string[];
  };

  designDomains: {
    world: DesignTask;
    story: DesignTask;
    character: DesignTask;
    gameplay: DesignTask;
    physics: DesignTask;
    cinematography: DesignTask;
  };

  constraints: string[];
  assumptions: string[];

  pipeline: {
    stage: string;
    status: "pending" | "processing" | "complete" | "failed";
  }[];
}
`;

fs.writeFileSync('src/types/nexus.ts', code + newTypes);
