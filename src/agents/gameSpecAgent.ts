import { generateAnimeVisualSpec, generateMotionSpec } from './animeVisualDirector.js';
import { Type, Schema } from '@google/genai';
import { GameDirectorPlan } from '../types/nexus.js';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import { AI_CONFIG } from '../config/ai-models.js';
import { getGeminiClient } from '../services/geminiService.js';
import { validateAndRepairSpec } from './specFidelityAgent.js';
import { enrichGameContent } from './contentDesignAgent.js';
import crypto from 'crypto';

const gameSpecSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A catchy title for the game.' },
    world: {
      type: Type.OBJECT,
      properties: {
        settingName: { type: Type.STRING },
        environmentType: { type: Type.STRING },
        atmosphere: { type: Type.STRING },
        keyLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
        loreBackground: { type: Type.STRING }
      },
      required: ['settingName', 'environmentType', 'atmosphere', 'keyLocations', 'loreBackground']
    },
    story: {
      type: Type.OBJECT,
      properties: {
        logline: { type: Type.STRING },
        theme: { type: Type.STRING },
        incitingIncident: { type: Type.STRING },
        mainQuest: { type: Type.STRING },
        narrativeTone: { type: Type.STRING }
      },
      required: ['logline', 'theme', 'incitingIncident', 'mainQuest', 'narrativeTone']
    },
    character: {
      type: Type.OBJECT,
      properties: {
        protagonist: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            motivation: { type: Type.STRING },
            abilities: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['name', 'role', 'motivation', 'abilities']
        },
        antagonistOrHazard: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['name', 'description']
        },
        keyNPCs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING }
            },
            required: ['name', 'role']
          }
        }
      },
      required: ['protagonist', 'antagonistOrHazard']
    },
    gameplay: {
      type: Type.OBJECT,
      properties: {
        coreLoop: { type: Type.STRING },
        primaryMechanics: { type: Type.ARRAY, items: { type: Type.STRING } },
        progressionSystem: { type: Type.STRING },
        winCondition: { type: Type.STRING },
        lossCondition: { type: Type.STRING },
        controls: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ['key', 'action']
          }
        }
      },
      required: ['coreLoop', 'primaryMechanics', 'progressionSystem', 'winCondition', 'lossCondition', 'controls']
    },
    physics: {
      type: Type.OBJECT,
      properties: {
        gravity: { type: Type.NUMBER, description: 'Positive implies downward force (e.g. 9.8). 0 for top-down.' },
        movementSpeed: { type: Type.NUMBER },
        jumpForce: { type: Type.NUMBER },
        friction: { type: Type.NUMBER },
        collisionType: { type: Type.STRING, description: 'e.g. AABB, Circle, Polygon, None' },
        environmentalHazards: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['gravity', 'movementSpeed', 'jumpForce', 'friction', 'collisionType', 'environmentalHazards']
    },
    cinematography: {
      type: Type.OBJECT,
      properties: {
        cameraPerspective: { type: Type.STRING, description: 'e.g. 2D_SIDE_SCROLLER, 2D_TOP_DOWN, CANVAS_ARCADE, FIRST_PERSON' },
        visualStyle: { type: Type.STRING },
        colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
        lightingMood: { type: Type.STRING },
        uiStyle: { type: Type.STRING }
      },
      required: ['cameraPerspective', 'visualStyle', 'colorPalette', 'lightingMood', 'uiStyle']
    },
    gameIdentity: {
      type: Type.OBJECT,
      properties: {
        archetype: {
          type: Type.STRING,
          enum: [
            'SNAKE', 'TETRIS', 'PLATFORMER', 'ENDLESS_RUNNER', 'FLAPPY_STYLE',
            'TOP_DOWN_SHOOTER', 'SPACE_SHOOTER', 'RACING', 'PUZZLE', 'BREAKOUT',
            'PONG', 'FIGHTING', 'SURVIVAL', 'ADVENTURE', 'RPG', 'STRATEGY',
            'TOWER_DEFENSE', 'HORROR', 'STEALTH', 'SIMULATION', 'CUSTOM'
          ],
          description: 'The classified game archetype'
        },
        subtype: { type: Type.STRING },
        genre: { type: Type.STRING },
        perspective: { type: Type.STRING },
        cameraMode: { type: Type.STRING },
        coreGameplayLoop: { type: Type.STRING },
        physicsModel: { type: Type.STRING },
        controlModel: { type: Type.STRING },
        progressionModel: { type: Type.STRING }
      },
      required: ['archetype', 'subtype', 'genre', 'perspective', 'cameraMode', 'coreGameplayLoop', 'physicsModel', 'controlModel', 'progressionModel']
    },
    entitySystem: {
      type: Type.OBJECT,
      properties: {
        entities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: {
                type: Type.STRING,
                enum: ['player', 'enemy', 'NPC', 'collectible', 'projectile', 'obstacle', 'platform', 'environment object', 'goal', 'hazard', 'power-up']
              },
              purpose: { type: Type.STRING },
              visualIdentity: {
                type: Type.OBJECT,
                properties: {
                  shape: { type: Type.STRING },
                  color: { type: Type.STRING },
                  textureStyle: { type: Type.STRING },
                  details: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['shape', 'color']
              },
              size: {
                type: Type.OBJECT,
                properties: {
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER }
                },
                required: ['width', 'height']
              },
              positionSpawnRules: { type: Type.STRING },
              movement: { type: Type.STRING },
              collision: { type: Type.STRING },
              interaction: { type: Type.STRING },
              animation: { type: Type.STRING },
              state: { type: Type.STRING }
            },
            required: ['id', 'name', 'type', 'purpose', 'visualIdentity', 'size', 'positionSpawnRules', 'movement', 'collision', 'interaction', 'animation', 'state']
          }
        }
      },
      required: ['entities']
    },
    gameRules: {
      type: Type.OBJECT,
      properties: {
        spawning: { type: Type.STRING },
        movement: { type: Type.STRING },
        collision: { type: Type.STRING },
        scoring: { type: Type.STRING },
        health: { type: Type.STRING },
        damage: { type: Type.STRING },
        progression: { type: Type.STRING },
        win: { type: Type.STRING },
        loss: { type: Type.STRING },
        restart: { type: Type.STRING },
        pause: { type: Type.STRING },
        difficulty: { type: Type.STRING }
      },
      required: ['spawning', 'movement', 'collision', 'scoring', 'health', 'damage', 'progression', 'win', 'loss', 'restart', 'pause', 'difficulty']
    },
    uiUxSpecification: {
      type: Type.OBJECT,
      properties: {
        screens: {
          type: Type.OBJECT,
          properties: {
            startScreen: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                instructionCard: { type: Type.STRING },
                controls: { type: Type.STRING },
                objective: { type: Type.STRING },
                entityIntroduction: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'description', 'instructionCard', 'controls', 'objective', 'entityIntroduction']
            },
            hud: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.BOOLEAN },
                health: { type: Type.BOOLEAN },
                timer: { type: Type.BOOLEAN },
                pauseButton: { type: Type.BOOLEAN },
                restartButton: { type: Type.BOOLEAN },
                homeButton: { type: Type.BOOLEAN }
              },
              required: ['score', 'health', 'timer', 'pauseButton', 'restartButton', 'homeButton']
            },
            gameOverScreen: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'options']
            },
            victoryScreen: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'options']
            }
          },
          required: ['startScreen', 'hud', 'gameOverScreen', 'victoryScreen']
        },
        layout: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            responsiveDesign: { type: Type.STRING },
            safeZones: { type: Type.STRING }
          },
          required: ['type', 'responsiveDesign', 'safeZones']
        }
      },
      required: ['screens', 'layout']
    }
  },
  required: ['title', 'world', 'story', 'character', 'gameplay', 'physics', 'cinematography', 'gameIdentity', 'entitySystem', 'gameRules', 'uiUxSpecification']
};

