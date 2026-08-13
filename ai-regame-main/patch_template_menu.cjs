const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

// Replace the EXIT_GAME direct emit with a PAUSE_GAME emit or just pause internally
code = code.replace(
  `onclick="window.emitEvent('EXIT_GAME', null)">MENU</button>`,
  `onclick="togglePause()">MENU</button>`
);

code = code.replace(
  `function resumeGame() {`,
  `function togglePause() {
      if (gameState === 'PLAYING') {
          gameState = 'PAUSED';
          pauseScreen.style.display = 'flex';
      } else if (gameState === 'PAUSED') {
          resumeGame();
      }
  }
  function resumeGame() {`
);

fs.writeFileSync('src/engine/template.ts', code);
console.log("Template menu patched.");
