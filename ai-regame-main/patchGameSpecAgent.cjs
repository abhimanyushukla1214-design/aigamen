const fs = require('fs');
let code = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf-8');

const fallbackRegex = /return \{\s*gameId: crypto\.randomUUID\(\),\s*title: "Fallback Sandbox Game",.*?\}\;/s;

const newFallback = `
const genre = plan.intent.genre[0] || 'action';
const theme = plan.intent.theme[0] || 'custom';
const originalPrompt = plan.originalPrompt || '';
let camera = plan.intent.cameraPerspective !== 'unspecified' ? plan.intent.cameraPerspective : (genre === 'racing' ? '2D_TOP_DOWN' : '2D_SIDE_SCROLLER');

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

return {
      gameId: crypto.randomUUID(),
      originalPrompt: originalPrompt,
      generationFingerprint: crypto.randomUUID(),
      title: plan.intent.summary.slice(0, 30) || "Generated Game",
      world: {
        settingName: plan.intent.setting,
        environmentType: theme,
        atmosphere: plan.intent.atmosphere[0] || 'Silent',
        keyLocations: ["Start Area", "End Point"],
        loreBackground: "Generated from user intent."
      },
      story: {
        logline: \`A \${genre} game set in a \${theme} world.\`,
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
        cameraPerspective: camera,
        visualStyle: theme,
        colorPalette: ["#111111", "#444444", "#4ade80", "#3b82f6"],
        lightingMood: "Flat",
        uiStyle: "Minimalist"
      },
      animeVisual: {
        visualStyle: [theme],
        artDirection: \`\${theme} style art\`,
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
      }
    };
`;

code = code.replace(fallbackRegex, newFallback);

// Also add originalPrompt and generationFingerprint to ComprehensiveGameSpec
// but wait, we need to make sure we don't break types.
fs.writeFileSync('src/agents/gameSpecAgent.ts', code);
