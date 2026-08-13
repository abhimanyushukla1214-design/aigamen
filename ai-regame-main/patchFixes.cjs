const fs = require('fs');

// Fix GameSpecAgent camera defaults
let codeSpec = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf-8');
codeSpec = codeSpec.replace(
  /let camera = plan.intent.cameraPerspective !== 'unspecified' \? plan.intent.cameraPerspective : \(genre === 'racing' \? '2D_TOP_DOWN' : '2D_SIDE_SCROLLER'\);/,
  `let camera = plan.intent.cameraPerspective !== 'unspecified' ? plan.intent.cameraPerspective : ((genre === 'racing' || genre === 'exploration' || genre === 'rpg' || genre === 'survival' || genre === 'puzzle') ? '2D_TOP_DOWN' : '2D_SIDE_SCROLLER');`
);
fs.writeFileSync('src/agents/gameSpecAgent.ts', codeSpec);

// Fix buildGame logic
let codeBuild = fs.readFileSync('src/engine/gameBuilder.ts', 'utf-8');
codeBuild = codeBuild.replace(
  /\} else if \(isTopDown \|\| primaryMechanics\.includes\('exploration'\) \|\| logline\.includes\('explore'\) \|\| primaryMechanics\.includes\('survival'\)\) \{/g,
  `} else if (isTopDown) {`
);
fs.writeFileSync('src/engine/gameBuilder.ts', codeBuild);

