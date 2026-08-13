const fs = require('fs');
let code = fs.readFileSync('src/components/UniverseView.tsx', 'utf8');

code = code.replace(
  "import { Globe, X, Trophy, Map, Clock, Activity, History } from 'lucide-react';",
  "import { Globe, X, Trophy, Map, Clock, Activity, History, Zap } from 'lucide-react';\nimport { useState } from 'react';"
);

code = code.replace(
  "export const UniverseView: React.FC<UniverseViewProps> = ({ universe, onClose }) => {",
  "export const UniverseView: React.FC<UniverseViewProps> = ({ universe, onClose }) => {\n  const [evolving, setEvolving] = useState(false);\n  \n  const handleEvolve = async () => {\n    setEvolving(true);\n    try {\n      const res = await fetch('/api/nexus/evolve', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ universeState: universe, feedback: { rating: 'JUST_RIGHT', tags: [], comments: 'Auto-evolution triggered' } })\n      });\n      const data = await res.json();\n      if (data.success) {\n         console.log('Evolution proposal:', data.data.evolution);\n         alert('Evolution Proposal Generated: ' + JSON.stringify(data.data.evolution.suggestedChanges));\n      }\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setEvolving(false);\n    }\n  };"
);

const buttonStr = `          <div>
            <h2 className="text-2xl font-display font-black tracking-widest uppercase text-white">Universe Data</h2>
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Version {universe.version} | ID: {universe.universeId}</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mb-6">
           <button onClick={handleEvolve} disabled={evolving} className="flex items-center space-x-2 px-4 py-2 bg-purple-900/40 border border-purple-700/50 hover:bg-purple-800/60 rounded text-purple-300 font-mono text-sm transition-colors">
              <Zap className="w-4 h-4" />
              <span>{evolving ? 'ANALYZING...' : 'AI EVOLUTION'}</span>
           </button>
        </div>`;

code = code.replace(`          <div>
            <h2 className="text-2xl font-display font-black tracking-widest uppercase text-white">Universe Data</h2>
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Version {universe.version} | ID: {universe.universeId}</p>
          </div>
        </div>`, buttonStr);


fs.writeFileSync('src/components/UniverseView.tsx', code);
console.log("UniverseView updated with Evolve button.");
