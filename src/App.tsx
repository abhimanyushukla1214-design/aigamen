import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Terminal, Bot } from 'lucide-react';
import { nexusApi } from './services/apiClient.js';
import { ParticleBackground } from './components/ParticleBackground.js';
import { LandingPage } from './components/LandingPage.js';
import { StudioView } from './components/StudioView.js';
import { DiscoverView } from './components/DiscoverView.js';
import { ShowcaseView } from './components/ShowcaseView.js';
import { DevDiagnosticDrawer } from './components/DevDiagnosticDrawer.js';
import { PlayView } from './components/PlayView.js';
import { ComprehensiveGameSpec } from './types/nexusSpec.js';
import { GameDirectorPlan } from './types/nexus.js';

export type AppView = 'LANDING' | 'STUDIO' | 'SHOWCASE' | 'DISCOVER';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioPlan, setStudioPlan] = useState<GameDirectorPlan | null>(null);
  const [studioSpec, setStudioSpec] = useState<ComprehensiveGameSpec | null>(null);
  const [studioVersions, setStudioVersions] = useState<Array<{ version: number, spec: ComprehensiveGameSpec, html: string, changes: any[], feedback: string }>>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [activeGame, setActiveGame] = useState<{ html: string; title: string; spec?: ComprehensiveGameSpec } | null>(null);

  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState<boolean>(false);

  useEffect(() => {
    nexusApi.checkHealth().then((res) => {
      setServerOnline(res.success);
      if (res.data?.geminiConfigured !== undefined) {
        setGeminiConfigured(res.data.geminiConfigured);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between nexus-grid-bg relative overflow-x-hidden font-sans">
      {activeGame ? (
        <PlayView
          htmlContent={activeGame.html}
          title={activeGame.title}
          spec={activeGame.spec}
          onBack={() => setActiveGame(null)}
        />
      ) : (
        <>
          {/* 1. Particle / Starfield Background */}
          <ParticleBackground />

          {/* 2. Top Header Navigation */}
          <header className="border-b border-slate-800/80 nexus-glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('LANDING')}
                className="flex items-center space-x-3 group cursor-pointer text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform font-display text-base">
                  N
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-widest text-white font-display uppercase">NEXUS</h1>
                </div>
              </button>
              
              <nav className="hidden md:flex items-center space-x-6 text-xs font-mono text-slate-400">
                <button onClick={() => setCurrentView('STUDIO')} className={`hover:text-cyan-400 transition-colors ${currentView === 'STUDIO' ? 'text-cyan-400' : ''}`}>STUDIO</button>
                <button onClick={() => setCurrentView('DISCOVER')} className={`hover:text-cyan-400 transition-colors ${currentView === 'DISCOVER' ? 'text-cyan-400' : ''}`}>DISCOVER</button>
                <button className="hover:text-slate-200 transition-colors cursor-not-allowed opacity-50" title="Coming in a future phase">UNIVERSES</button>
                <button className="hover:text-slate-200 transition-colors cursor-not-allowed opacity-50" title="Coming in a future phase">LAB</button>
              </nav>
            </div>

            <div className="flex items-center space-x-4 text-[10px] font-mono">
              <div className="hidden lg:flex items-center space-x-4 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                 <div className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${serverOnline === null ? 'bg-amber-400 animate-pulse' : serverOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-slate-400">NEXUS CORE</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-slate-400">API</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-slate-400">AI ENGINE</span>
                 </div>
              </div>
              <button
                onClick={() => setDiagnosticOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                aria-label="Open System Diagnostic"
                title="System Diagnostic"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* 3. Main View Renderer */}
          <main className="flex-1 flex flex-col justify-center">
            {currentView === 'LANDING' && (
              <LandingPage
                onEnterStudio={() => setCurrentView('STUDIO')}
                onExploreSignal={() => setCurrentView('SHOWCASE')}
                onOpenDiagnostic={() => setDiagnosticOpen(true)}
              />
            )}
            
            {currentView === 'STUDIO' && (
              <StudioView
                prompt={studioPrompt}
                setPrompt={setStudioPrompt}
                plan={studioPlan}
                setPlan={setStudioPlan}
                spec={studioSpec}
                setSpec={setStudioSpec}
                gameVersions={studioVersions}
                setGameVersions={setStudioVersions}
                currentStageIndex={currentStageIndex}
                setCurrentStageIndex={setCurrentStageIndex}
                onBackToLanding={() => setCurrentView('LANDING')}
                onOpenDiagnostic={() => setDiagnosticOpen(true)}
                onPlayGame={(html, title, spec) => setActiveGame({ html, title, spec })}
              />
            )}

            {currentView === 'SHOWCASE' && (
              <ShowcaseView
                onBackToLanding={() => setCurrentView('LANDING')}
                onEnterStudio={() => setCurrentView('STUDIO')}
                onOpenDiagnostic={() => setDiagnosticOpen(true)}
              />
            )}

            {currentView === 'DISCOVER' && (
              <DiscoverView
                onBackToLanding={() => setCurrentView('LANDING')}
                onEnterStudio={(prompt) => {
                  if (prompt) setStudioPrompt(prompt);
                  setCurrentView('STUDIO');
                }}
              />
            )}
          </main>

          {/* 4. Dev Diagnostic Modal */}
          <DevDiagnosticDrawer
            isOpen={diagnosticOpen}
            onClose={() => setDiagnosticOpen(false)}
            serverOnline={serverOnline}
            geminiConfigured={geminiConfigured}
          />

          {/* 5. Footer */}
          <footer className="border-t border-slate-900/80 px-6 py-6 text-center text-xs font-mono text-slate-500 relative z-10">
            NEXUS &copy; 2026 — AI Game Universe Platform | Powered by Google AI Studio & Gemini 3 Models
          </footer>
        </>
      )}
    </div>
  );
}
