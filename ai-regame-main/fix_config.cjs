const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

const replacement = `    '        const config = {',
    '            isTopDown: ' + isTopDown + ',',
    '            gravity: ' + gravity + ' * 0.15,',
    '            jumpForce: ' + def.physics.jumpForce + ',',
    '            moveSpeed: ' + def.physics.movementSpeed + ',',
    '            friction: ' + def.physics.friction + ',',
    '            world: ' + JSON.stringify(def.world) + ',',
    '            player: ' + JSON.stringify(def.player) + ',',
    '            entities: ' + JSON.stringify(def.entities) + ',',
    '            colors: {',
    '                bg: "' + bgColor + '",',
    '                player: "' + playerColor + '",',
    '                enemy: "' + enemyColor + '",',
    '                platform: "' + platformColor + '",',
    '                collectible: "#f59e0b"',
    '            }',
    '        };',`;

let lines = code.split('\n');
lines.splice(137, 14, replacement);

fs.writeFileSync('src/engine/template.ts', lines.join('\n'));
console.log("Config fixed.");
