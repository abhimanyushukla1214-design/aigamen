const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

const bad = `    '    <div id="end-screen">',
    '        <h1 id="end-title">GAME OVER</h1>',
    '        <p id="end-subtitle" style="margin-bottom: 30px; font-size: 18px; color: #ccc;"></p>',
    '        <button class="action-btn" onclick="restartGame()">Play Again</button>',
    '    </div>',`;

const good = `    '    <div id="end-screen">',
    '        <h1 id="end-title">GAME OVER</h1>',
    '        <p id="end-subtitle" style="margin-bottom: 30px; font-size: 18px; color: #ccc;"></p>',
    '        <button class="action-btn" onclick="restartGame()">Play Again</button>',
    '        <button class="action-btn" style="margin-top: 15px; background: rgba(8, 145, 178, 0.3); border: 1px solid #0891b2; color: #67e8f9;" onclick="window.emitEvent(\\'VIEW_UNIVERSE\\', null)">View Universe State</button>',
    '    </div>',`;

code = code.replace(bad, good);

fs.writeFileSync('src/engine/template.ts', code);
console.log("End screen patched.");
