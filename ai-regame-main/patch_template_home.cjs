const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

// Add onscreen menu button to UI layer
code = code.replace(
  '<div class="hud-top">',
  `<div class="hud-top">
            <button class="action-btn" style="padding: 4px 8px; font-size: 12px; margin-right: 10px;" onclick="window.emitEvent('EXIT_GAME', null)">MENU</button>`
);

// Add Home button to pause screen
code = code.replace(
  '<button class="action-btn" style="margin-top: 15px;" onclick="restartGame()">Restart</button>',
  `<button class="action-btn" style="margin-top: 15px;" onclick="restartGame()">Restart</button>
        <button class="action-btn" style="margin-top: 15px; background: rgba(239, 68, 68, 0.2); border-color: #ef4444;" onclick="window.emitEvent('EXIT_GAME', null)">Home</button>`
);

// Add Home button to end screen
code = code.replace(
  '<button class="action-btn" style="margin-top: 15px; background: rgba(8, 145, 178, 0.3); border: 1px solid #0891b2; color: #67e8f9;" onclick="window.emitEvent(\'VIEW_UNIVERSE\', null)">View Universe State</button>',
  `<button class="action-btn" style="margin-top: 15px; background: rgba(8, 145, 178, 0.3); border: 1px solid #0891b2; color: #67e8f9;" onclick="window.emitEvent('VIEW_UNIVERSE', null)">View Universe State</button>
        <button class="action-btn" style="margin-top: 15px; background: rgba(239, 68, 68, 0.2); border-color: #ef4444;" onclick="window.emitEvent('EXIT_GAME', null)">Home</button>`
);

fs.writeFileSync('src/engine/template.ts', code);
console.log("Template home button patched.");
