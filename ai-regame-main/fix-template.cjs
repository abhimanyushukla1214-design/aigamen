const fs = require('fs');

let code = fs.readFileSync('src/engine/template.ts', 'utf8');

// Fix the template literals inside the generated string by escaping them
code = code.replace(/hudStatus\.innerText = `Score: \${score}`;/g, 'hudStatus.innerText = \\`Score: \\$\\{score\\}\\`;');
code = code.replace(/let dTxt = `FPS:(.*?)\\${gameState}`;/gs, 'let dTxt = \\`FPS:$1\\$\\{gameState\\}\\`;');

// Fix e.key === '`' 
code = code.replace(/e\.key === '`'/g, "e.key === '\\`'");

fs.writeFileSync('src/engine/template.ts', code);
