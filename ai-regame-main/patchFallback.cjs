const fs = require('fs');
let content = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf-8');

if (!content.includes('animeVisual: {')) {
  content = content.replace(
    'uiStyle: "Minimalist"\n      }',
    `uiStyle: "Minimalist"
      },
      animeVisual: {
        visualStyle: ['cinematic 2D anime', 'layered environment', 'detailed silhouettes'],
        artDirection: 'Dark, atmospheric sci-fi with glowing neon highlights.',
        colorPalette: ['#0f172a', '#3b82f6', '#ef4444', '#1e293b'],
        environment: {
          background: ['sky', 'moon', 'distant structures'],
          midground: ['mountains', 'buildings'],
          gameplay: ['terrain', 'platforms', 'objects'],
          foreground: ['grass', 'particles', 'foreground structures'],
          atmosphere: ['fog', 'dust', 'snow']
        },
        characterVisuals: {
          proportions: 'anime-inspired proportions',
          clothing: ['exploration suit', 'animated visor'],
          accessories: ['equipment backpack']
        },
        animation: ['idle', 'walk', 'run', 'jump', 'fall'],
        camera: ['smooth follow', 'cinematic framing', 'screen shake'],
        lighting: ['ambient light', 'point lights', 'character glow'],
        particles: ['snow', 'ice particles', 'energy effects'],
        effects: ['fog', 'glow'],
        composition: ['dynamic', 'rule of thirds'],
        uiDirection: 'minimalist, glassmorphism, glowing accents',
        motionDirection: 'smooth, weighty, responsive'
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
        cameraResponse: ['slight vertical response on jump', 'shake on landing'],
        environmentalMovement: ['parallax layers']
      }`
  );
  fs.writeFileSync('src/agents/gameSpecAgent.ts', content);
}
