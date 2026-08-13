const fs = require('fs');
let code = fs.readFileSync('src/components/PlayView.tsx', 'utf8');

// Add import
code = code.replace(
  "import { EvolutionEngine } from '../engine/evolutionEngine.js';",
  "import { EvolutionEngine } from '../engine/evolutionEngine.js';\nimport { UniverseView } from './UniverseView.js';"
);

// Add state for modal
code = code.replace(
  "  const [key, setKey] = useState(0);",
  "  const [key, setKey] = useState(0);\n  const [showUniverse, setShowUniverse] = useState(false);"
);

// Update onClick
code = code.replace(
  "onClick={() => { /* TODO: Open Universe View */ }}",
  "onClick={() => setShowUniverse(true)}"
);

// Add modal at end
code = code.replace(
  "    </motion.div>\n  );\n};",
  "      <AnimatePresence>\n        {showUniverse && universe && (\n          <UniverseView universe={universe} onClose={() => setShowUniverse(false)} />\n        )}\n      </AnimatePresence>\n    </motion.div>\n  );\n};"
);

fs.writeFileSync('src/components/PlayView.tsx', code);
console.log("PlayView modal updated.");
