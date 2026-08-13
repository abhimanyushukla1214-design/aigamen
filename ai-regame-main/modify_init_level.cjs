const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

// Replace the initLevel function with a data-driven one
const oldInitLevelPattern = /function initLevel\(\) \{[\s\S]*?portal = \{[^}]*\};[\s\S]*?\}/;
const newInitLevel = `function initLevel() {
            score = 0;
            hudStatus.innerText = "Score: " + score;
            particles = [];
            
            player = {
                x: config.player.startX, y: config.player.startY, width: config.player.width, height: config.player.height,
                vx: 0, vy: 0, isGrounded: false, hp: 100
            };

            platforms = config.entities.platforms.map(p => ({...p}));
            enemies = config.entities.enemies.map(e => ({...e, vx: e.speedX, vy: e.speedY}));
            collectibles = config.entities.collectibles.map(c => ({...c, collected: false}));
            portal = {...config.entities.portal};
        }`;

code = code.replace(oldInitLevelPattern, newInitLevel);

// Also need to inject player, entities, etc. into config
const oldConfigPattern = /const config = \{[\s\S]*?colors: \{[\s\S]*?\}\n        \};/;
const newConfig = `const config = {
            isTopDown: def.physics.gravity === 0,
            gravity: def.physics.gravity,
            jumpForce: def.physics.jumpForce,
            moveSpeed: def.physics.movementSpeed,
            friction: def.physics.friction,
            world: def.world,
            player: def.player,
            entities: def.entities,
            colors: {
                bg: def.theme.background,
                player: def.theme.player,
                enemy: def.theme.enemy,
                platform: def.theme.platform,
                collectible: def.theme.collectible
            }
        };`;

code = code.replace(oldConfigPattern, newConfig);

fs.writeFileSync('src/engine/template.ts', code);
console.log("initLevel modified.");
