const fs = require('fs');
let code = fs.readFileSync('src/components/StudioView.tsx', 'utf8');

// Import PlayView and Gamepad2
code = code.replace(
  "import { GameDirectorPlan, DesignTask } from '../types/nexus.js';",
  "import { GameDirectorPlan, DesignTask } from '../types/nexus.js';\nimport { PlayView } from './PlayView.js';\nimport { Gamepad2 } from 'lucide-react';"
);

// Add state for htmlContent and isBuilding
code = code.replace(
  "const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);",
  "const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);\n  const [isBuilding, setIsBuilding] = useState(false);\n  const [gameHtml, setGameHtml] = useState<string | null>(null);"
);

// Clear gameHtml on new plan
code = code.replace(
  "setSpec(null);",
  "setSpec(null);\n    setGameHtml(null);"
);

// Handle buildGame
const buildLogic = `
  const handleBuildGame = async () => {
    if (!spec) return;
    setIsBuilding(true);
    setError(null);
    try {
      const res = await nexusApi.buildGame({ spec });
      if (res.success && res.data && res.data.html) {
        setGameHtml(res.data.html);
      } else {
        setError(res.error?.message || 'Game build failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during game build.');
    } finally {
      setIsBuilding(false);
    }
  };
`;

code = code.replace("return (", buildLogic + "\n  return (\n    <>\n    {gameHtml && <PlayView htmlContent={gameHtml} title={spec?.title || 'Untitled Sandbox'} onBack={() => setGameHtml(null)} />}");
code = code.replace("</motion.div>\n  );\n};", "</motion.div>\n    </>\n  );\n};");

// Add build button below spec
const buildButtonHtml = `
                          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col items-center">
                            <button
                              onClick={handleBuildGame}
                              disabled={isBuilding}
                              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                              {isBuilding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gamepad2 className="w-5 h-5" /><span>COMPILE & PLAY</span></>}
                            </button>
                          </div>
                        </div>
`;

code = code.replace(
  "                          </div>\n                        </div>\n                      )}",
  "                          </div>\n" + buildButtonHtml + "\n                      )}"
);

fs.writeFileSync('src/components/StudioView.tsx', code);
