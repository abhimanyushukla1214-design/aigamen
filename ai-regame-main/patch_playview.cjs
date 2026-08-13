const fs = require('fs');
let code = fs.readFileSync('src/components/PlayView.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { ComprehensiveGameSpec } from '../types/nexusSpec.js';",
  "import { ComprehensiveGameSpec } from '../types/nexusSpec.js';\nimport { GameSession, GameEvent, UniverseState } from '../types/universe.js';\nimport { UniverseStore } from '../services/universeStore.js';\nimport { EvolutionEngine } from '../engine/evolutionEngine.js';"
);

// Add state to component
code = code.replace(
  "  const [key, setKey] = useState(0);",
  "  const [key, setKey] = useState(0);\n  const [session, setSession] = useState<GameSession | null>(null);\n  const [universe, setUniverse] = useState<UniverseState | null>(null);\n\n  // Phase 7: Universe and Session initialization\n  React.useEffect(() => {\n    if (spec) {\n      // Try to find if universe already created for this spec? Actually, better to just create one if not passed in, but we'll do it on start.\n    }\n  }, [spec]);\n\n  React.useEffect(() => {\n    const handleMessage = (e: MessageEvent) => {\n      if (e.data && e.data.type === 'NEXUS_EVENT') {\n        console.log('[NEXUS EVENT]', e.data.eventType, e.data.payload);\n        if (session) {\n           const newEvent: GameEvent = {\n             id: Math.random().toString(36).substr(2, 9),\n             timestamp: Date.now(),\n             type: e.data.eventType,\n             payload: e.data.payload\n           };\n           setSession(s => {\n             if (!s) return s;\n             return { ...s, events: [...s.events, newEvent] };\n           });\n\n           if (e.data.eventType === 'GAME_COMPLETED' || e.data.eventType === 'PLAYER_DIED') {\n             // Update universe\n             if (universe) {\n                setSession(s => {\n                  if (!s) return s;\n                  const finalSession = { ...s, endedAt: Date.now(), currentState: e.data.eventType === 'GAME_COMPLETED' ? 'COMPLETED' : 'FAILED' as any };\n                  const newState = EvolutionEngine.processSession(universe, finalSession);\n                  UniverseStore.save(newState);\n                  setUniverse(newState);\n                  return finalSession;\n                });\n             }\n           }\n        }\n      }\n    };\n    window.addEventListener('message', handleMessage);\n    return () => window.removeEventListener('message', handleMessage);\n  }, [session, universe]);\n"
);

// Update handleStartGame
code = code.replace(
  "  const handleStartGame = () => {",
  "  const handleStartGame = () => {\n    if (!universe && spec) {\n      const newU = UniverseStore.create(spec);\n      setUniverse(newU);\n      setSession({\n        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),\n        universeId: newU.universeId,\n        playerId: newU.playerState.playerId,\n        startedAt: Date.now(),\n        events: [],\n        currentState: 'ACTIVE'\n      });\n    } else if (universe) {\n      setSession({\n        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),\n        universeId: universe.universeId,\n        playerId: universe.playerState.playerId,\n        startedAt: Date.now(),\n        events: [],\n        currentState: 'ACTIVE'\n      });\n    }"
);

// Add Universe Dashboard button
code = code.replace(
  "              <span>CONTROLS</span>\n            </button>\n          )}",
  "              <span>CONTROLS</span>\n            </button>\n          )}\n          {universe && (\n            <button\n              onClick={() => { /* TODO: Open Universe View */ }}\n              className=\"flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 hover:border-cyan-600 text-cyan-300 hover:text-white transition-colors text-xs font-mono\"\n            >\n              <span>UNIVERSE STATE ({universe.version})</span>\n            </button>\n          )}"
);

fs.writeFileSync('src/components/PlayView.tsx', code);
console.log("PlayView patched.");
