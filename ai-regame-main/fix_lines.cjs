const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

let lines = code.split('\n');

const replacement = [
    "    '        function initLevel() {',",
    "    '            score = 0;',",
    "    '            hudStatus.innerText = \"Score: \" + score;',",
    "    '            particles = [];',",
    "    '            ',",
    "    '            player = {',",
    "    '                x: config.player.startX, y: config.player.startY, width: config.player.width, height: config.player.height,',",
    "    '                vx: 0, vy: 0, isGrounded: false, hp: 100',",
    "    '            };',",
    "    '            ',",
    "    '            platforms = config.entities.platforms.map(p => ({...p}));',",
    "    '            enemies = config.entities.enemies.map(e => ({...e, vx: e.speedX, vy: e.speedY}));',",
    "    '            collectibles = config.entities.collectibles.map(c => ({...c, collected: false}));',",
    "    '            portal = {...config.entities.portal};',",
    "    '        }',"
];

// Replace lines 238 to 252 (0-indexed)
lines.splice(238, 15, ...replacement);

fs.writeFileSync('src/engine/template.ts', lines.join('\n'));
console.log("Lines fixed.");
