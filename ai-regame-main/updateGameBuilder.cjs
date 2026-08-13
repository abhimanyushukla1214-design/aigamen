const fs = require('fs');

let code = fs.readFileSync('src/engine/gameBuilder.ts', 'utf-8');

// Add import
code = code.replace(
  "import { generateGameHTML } from './template.js';",
  "import { generateGameHTML } from './template.js';\nimport { generateVisualSpecification } from '../agents/visualDesignAgent.js';"
);

// We need to implement a seeded random generator and level generator inside buildGame.
const levelGenLogic = `
  const visuals = generateVisualSpecification(spec);
  
  // Seeded Random Helper
  let seed = spec.gameId.split('-')[0] || '12345';
  let seedVal = parseInt(seed, 16);
  function random() {
    let t = seedVal += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  let platforms: any[] = [];
  let enemies: any[] = [];
  let collectibles: any[] = [];
  let obstacles: any[] = [];
  let portal = { x: 0, y: 0, width: 60, height: 100 };
  let checkpoints: any[] = [];

  const worldWidth = gameType === 'RACING' ? 20000 : (gameType === 'TOP_DOWN' ? 3000 : 4000);
  const worldHeight = gameType === 'TOP_DOWN' ? 3000 : 1500;

  if (gameType === 'RACING') {
    platforms = [
      { x: -500, y: 700, width: worldWidth + 1000, height: 400, type: 'road' }
    ];
    for (let i = 1; i < 25; i++) {
      obstacles.push({ x: i * 800 + random() * 200, y: 710 + random() * 200, width: 40, height: 40 });
    }
    portal = { x: worldWidth - 500, y: 700, width: 200, height: 400 };
  } else if (gameType === 'TOP_DOWN') {
    platforms = [
      { x: -500, y: -500, width: worldWidth + 1000, height: worldHeight + 1000, type: 'floor' },
    ];
    // Generate some walls and rooms
    for (let i=0; i<15; i++) {
       platforms.push({
         x: random() * (worldWidth - 200),
         y: random() * (worldHeight - 200),
         width: 100 + random() * 300,
         height: 50 + random() * 50,
         type: 'wall'
       });
       platforms.push({
         x: random() * (worldWidth - 200),
         y: random() * (worldHeight - 200),
         width: 50 + random() * 50,
         height: 100 + random() * 300,
         type: 'wall'
       });
    }
    if (hasEnemies) {
      for (let i=0; i<10; i++) {
        enemies.push({ x: 500 + random() * (worldWidth-1000), y: 500 + random() * (worldHeight-1000), width: 30, height: 30, speedX: (random()-0.5)*3, speedY: (random()-0.5)*3, shape: 'circle' });
      }
    }
    for (let i=0; i<15; i++) {
      collectibles.push({ x: 300 + random() * (worldWidth-600), y: 300 + random() * (worldHeight-600), width: 16, height: 16 });
    }
    portal = { x: worldWidth - 300, y: worldHeight - 300, width: 80, height: 80 };
  } else {
    // PLATFORMER (Seeded jump sequence)
    platforms.push({ x: -500, y: 1200, width: worldWidth + 1000, height: 300, type: 'floor' });
    
    let currentX = 300;
    let currentY = 1100;
    while (currentX < worldWidth - 500) {
      const w = 100 + random() * 200;
      platforms.push({ x: currentX, y: currentY, width: w, height: 20 });
      
      if (hasEnemies && random() > 0.5) {
        enemies.push({ x: currentX + w/2, y: currentY - 40, width: 30, height: 30, speedX: (random()>0.5?1:-1)*2, speedY: 0 });
      }
      if (random() > 0.3) {
        collectibles.push({ x: currentX + w/2, y: currentY - 80, width: 16, height: 16 });
      }
      
      currentX += w + 80 + random() * 150;
      currentY += (random() - 0.5) * 150;
      if (currentY > 1100) currentY = 1100;
      if (currentY < 400) currentY = 400;
    }
    portal = { x: currentX, y: currentY - 100, width: 60, height: 100 };
  }
`;

code = code.replace(/let platforms: any\[\] = \[\];[\s\S]*?portal = { x: 1610, y: 200, width: 60, height: 100 };\n  }/m, levelGenLogic);

// Add visual properties to definition
code = code.replace(
  "title: spec.title,",
  "title: spec.title,\n    visuals,\n    seed,\n    objectives: [spec.story.mainQuest || 'Survive', spec.gameplay.winCondition || 'Reach the end'],"
);

// Make sure world width/height match our logic
code = code.replace(
  "world: { width: gameType === 'RACING' ? 20000 : 3000, height: gameType === 'TOP_DOWN' ? 3000 : 1000 },",
  "world: { width: worldWidth, height: worldHeight },"
);

fs.writeFileSync('src/engine/gameBuilder.ts', code);
