const fs = require('fs');
let code = fs.readFileSync('src/components/StudioView.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { GameDirectorPlan, DesignTask } from '../types/nexus.js';",
  "import { GameDirectorPlan, DesignTask } from '../types/nexus.js';\nimport { ComprehensiveGameSpec } from '../types/nexusSpec.js';"
);

// Add state variables
code = code.replace(
  "const [currentStageIndex, setCurrentStageIndex] = useState(-1);",
  "const [currentStageIndex, setCurrentStageIndex] = useState(-1);\n  const [spec, setSpec] = useState<ComprehensiveGameSpec | null>(null);\n  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);\n"
);

// clear spec on new generation
code = code.replace(
  "setPlan(null);",
  "setPlan(null);\n    setSpec(null);"
);

// new clear plan handler
code = code.replace(
  "onClick={() => setPlan(null)}",
  "onClick={() => { setPlan(null); setSpec(null); }}"
);

// The handleGenerateSpec function
const specLogic = `
  const handleGenerateSpec = async () => {
    if (!plan) return;
    setIsGeneratingSpec(true);
    setError(null);
    try {
      const res = await nexusApi.generateSpec({ plan });
      if (res.success && res.data) {
        setSpec(res.data);
      } else {
        setError(res.error?.message || 'Specification generation failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during specification generation.');
    } finally {
      setIsGeneratingSpec(false);
    }
  };
`;
code = code.replace("return (", specLogic + "\n  return (");

// the display for spec
const buttonHtml = `
                    <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col items-center">
                      {!spec ? (
                        <button
                          onClick={handleGenerateSpec}
                          disabled={isGeneratingSpec}
                          className="w-full sm:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {isGeneratingSpec ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>GENERATE GAME SPECIFICATION</span>}
                        </button>
                      ) : (
                        <div className="w-full space-y-6">
                          <h3 className="text-xl font-display font-black text-cyan-400">COMPREHENSIVE GAME SPECIFICATION</h3>
                          <div className="p-4 bg-slate-900/50 border border-cyan-900/50 rounded-xl">
                             <pre className="text-xs font-mono text-cyan-100 overflow-x-auto whitespace-pre-wrap">
                               {JSON.stringify(spec, null, 2)}
                             </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
`;

code = code.replace(
  "                  </div>\n                </div>\n              </motion.div>",
  buttonHtml
);

fs.writeFileSync('src/components/StudioView.tsx', code);
