const fs = require('fs');
let code = fs.readFileSync('src/components/PlayView.tsx', 'utf8');

// Add showExitConfirm state
code = code.replace(
  'const [showUniverse, setShowUniverse] = useState(false);',
  'const [showUniverse, setShowUniverse] = useState(false);\n  const [showExitConfirm, setShowExitConfirm] = useState(false);'
);

// Add event handler
const handlerStr = `        if (e.data.eventType === 'VIEW_UNIVERSE') {
            setShowUniverse(true);
            return;
        }
        
        if (e.data.eventType === 'EXIT_GAME') {
            setShowExitConfirm(true);
            return;
        }`;

code = code.replace(
  `        if (e.data.eventType === 'VIEW_UNIVERSE') {
            setShowUniverse(true);
            return;
        }`,
  handlerStr
);

// Add Exit Confirmation UI inside return statement
const returnStr = `      {showUniverse && universe && (
        <UniverseView universe={universe} onClose={() => setShowUniverse(false)} />
      )}
      
      {showExitConfirm && (
        <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-display font-bold text-white mb-4">RETURN TO NEXUS HOME?</h3>
            <p className="text-slate-400 mb-8 text-sm">Your current game session will be exited.</p>
            <div className="flex space-x-4">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono text-sm transition-colors border border-slate-700">CANCEL</button>
              <button onClick={onBack} className="flex-1 py-3 bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-800 rounded font-mono text-sm transition-colors">GO HOME</button>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(
  `      {showUniverse && universe && (
        <UniverseView universe={universe} onClose={() => setShowUniverse(false)} />
      )}`,
  returnStr
);

fs.writeFileSync('src/components/PlayView.tsx', code);
console.log("PlayView patched with home confirmation.");