export function detectGameArchetype(prompt: string): 'SNAKE' | 'TETRIS' | 'PLATFORMER' | 'ENDLESS_RUNNER' | 'FLAPPY_STYLE' | 'TOP_DOWN_SHOOTER' | 'SPACE_SHOOTER' | 'RACING' | 'PUZZLE' | 'BREAKOUT' | 'PONG' | 'FIGHTING' | 'SURVIVAL' | 'ADVENTURE' | 'RPG' | 'STRATEGY' | 'TOWER_DEFENSE' | 'HORROR' | 'STEALTH' | 'SIMULATION' | 'CUSTOM' {
  const p = prompt.toUpperCase();
  if (p.includes('SNAKE')) return 'SNAKE';
  if (p.includes('TETRIS') || p.includes('TETROMINO')) return 'TETRIS';
  if (p.includes('BREAKOUT') || p.includes('BRICK BREAKER') || p.includes('ARKANOID')) return 'BREAKOUT';
  if (p.includes('PONG') || p.includes('TABLE TENNIS')) return 'PONG';
  if (p.includes('FLAPPY') || p.includes('COPTER') || p.includes('TAP TO FLY') || p.includes('BIRD')) return 'FLAPPY_STYLE';
  if (p.includes('SPACE SHOOTER') || p.includes('GALAXY SHOOTER') || p.includes('GALAGA') || p.includes('INVADERS') || p.includes('ASTEROIDS')) return 'SPACE_SHOOTER';
  if (p.includes('TOP DOWN SHOOTER') || p.includes('TOP-DOWN SHOOTER') || p.includes('TWIN STICK') || p.includes('TWIN-STICK')) return 'TOP_DOWN_SHOOTER';
  if (p.includes('RACING') || p.includes('RACER') || p.includes('DRIVING') || p.includes('HILL CLIMB') || p.includes('BUGGY') || p.includes('CAR GAME')) return 'RACING';
  if (p.includes('ENDLESS RUNNER') || p.includes('TEMPLE RUN') || p.includes('SUBWAY SURF') || p.includes('DINO RUN')) return 'ENDLESS_RUNNER';
  if (p.includes('TOWER DEFENSE') || p.includes('TD GAME') || p.includes('BALLOONS TD')) return 'TOWER_DEFENSE';
  if (p.includes('STEALTH')) return 'STEALTH';
  if (p.includes('HORROR')) return 'HORROR';
  if (p.includes('FIGHTING') || p.includes('BRAWLER')) return 'FIGHTING';
  if (p.includes('STRATEGY')) return 'STRATEGY';
  if (p.includes('SIMULATION') || p.includes('SIMULATOR')) return 'SIMULATION';
  if (p.includes('RPG') || p.includes('ROLE PLAYING')) return 'RPG';
  if (p.includes('SURVIVAL')) return 'SURVIVAL';
  if (p.includes('ADVENTURE') || p.includes('QUEST')) return 'ADVENTURE';
  if (p.includes('PUZZLE') || p.includes('SUDOKU') || p.includes('MATCH 3') || p.includes('MAZE')) return 'PUZZLE';
  if (p.includes('PLATFORMER') || p.includes('MARIO') || p.includes('JUMPING GAME')) return 'PLATFORMER';
  return 'CUSTOM';
}

