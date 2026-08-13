const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add DiscoverView import
code = code.replace(
  "import { StudioView } from './components/StudioView.js';",
  "import { StudioView } from './components/StudioView.js';\nimport { DiscoverView } from './components/DiscoverView.js';"
);

// Add 'DISCOVER' to AppView
code = code.replace(
  "export type AppView = 'LANDING' | 'STUDIO' | 'SHOWCASE';",
  "export type AppView = 'LANDING' | 'STUDIO' | 'SHOWCASE' | 'DISCOVER';"
);

// In App component, we need a state for initial prompt
code = code.replace(
  "const [currentView, setCurrentView] = useState<AppView>('LANDING');",
  "const [currentView, setCurrentView] = useState<AppView>('LANDING');\n  const [studioPrompt, setStudioPrompt] = useState<string>('');"
);

// Update nav buttons
code = code.replace(
  '<button className="hover:text-slate-200 transition-colors cursor-not-allowed opacity-50" title="Coming in a future phase">DISCOVER</button>',
  '<button onClick={() => setCurrentView(\'DISCOVER\')} className={`hover:text-cyan-400 transition-colors ${currentView === \'DISCOVER\' ? \'text-cyan-400\' : \'\'}`}>DISCOVER</button>'
);

// Update view renders
const studioViewRender = `        {currentView === 'STUDIO' && (
          <StudioView
            initialPrompt={studioPrompt}
            onBackToLanding={() => setCurrentView('LANDING')}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />
        )}`;

code = code.replace(
  /\{currentView === 'STUDIO' && \([\s\S]*?\)\}/,
  studioViewRender
);

const discoverViewRender = `        {currentView === 'DISCOVER' && (
          <DiscoverView
            onBackToLanding={() => setCurrentView('LANDING')}
            onEnterStudio={(prompt) => {
              if (prompt) setStudioPrompt(prompt);
              setCurrentView('STUDIO');
            }}
          />
        )}`;

code = code.replace(
  /\{currentView === 'SHOWCASE' && \([\s\S]*?\)\}/,
  "{currentView === 'SHOWCASE' && (\n          <ShowcaseView\n            onBackToLanding={() => setCurrentView('LANDING')}\n            onEnterStudio={() => setCurrentView('STUDIO')}\n            onOpenDiagnostic={() => setDiagnosticOpen(true)}\n          />\n        )}\n" + discoverViewRender
);

fs.writeFileSync('src/App.tsx', code);
