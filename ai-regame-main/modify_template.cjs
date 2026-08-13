const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

code = code.replace(/export function generateGameHTML\(spec: ComprehensiveGameSpec\): string \{/, `export function generateGameHTML(def: PlayableGameDefinition): string {`);
code = code.replace(/const isTopDown = spec\.cinematography\.cameraPerspective === '2D_TOP_DOWN';/, `const isTopDown = def.physics.gravity === 0;`);
code = code.replace(/const gravity = isTopDown \? 0 : \(spec\.physics\.gravity \|\| 9\.8\);/, `const gravity = def.physics.gravity;`);
code = code.replace(/const bgColor = spec\.cinematography\.colorPalette\?\.\[0\] \|\| '#111827';/, `const bgColor = def.theme.background;`);
code = code.replace(/const playerColor = spec\.cinematography\.colorPalette\?\.\[1\] \|\| '#06b6d4';/, `const playerColor = def.theme.player;`);
code = code.replace(/const enemyColor = spec\.cinematography\.colorPalette\?\.\[2\] \|\| '#ef4444';/, `const enemyColor = def.theme.enemy;`);
code = code.replace(/const platformColor = spec\.cinematography\.colorPalette\?\.\[3\] \|\| '#374151';/, `const platformColor = def.theme.platform;`);
code = code.replace(/const specJson = JSON\.stringify\(spec\);/, `const specJson = JSON.stringify(def);`);

code = code.replace(/spec\.title/g, 'def.title');
code = code.replace(/spec\.gameplay\.winCondition/g, 'def.winCondition');

code = code.replace(/\(spec\.physics\.jumpForce \|\| 10\) \* 1\.2/, 'def.physics.jumpForce');
code = code.replace(/\(spec\.physics\.movementSpeed \|\| 5\) \* 1\.5/, 'def.physics.movementSpeed');
code = code.replace(/spec\.physics\.friction \|\| 0\.8/, 'def.physics.friction');

fs.writeFileSync('src/engine/template.ts', code);
console.log("Template modified.");