export async function generateGameSpecification(plan: GameDirectorPlan): Promise<ComprehensiveGameSpec> {
  const detectedArchetype = detectGameArchetype(plan.originalPrompt || plan.intent.genre.join(' ') || '');
  
  const prompt = `
You are the NEXUS Game Specification Agent.
Your task is to take a Game Director Plan (Structured Intent) and generate a comprehensive, highly customized Game Specification Document spanning the 6 classic domains (World, Story, Character, Gameplay, Physics, and Cinematography) AND the 4 specific design structures (Game Identity, Entity System, Game Rules, and UI/UX Specification).

CRITICAL DIRECTIVES:
1. THE DETECTED ARCHETYPE IS: ${detectedArchetype}
Your output's gameIdentity.archetype MUST be exactly "${detectedArchetype}".

2. NEVER INJECT GENERIC PLATFORMING MECHANICS (like gravity, jump force, platforms, air control, WASD) unless they are strictly required for the detected archetype ("${detectedArchetype}").
For example:
- For SNAKE: gravity MUST be 0, jump force MUST be 0, camera mode MUST be static top-down, physicsModel must be grid/discrete, and movement/body growth rules must replace standard velocities.
- For TETRIS: gravity is 0 (except standard grid drop tick rates), jump force is 0, movement is grid-discrete, board dimensions and tetromino shapes are defined.
- For PONG: gravity is 0, jump force is 0, paddles and ball physics are defined.
- Only PLATFORMER and ENDLESS_RUNNER/FLAPPY_STYLE should utilize gravity/jump force, camera scrolling, or standard platform generation.

3. ARCHETYPE SPECIFIC DESIGN RULES:
Ensure gameIdentity, entitySystem, gameRules, and uiUxSpecification are fully fleshed out with SPECIFIC, concrete, machine-readable entries for "${detectedArchetype}". Never output generic placeholders like "custom", "Unknown World", "Generic", "appropriate attire", etc. If the theme is "cyberpunk anime", generate genuine cyberpunk names like "cyber_snake", "energy_core", "neon_grid".

4. MANDATORY DESIGN COMPLETENESS RULE:
If the user design plan (or original prompt) does NOT explicitly specify score or health related details, you MUST include:
- In the entitySystem.entities array: at least one collectible type entity (e.g. neon_crystal, coin) to score points, AND at least one hazard/enemy/health-reducer entity (e.g. hazard_spike, drone) that reduces health or inflicts damage.
- In the gameRules object: define concrete, numeric logic under 'scoring' (e.g. "Each coin increases score by 10 points") and 'damage' (e.g. "Touching hazard_spike reduces player HP by 20").
- In uiUxSpecification.screens.hud: set 'score' and 'health' to true.
This ensures the game is playable with complete loops unless explicitly requested otherwise.

Here is the Game Director Plan:
${JSON.stringify(plan, null, 2)}
`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODEL_FAST, // use fast model to stay within free tier rate limits
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: gameSpecSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const rawResult = JSON.parse(text);
    
    let finalSpec: ComprehensiveGameSpec = {
      gameId: crypto.randomUUID(),
      ...rawResult
    };

    const animeVisual = await generateAnimeVisualSpec(plan.originalPrompt || '', plan);
    const motion = await generateMotionSpec(plan.originalPrompt || '', plan);
    finalSpec.animeVisual = animeVisual;
    finalSpec.motion = motion;
    
    // Process finalSpec through post-processors
    const validation = await validateAndRepairSpec(finalSpec, plan.originalPrompt || '');
    if (validation.changed) {
      console.log('[NEXUS Fidelity Audit]: Gaps detected and resolved:', validation.logs);
    }
    const content = enrichGameContent(validation.spec);
    return content.spec;
      
  } catch (error) {
    const errStr = error instanceof Error ? error.message : String(error);
    const isRateLimit = errStr.includes('429') || errStr.includes('503') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');
    
    if (isRateLimit) {
      console.log('Rate limit/quota exceeded generating game specification. Using fallback.');
    } else {
      console.error('Error generating game specification:', error);
    }
    
    // Fallback if Gemini quota is exceeded or unavailable
    const genre = plan.intent.genre[0] || 'action';
    const theme = plan.intent.theme[0] || 'custom';
    const originalPrompt = plan.originalPrompt || '';
    let camera = plan.intent.cameraPerspective !== 'unspecified' ? plan.intent.cameraPerspective : ((genre === 'racing' || genre === 'exploration' || genre === 'rpg' || genre === 'survival' || genre === 'puzzle') ? '2D_TOP_DOWN' : '2D_SIDE_SCROLLER');

    let controls = [{key: "WASD", action: "Move"}, {key: "Space", action: "Action"}];
    let gravity = camera === '2D_TOP_DOWN' ? 0 : 9.8;
    let winCondition = "Reach the goal.";
    let coreLoop = "Explore and survive.";

    if (genre === 'racing') {
      controls = [{key: "W", action: "Accelerate"}, {key: "S", action: "Brake"}, {key: "A/D", action: "Steer"}];
      winCondition = "Finish the race.";
      coreLoop = "Race to the finish line.";
    } else if (genre === 'platformer') {
      controls = [{key: "A/D", action: "Move"}, {key: "Space", action: "Jump"}];
      winCondition = "Reach the portal.";
      coreLoop = "Jump between platforms and avoid hazards.";
    } else if (genre === 'exploration' || genre === 'rpg') {
      winCondition = "Explore all areas.";
      coreLoop = "Explore and interact with the world.";
    }

    const details = getFallbackIdentityAndRules(originalPrompt, theme, genre, camera);

    const fallbackSpec: ComprehensiveGameSpec = {
      gameId: crypto.randomUUID(),
      originalPrompt: originalPrompt,
      generationFingerprint: crypto.randomUUID(),
      title: plan.originalPrompt ? plan.originalPrompt.slice(0, 30) + '...' : "Generated Game",
      world: {
        settingName: plan.intent.setting,
        environmentType: theme,
        atmosphere: plan.intent.atmosphere[0] || 'Silent',
        keyLocations: ["Start Area", "End Point"],
        loreBackground: "Generated from user intent."
      },
      story: {
        logline: `A ${genre} game set in a ${theme} world.`,
        theme: theme,
        incitingIncident: "Start",
        mainQuest: winCondition,
        narrativeTone: "Neutral"
      },
      character: {
        protagonist: {
          name: plan.intent.playerRole,
          role: plan.intent.playerRole,
          motivation: "Win",
          abilities: ["Move"]
        },
        antagonistOrHazard: {
          name: "Obstacles",
          description: "Hazards in the world."
        },
        keyNPCs: []
      },
      gameplay: {
        coreLoop: coreLoop,
        primaryMechanics: [genre],
        progressionSystem: "Linear",
        winCondition: winCondition,
        lossCondition: "Run out of health or fail objective.",
        controls: controls
      },
      physics: {
        gravity: gravity,
        movementSpeed: 5,
        jumpForce: 15,
        friction: 0.8,
        collisionType: "AABB",
        environmentalHazards: ["Pits"]
      },
      cinematography: {
        cameraPerspective: camera as any,
        visualStyle: theme,
        colorPalette: theme === 'cyberpunk' ? ["#0a0a2a", "#ff00ff", "#00ffff", "#222222"] : 
                       (theme === 'fantasy' ? ["#2c1e16", "#d4af37", "#8b0000", "#555555"] : 
                       (theme === 'sci-fi' ? ["#0f172a", "#38bdf8", "#e2e8f0", "#334155"] : 
                       ["#111111", "#444444", "#4ade80", "#3b82f6"])),
        lightingMood: "Flat",
        uiStyle: "Minimalist"
      },
      animeVisual: {
        visualStyle: [theme],
        artDirection: `${theme} style art`,
        colorPalette: ['#0f172a', '#3b82f6', '#ef4444', '#1e293b'],
        environment: {
          background: ['sky'],
          midground: ['structures'],
          gameplay: ['terrain'],
          foreground: ['particles'],
          atmosphere: ['fog']
        },
        characterVisuals: {
          proportions: 'standard',
          clothing: ['appropriate attire'],
          accessories: []
        },
        animation: ['idle', 'walk'],
        camera: ['smooth follow'],
        lighting: ['ambient light'],
        particles: ['dust'],
        effects: ['glow'],
        composition: ['dynamic'],
        uiDirection: 'minimalist',
        motionDirection: 'smooth'
      },
      motion: {
        acceleration: 1500,
        deceleration: 1000,
        maximumSpeed: 300,
        jump: -500,
        gravity: 900,
        airControl: 0.5,
        friction: 0.8,
        dash: 800,
        knockback: 400,
        animationSpeed: 1,
        cameraResponse: ['slight vertical response'],
        environmentalMovement: ['parallax layers']
      },
      gameIdentity: details.gameIdentity,
      entitySystem: details.entitySystem,
      gameRules: details.gameRules,
      uiUxSpecification: details.uiUxSpecification
    };

    // Process fallbackSpec through post-processors
    const validation = await validateAndRepairSpec(fallbackSpec, plan.originalPrompt || '');
    if (validation.changed) {
      console.log('[NEXUS Fidelity Audit]: Gaps detected and resolved in fallback:', validation.logs);
    }
    const content = enrichGameContent(validation.spec);
    return content.spec;
  }
}

