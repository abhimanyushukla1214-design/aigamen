const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

const replacement = `    '        function initLevel() {',
    '            score = 0;',
    '            hudStatus.innerText = "Score: " + score;',
    '            particles = [];',
    '            ',
    '            player = {',
    '                x: config.player.startX, y: config.player.startY, width: config.player.width, height: config.player.height,',
    '                vx: 0, vy: 0, isGrounded: false, hp: 100',
    '            };',
    '            ',
    '            platforms = config.entities.platforms.map(p => ({...p}));',
    '            enemies = config.entities.enemies.map(e => ({...e, vx: e.speedX, vy: e.speedY}));',
    '            collectibles = config.entities.collectibles.map(c => ({...c, collected: false}));',
    '            portal = {...config.entities.portal};',
    '        }',`;

const badCode = `'        function initLevel() {            score = 0;            hudStatus.innerText = "Score: " + score;            particles = [];                        player = {                x: config.player.startX, y: config.player.startY, width: config.player.width, height: config.player.height,                vx: 0, vy: 0, isGrounded: false, hp: 100            };            platforms = config.entities.platforms.map(p => ({...p}));            enemies = config.entities.enemies.map(e => ({...e, vx: e.speedX, vy: e.speedY}));            collectibles = config.entities.collectibles.map(c => ({...c, collected: false}));            portal = {...config.entities.portal};        }'`;

code = code.replace(badCode, replacement);

fs.writeFileSync('src/engine/template.ts', code);
console.log("initLevel fixed.");
