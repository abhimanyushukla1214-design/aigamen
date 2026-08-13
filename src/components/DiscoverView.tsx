import React, { useState } from 'react';
import { ArrowLeft, Search, Loader2, Compass, Play, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { nexusApi } from '../services/apiClient.js';
import { GameDiscoveryResponse } from '../types/nexus.js';

interface DiscoverViewProps {
  onBackToLanding: () => void;
  onEnterStudio: (initialPrompt?: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onBackToLanding, onEnterStudio }) => {
  const [prompt, setPrompt] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GameDiscoveryResponse | null>(null);
  const [currentStage, setCurrentStage] = useState(-1);

  const stages = [
    'Parsing natural language intent',
    'Querying NEXUS game database',
    'Applying deterministic ranking',
    'Generating AI comparative analysis',
    'DISCOVERY COMPLETE'
  ];

  const handleDiscover = async () => {
    if (!prompt.trim()) return;
    
    setIsDiscovering(true);
    setError(null);
    setResult(null);
    setCurrentStage(0);

    try {
      const interval = setInterval(() => {
        setCurrentStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 1500);

      const res = await nexusApi.discoverGames({ naturalPrompt: prompt });
      
      clearInterval(interval);
      setCurrentStage(4);
      
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error?.message || 'Discovery failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during discovery.');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-1 flex flex-col p-6 max-w-6xl mx-auto w-full relative z-10"
    >
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-slate-400 hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-900/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO NEXUS</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full space-y-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-3 px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-900/50 text-cyan-500 font-mono text-xs mb-2">
              <Compass className="w-4 h-4" />
              <span>PHASE 5: DISCOVERY ENGINE</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase tracking-widest">
              Does It Exist?
            </h2>
            <p className="text-slate-400 font-sans text-lg">
              Describe a game idea. NEXUS will search for existing matches in its database, rank them, and explain the differences before you build your own.
            </p>
          </div>

          {!result && (
            <div className="p-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-[1px] max-w-3xl mx-auto">
              <div className="p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute top-4 left-4 text-slate-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isDiscovering}
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 pl-14 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans resize-none disabled:opacity-50 text-lg"
                      placeholder="e.g. A survival game set underwater on an alien planet where you build bases..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleDiscover}
                      disabled={isDiscovering || !prompt.trim()}
                      className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isDiscovering ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>DISCOVER</span>}
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-950/50 border border-rose-900/50 rounded-lg text-rose-400 text-sm mt-4">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isDiscovering && (
              <motion.div 
                key="discovering"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="text-sm font-mono text-cyan-400 mb-2 animate-pulse uppercase tracking-widest">Discovery Pipeline</div>
                <div className="space-y-2 text-center">
                   {stages.map((stage, idx) => {
                     const isPast = idx < currentStage;
                     const isCurrent = idx === currentStage;
                     if (idx > currentStage + 1) return null;
                     return (
                       <motion.div 
                         key={stage}
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={`text-sm font-mono uppercase tracking-wider ${isCurrent ? 'text-cyan-300' : isPast ? 'text-slate-500' : 'text-slate-700'}`}
                       >
                         {isCurrent && <Loader2 className="w-3 h-3 animate-spin inline mr-2" />}
                         {stage}
                       </motion.div>
                     );
                   })}
                </div>
              </motion.div>
            )}

            {result && !isDiscovering && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 text-center max-w-4xl mx-auto">
                  <h3 className="text-xs font-mono text-purple-400 tracking-widest uppercase mb-2">AI Analysis</h3>
                  <p className="text-slate-300 font-sans leading-relaxed text-lg">
                    {result.aiAnalysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.recommendedGames.map((game, i) => (
                    <motion.div 
                      key={game.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 transition-colors rounded-2xl overflow-hidden flex flex-col relative"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-white font-display">{game.title}</h3>
                            <p className="text-xs text-slate-400 font-mono mt-1">{game.developer} ({game.releaseYear})</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                            {game.matchScore}
                          </div>
                        </div>
                        
                        <div className="mb-4 flex flex-wrap gap-1">
                          {game.genres.slice(0, 3).map(g => (
                            <span key={g} className="text-[10px] uppercase font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">{g}</span>
                          ))}
                        </div>

                        <p className="text-sm text-slate-400 mb-6 font-sans line-clamp-3">
                          {game.description}
                        </p>
                        
                        <div className="mt-auto space-y-4">
                          <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-lg p-3">
                            <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Why it matches</h4>
                            <p className="text-xs text-slate-300">{game.matchReason}</p>
                          </div>
                          <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-3">
                            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1">Key Differences</h4>
                            <p className="text-xs text-slate-300">{game.keyDifferences}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-12 mb-8">
                  <div className="text-center">
                    <p className="text-slate-400 mb-6 font-sans text-lg">None of these exactly what you want?</p>
                    <button
                      onClick={() => onEnterStudio(prompt)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold tracking-widest rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] flex items-center space-x-3 cursor-pointer mx-auto"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>CREATE MY OWN</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};