function getFallbackIdentityAndRules(prompt: string, theme: string, genre: string, camera: string) {
  const archetype = detectGameArchetype(prompt);
  let subtype = "2D Arcade";
  let perspective = camera;
  let cameraMode = camera === '2D_TOP_DOWN' ? 'static' : 'smooth-follow';
  let coreGameplayLoop = "Score points and survive.";
  let physicsModel = archetype === 'SNAKE' || archetype === 'TETRIS' ? 'grid' : 'arcade-aabb';
  let controlModel = "keyboard-controls";
  let progressionModel = "score-milestones";

  let entities: any[] = [
    {
      id: "player_1",
      name: "Protagonist",
      type: "player",
      purpose: "Controlled by player to achieve objective",
      visualIdentity: { shape: "rectangle", color: "#38bdf8" },
      size: { width: 32, height: 32 },
      positionSpawnRules: "Center screen",
      movement: "WASD / Arrow Keys",
      collision: "Stops at walls, interacts with items",
      interaction: "Collects items, takes damage from hazards",
      animation: "Idle/Walk animations",
      state: "Active"
    }
  ];

  let rules: any = {
    spawning: "Entities spawn at start of play or at designated portals.",
    movement: "Player moves freely based on input controls.",
    collision: "Standard axis-aligned bounding box checks.",
    scoring: "Gain points on actions like collecting key objectives.",
    health: "Start with 100 hit points.",
    damage: "Lose health upon contact with dangerous hazards.",
    progression: "Level up as score increases.",
    win: "Complete objective or reach goal.",
    loss: "HP reaches 0.",
    restart: "Reload play session.",
    pause: "Halt all action.",
    difficulty: "Incremental ramp over time."
  };

  if (archetype === 'SNAKE') {
    subtype = "grid-crawler";
    coreGameplayLoop = "Eat food, grow longer, avoid walls and your own body.";
    perspective = "2D_TOP_DOWN";
    cameraMode = "static";
    physicsModel = "grid";
    entities = [
      {
        id: "snake_head",
        name: "Snake Head",
        type: "player",
        purpose: "Steer the snake head to collect food",
        visualIdentity: { shape: "circle", color: "#22c55e" },
        size: { width: 20, height: 20 },
        positionSpawnRules: "Grid center",
        movement: "Continuous grid movement in current direction",
        collision: "Dies on wall or body collision",
        interaction: "Grows upon eating food",
        animation: "Discrete cell updates",
        state: "Active"
      },
      {
        id: "food_item",
        name: "Neon Apple",
        type: "collectible",
        purpose: "Spawns randomly on empty grid cells",
        visualIdentity: { shape: "circle", color: "#ef4444" },
        size: { width: 20, height: 20 },
        positionSpawnRules: "Random empty cell",
        movement: "Static",
        collision: "AABB check",
        interaction: "Increases length and score",
        animation: "Pulse glow",
        state: "Active"
      }
    ];
    rules = {
      spawning: "Food spawns in empty grid cells.",
      movement: "Fixed interval tick updates direction.",
      collision: "Self and boundary collision checks.",
      scoring: "100 points per item consumed.",
      health: "1 life.",
      damage: "Instant death on crash.",
      progression: "Speed increases slightly every 5 items.",
      win: "Score maximum possible points.",
      loss: "Collide with wall or body.",
      restart: "Re-initialize grid, reset snake.",
      pause: "Freeze interval timer.",
      difficulty: "Ticks speed up."
    };
  } else if (archetype === 'TETRIS') {
    subtype = "falling-blocks";
    coreGameplayLoop = "Rotate and arrange falling pieces to clear horizontal rows.";
    perspective = "2D_TOP_DOWN";
    cameraMode = "static";
    physicsModel = "grid";
    entities = [
      {
        id: "falling_piece",
        name: "Tetromino",
        type: "player",
        purpose: "Active falling block controlled by the player",
        visualIdentity: { shape: "custom", color: "#a855f7" },
        size: { width: 40, height: 40 },
        positionSpawnRules: "Top center of board",
        movement: "Discrete down, left, right, and rotation",
        collision: "Grid checks against landed blocks and bounds",
        interaction: "Locks in place upon landing",
        animation: "Flash on row clear",
        state: "Falling"
      }
    ];
    rules = {
      spawning: "Random piece spawns at top center.",
      movement: "Automatic down-drop tick. Left/right/rotate on player input.",
      collision: "Stops upon touching bottom or landed blocks.",
      scoring: "Points awarded per line clear (single, double, triple, Tetris).",
      health: "No health; based on board space.",
      damage: "None.",
      progression: "Level increases every 10 lines cleared.",
      win: "Reach highest score or level.",
      loss: "Blocks stack to top of screen.",
      restart: "Reset grid.",
      pause: "Freeze falling timers.",
      difficulty: "Gravity/drop speed increases per level."
    };
  } else if (archetype === 'RACING') {
    subtype = "arcade-racer";
    coreGameplayLoop = "Steer vehicle through tracks, avoiding walls and hurdles to achieve record laps.";
    perspective = "2D_TOP_DOWN";
    cameraMode = "smooth-follow";
    physicsModel = "arcade-velocity";
    entities = [
      {
        id: "race_car",
        name: "Apex Interceptor",
        type: "player",
        purpose: "Player high-performance racer vehicle",
        visualIdentity: { shape: "vehicle", color: "#ec4899" },
        size: { width: 48, height: 24 },
        positionSpawnRules: "Start line",
        movement: "Accelerate, brake, steer, drift",
        collision: "Bounces/slows on hitting boundaries",
        interaction: "Refuels at checkpoints, hits turbo boosts",
        animation: "Drift smoke particles, tire tracks",
        state: "Accelerating"
      }
    ];
    rules = {
      spawning: "Spawns at start line grid position.",
      movement: "Physics-based velocity, angular drag, sliding traction.",
      collision: "Deflects velocity off solid barriers.",
      scoring: "Time-based high scores, lap count tracking.",
      health: "Armor or fuel level.",
      damage: "Crashes deplete vehicle armor.",
      progression: "Tracks and lap configurations.",
      win: "Cross finish line after required laps.",
      loss: "Armor/HP hits 0 or fuel expires.",
      restart: "Reset to start line.",
      pause: "Freeze physics steps.",
      difficulty: "Competitor AI speed scaling."
    };
  }

  const uiUx = {
    screens: {
      startScreen: {
        title: archetype + " CHALLENGE",
        description: "Engage in this elite " + archetype.toLowerCase() + " simulation.",
        instructionCard: "Master the controls to dominate the arena.",
        controls: camera === '2D_TOP_DOWN' ? "WASD / Arrows to Move" : "WASD/Arrows to steer, Space to Jump",
        objective: coreGameplayLoop,
        entityIntroduction: entities.map(e => `${e.name}: ${e.purpose}`)
      },
      hud: {
        score: true,
        health: archetype !== 'TETRIS' && archetype !== 'SNAKE',
        timer: archetype === 'RACING',
        pauseButton: true,
        restartButton: true,
        homeButton: true
      },
      gameOverScreen: {
        title: "DISSOLUTION COMPLETE",
        options: ["EXPEDITION RESTART", "RETURN TO NEXUS"]
      },
      victoryScreen: {
        title: "VICTORY ATTAINED",
        options: ["PLAY AGAIN", "RETURN TO NEXUS"]
      }
    },
    layout: {
      type: "viewport-locked",
      responsiveDesign: "Auto-scaling viewport",
      safeZones: "HUD is placed in secure corner modules"
    }
  };

  return {
    gameIdentity: {
      archetype,
      subtype,
      genre,
      perspective,
      cameraMode,
      coreGameplayLoop,
      physicsModel,
      controlModel,
      progressionModel
    },
    entitySystem: {
      entities
    },
    gameRules: rules,
    uiUxSpecification: uiUx
  };
}
