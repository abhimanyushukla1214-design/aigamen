const fs = require('fs');

const originalCode = fs.readFileSync('src/components/PlayView.tsx', 'utf-8');

let newCode = originalCode;

// Inject useEffect for message handling
const importReact = `import React, { useState, useEffect } from 'react';`;
newCode = newCode.replace(/import React.*?\{.*?useState.*?\}.*?from 'react';/s, `import React, { useState, useEffect, useRef } from 'react';`);

const overlayCode = `
  const [gameState, setGameState] = useState({ state: 'PLAYING', hp: 100, maxHp: 100, score: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GAME_STATE') {
        setGameState(e.data);
      } else if (e.data?.type === 'GAME_OVER') {
        if (e.data.win) {
          setIsVictory(true);
        } else {
          setIsGameOver(true);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Map preview logic
  const renderMiniMap = () => {
    if (!spec) return null;
    const isRacing = htmlContent.includes('RACING');
    const isTopDown = htmlContent.includes('TOP_DOWN');
    return (
      <div className="w-full bg-slate-950 border border-cyan-900 rounded p-4 mb-6">
        <h3 className="text-[10px] font-mono text-cyan-500 mb-2 uppercase tracking-widest">Map Topology</h3>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-900/50 -translate-y-1/2" />
          <div className="relative z-10 bg-slate-800 px-2 py-1 rounded text-cyan-300">START</div>
          <div className="relative z-10 w-2 h-2 rounded-full bg-cyan-700" />
          <div className="relative z-10 w-2 h-2 rounded-full bg-cyan-700" />
          <div className="relative z-10 bg-slate-800 px-2 py-1 rounded text-emerald-400">
            {isRacing ? 'FINISH LINE' : (isTopDown ? 'CORE' : 'PORTAL')}
          </div>
        </div>
      </div>
    );
  };
`;

newCode = newCode.replace("const [showExitConfirm, setShowExitConfirm] = useState(false);", "const [showExitConfirm, setShowExitConfirm] = useState(false);\n" + overlayCode);

// Replace intro card with complex one
const newIntroCard = `
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto"
            >
              <div className="relative max-w-3xl w-full bg-slate-900/90 border border-cyan-900/60 rounded-xl p-8 shadow-2xl shadow-cyan-950/50">
                {isPlaying && (
                  <button 
                    onClick={() => setShowInstructions(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-display font-black tracking-widest uppercase text-white mb-2">{title}</h2>
                  <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{spec.story.logline}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-cyan-500 mb-1 uppercase tracking-widest">PLAYER</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.character.protagonist.role}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-rose-500 mb-1 uppercase tracking-widest">HAZARD</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.character.antagonistOrHazard.name}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-emerald-500 mb-1 uppercase tracking-widest">OBJECTIVE</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.gameplay.winCondition}</div>
                  </div>
                </div>

                {renderMiniMap()}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Controls</h3>
                    <ul className="space-y-2">
                      {spec.gameplay.controls.map((ctrl, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <span className="inline-block px-2 py-1 bg-slate-800 rounded text-cyan-300 font-mono text-xs mr-3 min-w-[40px] text-center border border-slate-700">{ctrl.key}</span>
                          <span className="text-slate-300">{ctrl.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">System</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {spec.gameplay.primaryMechanics[0]} • {spec.world.settingName}
                    </p>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Engine</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">Delta Time Physics</span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">Parallax</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={handleStartGame}
                    className="group relative px-10 py-3 bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 rounded flex items-center space-x-3 overflow-hidden transition-all"
                  >
                    <Play className="w-5 h-5 text-cyan-400 relative z-10" />
                    <span className="font-mono text-cyan-50 tracking-widest text-sm relative z-10 font-bold">{isPlaying ? 'RESUME' : 'START MISSION'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
`;

newCode = newCode.replace(/<motion\.div[\s\S]*?<\/motion\.div>/m, newIntroCard);

// Add Game Over / Victory overlays
const endScreens = `
      <AnimatePresence>
        {(isGameOver || isVictory) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="bg-slate-900 border border-slate-700 p-10 rounded-xl max-w-md w-full text-center shadow-2xl">
              <h2 className={\`text-4xl font-display font-black mb-4 uppercase tracking-widest \${isVictory ? 'text-emerald-400' : 'text-rose-500'}\`}>
                {isVictory ? 'MISSION COMPLETE' : 'GAME OVER'}
              </h2>
              <div className="text-white text-2xl font-mono mb-8">SCORE: {gameState.score}</div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded transition-colors"
                >
                  HOME
                </button>
                <button
                  onClick={() => { setIsGameOver(false); setIsVictory(false); handleRestart(); }}
                  className="px-6 py-3 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 border border-cyan-800 font-mono text-sm rounded transition-colors"
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

newCode = newCode.replace("{showExitConfirm && (", endScreens + "\n        {showExitConfirm && (");

fs.writeFileSync('src/components/PlayView.tsx', newCode);
