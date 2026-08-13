const fs = require('fs');
let code = fs.readFileSync('src/components/StudioView.tsx', 'utf8');

// Add version history state
const stateStr = `  const [gameHtml, setGameHtml] = useState<string | null>(null);
  
  // Phase 8 Evolution State
  const [gameVersions, setGameVersions] = useState<Array<{ version: number, spec: ComprehensiveGameSpec, html: string, changes: any[], feedback: string }>>([]);
  const [evolutionFeedback, setEvolutionFeedback] = useState("");
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
`;

code = code.replace(
  `  const [gameHtml, setGameHtml] = useState<string | null>(null);`,
  stateStr
);

// Update initial game generation
const genSpecRegex = /setSpec\(data\.data\);\s*setGameHtml\(buildData\.data\.html\);/g;
code = code.replace(genSpecRegex, `
        setSpec(data.data);
        setGameHtml(buildData.data.html);
        setGameVersions([{ version: 1, spec: data.data, html: buildData.data.html, changes: [], feedback: "Initial generation" }]);
`);

// Add evolution handler
const handleEvolveStr = `
  const handleEvolve = async () => {
    if (!evolutionFeedback.trim() || !spec) return;
    
    setIsEvolving(true);
    setEvolutionError(null);
    try {
      const res = await fetch('/api/nexus/evolve-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSpec: spec, feedback: evolutionFeedback })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error.message || 'Evolution failed');
      
      const newVersion = {
        version: gameVersions.length + 1,
        spec: data.data.updatedSpec,
        html: data.data.html,
        changes: data.data.changes,
        feedback: evolutionFeedback
      };
      
      setGameVersions([newVersion, ...gameVersions]);
      setSpec(data.data.updatedSpec);
      setGameHtml(data.data.html);
      setEvolutionFeedback("");
    } catch (e: any) {
      console.error("Evolution error:", e);
      setEvolutionError(e.message || "Evolution could not be completed. Your current game is unchanged.");
    } finally {
      setIsEvolving(false);
    }
  };
`;
code = code.replace(`  const handleGenerate = async () => {`, handleEvolveStr + `\n  const handleGenerate = async () => {`);

// Add evolution UI to StudioView return statement. 
// If spec exists and not generating, show evolution and versions
const returnStr = `          <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-8 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            {!spec ? (
              <>
            <h2 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center">
              <Sparkles className="w-5 h-5 mr-3 text-indigo-400" />
              Describe Your Game
            </h2>`;

code = code.replace(
  `          <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-8 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center">
              <Sparkles className="w-5 h-5 mr-3 text-indigo-400" />
              Describe Your Game
            </h2>`,
  returnStr
);

// Close the !spec conditional and add Evolution UI
const evolveUI = `
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white tracking-widest uppercase">{spec.title}</h2>
                    <p className="text-indigo-400 font-mono text-sm uppercase">Version {gameVersions.length}</p>
                  </div>
                  <button 
                    onClick={() => setGameHtml(gameVersions[0].html)}
                    className="px-6 py-2 bg-emerald-900/40 border border-emerald-700 text-emerald-400 hover:bg-emerald-800/60 transition-colors font-mono uppercase tracking-widest text-sm rounded"
                  >
                    PLAY VERSION {gameVersions.length}
                  </button>
                </div>
                
                <div className="bg-slate-950/50 p-6 rounded-lg border border-slate-800 mb-8">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">WHAT SHOULD CHANGE?</h3>
                  <textarea
                    value={evolutionFeedback}
                    onChange={(e) => setEvolutionFeedback(e.target.value)}
                    placeholder="e.g. Add a second level and make enemies more challenging."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm min-h-[100px] mb-4"
                  />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Improve movement", "Add enemies", "Increase difficulty", "Add double jump"].map(s => (
                      <button key={s} onClick={() => setEvolutionFeedback(s)} className="text-xs font-mono bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded transition-colors border border-slate-700">{s}</button>
                    ))}
                  </div>
                  
                  {evolutionError && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm font-mono">
                      {evolutionError}
                    </div>
                  )}
                  
                  <button
                    onClick={handleEvolve}
                    disabled={isEvolving || !evolutionFeedback.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono tracking-widest uppercase py-3 px-6 rounded transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEvolving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {isEvolving ? 'EVOLVING GAME...' : 'EVOLVE GAME'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">VERSION HISTORY</h3>
                  {gameVersions.map((v) => (
                    <div key={v.version} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="flex items-baseline space-x-3 mb-1">
                          <span className="text-indigo-400 font-mono text-sm">v{v.version}</span>
                          {v.version === gameVersions.length && <span className="bg-emerald-900/50 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-800">Current</span>}
                        </div>
                        <p className="text-slate-300 text-sm">"{v.feedback}"</p>
                      </div>
                      {v.version !== gameVersions.length && (
                        <button 
                          onClick={() => { setSpec(v.spec); setGameHtml(v.html); }}
                          className="text-xs font-mono bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded transition-colors border border-slate-600"
                        >
                          PLAY
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Original generate UI */}
            {!spec && (
              <div className="space-y-4">
`;

code = code.replace(
  `            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">`,
  evolveUI + `\n            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">`
);

const closeSpec = `            )}
          </div>`;
code = code.replace(
  `                </button>
              </div>
            </div>`,
  `                </button>
              </div>
            </div>
            )}`
);

fs.writeFileSync('src/components/StudioView.tsx', code);
console.log("StudioView patched for evolution.");
