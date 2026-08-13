const fs = require('fs');
let code = fs.readFileSync('src/types/gameBuilder.ts', 'utf-8');

const defRegex = /export interface PlayableGameDefinition \{.*?\}/s;

const newDef = `export interface PlayableGameDefinition {
  title: string;
  gameType: 'RACING' | 'PLATFORMER' | 'TOP_DOWN' | 'UNKNOWN';
  theme: {
    background: string;
    player: string;
    platform: string;
    enemy: string;
    collectible: string;
    particle: string;
  };
  physics: {
    gravity: number;
    jumpForce: number;
    movementSpeed: number;
    friction: number;
  };
  world: {
    width: number;
    height: number;
  };
  player: {
    width: number;
    height: number;
    startX: number;
    startY: number;
    shape: 'rect' | 'circle' | 'triangle';
  };
  entities: {
    platforms: Array<{x: number, y: number, width: number, height: number, type?: string}>;
    enemies: Array<{x: number, y: number, width: number, height: number, speedX: number, speedY: number, shape?: string}>;
    collectibles: Array<{x: number, y: number, width: number, height: number}>;
    portal: {x: number, y: number, width: number, height: number};
    obstacles?: Array<{x: number, y: number, width: number, height: number}>;
    checkpoints?: Array<{x: number, y: number, width: number, height: number}>;
  };
  winCondition: string;
  loseCondition: string;
  controls: Array<{key: string, action: string}>;
  cameraFollow: 'X' | 'Y' | 'BOTH' | 'NONE';
}`;

code = code.replace(defRegex, newDef);
fs.writeFileSync('src/types/gameBuilder.ts', code);
