const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

code = code.replace(
  `window.resumeGame = function() {`,
  `window.togglePause = function() {
      if (gameState === 'PLAYING') {
          gameState = 'PAUSED';
          pauseScreen.style.display = 'flex';
      } else if (gameState === 'PAUSED') {
          window.resumeGame();
      }
  };
  window.resumeGame = function() {`
);

fs.writeFileSync('src/engine/template.ts', code);
console.log("Template menu toggled patched.");
