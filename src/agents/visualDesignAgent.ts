import { ComprehensiveGameSpec } from '../types/nexusSpec.js';

export interface CharacterVisualDef {
  type: string;
  parts: Array<{
    shape: 'rect' | 'circle' | 'polygon' | 'arc' | 'capsule';
    color: string;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    points?: Array<{x: number, y: number}>;
  }>;
  glow?: string;
}

export interface TerrainStyleDef {
  platformColor: string;
  platformTopColor: string;
  wallColor: string;
  decorationStyle: 'tech' | 'nature' | 'ruins' | 'minimal' | 'ice';
}

export interface VisualGameSpecification {
  sceneStyle: string;
  terrainStyle: TerrainStyleDef;
  playerVisual: CharacterVisualDef;
  enemyVisuals: CharacterVisualDef[];
  particleEffects: string[];
  colorPalette: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface VisualExperienceSpecification {
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    terrain: string;
    vehicleBody: string;
    vehicleTrim: string;
    glowingAccents: string;
    hudText: string;
  };
  environment: {
    atmosphereType: "nebula" | "grid" | "aurora" | "synthwave";
    parallaxLayersCount: number;
    skyEffects: {
      stars: boolean;
      nebulaClouds: boolean;
      fallingMeteorChance: number;
    };
    groundStyle: {
      pattern: "isometric-grid" | "wireframe" | "solid-fill" | "layered-stripes";
      lineWidth: number;
      gridSpacing: number;
    };
    particleEffects: {
      type: "exhaust-smoke" | "tire-sparks" | "glow-trails";
      maxParticles: number;
      color: string;
    };
  };
}

export function generateVisualExperience(spec: ComprehensiveGameSpec): VisualExperienceSpecification {
  const theme = (spec.story.theme || '').toLowerCase();
  const setting = (spec.world.environmentType || '').toLowerCase();

  // Custom visual atmosphere builder based on the genre and theme
  if (theme.includes('cyberpunk') || setting.includes('neon') || setting.includes('cyber')) {
    return {
      colorPalette: {
        primary: "#d946ef", // Neon Magenta
        secondary: "#0ea5e9", // Neon Blue
        background: "#09090b", // Deep Void Black
        terrain: "#1e1b4b", // Dark Indigo
        vehicleBody: "#ec4899", // Vivid Pink
        vehicleTrim: "#2dd4bf", // Teal Accent
        glowingAccents: "#22c55e", // Bright Green Fuel
        hudText: "#38bdf8" // Tech cyan
      },
      environment: {
        atmosphereType: "synthwave",
        parallaxLayersCount: 4,
        skyEffects: {
          stars: true,
          nebulaClouds: false,
          fallingMeteorChance: 0.05
        },
        groundStyle: {
          pattern: "wireframe",
          lineWidth: 2,
          gridSpacing: 40
        },
        particleEffects: {
          type: "glow-trails",
          maxParticles: 120,
          color: "#d946ef"
        }
      }
    };
  }

  if (theme.includes('fantasy') || setting.includes('medieval') || theme.includes('magic')) {
    return {
      colorPalette: {
        primary: "#b45309", // Warm Amber
        secondary: "#78350f", // Rich Brown
        background: "#1c1917", // Warm Stone Black
        terrain: "#292524", // Slate Terrain
        vehicleBody: "#d97706", // Gold chassis
        vehicleTrim: "#fbbf24", // Yellow accents
        glowingAccents: "#38bdf8", // Glowing magic crystals
        hudText: "#fcd34d" // Golden HUD
      },
      environment: {
        atmosphereType: "aurora",
        parallaxLayersCount: 3,
        skyEffects: {
          stars: true,
          nebulaClouds: true,
          fallingMeteorChance: 0.01
        },
        groundStyle: {
          pattern: "layered-stripes",
          lineWidth: 1,
          gridSpacing: 30
        },
        particleEffects: {
          type: "exhaust-smoke",
          maxParticles: 80,
          color: "#f59e0b"
        }
      }
    };
  }

  // Sci-Fi / Outer Space default
  return {
    colorPalette: {
      primary: "#38bdf8", // Sky Blue
      secondary: "#1e293b", // Deep Slate
      background: "#020617", // Dark Cosmic Blue
      terrain: "#0f172a", // Dark Moon Terrain
      vehicleBody: "#e2e8f0", // Lunar Silver
      vehicleTrim: "#3b82f6", // Electric Blue Trim
      glowingAccents: "#f43f5e", // Solar Red Fuel
      hudText: "#38bdf8" // Tech blue
    },
    environment: {
      atmosphereType: "nebula",
      parallaxLayersCount: 5,
      skyEffects: {
        stars: true,
        nebulaClouds: true,
        fallingMeteorChance: 0.08
      },
      groundStyle: {
        pattern: "isometric-grid",
        lineWidth: 1,
        gridSpacing: 50
      },
      particleEffects: {
        type: "tire-sparks",
        maxParticles: 150,
        color: "#38bdf8"
      }
    }
  };
}

export function generateVisualSpecification(spec: ComprehensiveGameSpec): VisualGameSpecification {
  const theme = spec.story.theme.toLowerCase();
  const setting = spec.world.environmentType.toLowerCase();
  const playerRole = spec.character.protagonist.role.toLowerCase();
  
  // Default values
  let sceneStyle = 'minimal';
  let terrainStyle: TerrainStyleDef = {
    platformColor: '#374151',
    platformTopColor: '#4b5563',
    wallColor: '#1f2937',
    decorationStyle: 'minimal'
  };
  let palette = { background: '#111827', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f59e0b' };
  let particles = ['dust'];
  
  // Player composition
  let playerVisual: CharacterVisualDef = {
    type: 'player',
    parts: [
      { shape: 'rect', color: '#3b82f6', offsetX: 0, offsetY: 0, width: 30, height: 30 }
    ],
    glow: 'rgba(59, 130, 246, 0.5)'
  };

  // Thematic rules
  if (theme.includes('cyberpunk') || setting.includes('cyberpunk') || setting.includes('neon')) {
    sceneStyle = 'cyberpunk';
    palette = { background: '#09090b', primary: '#0ea5e9', secondary: '#d946ef', accent: '#eab308' };
    terrainStyle = { platformColor: '#1e1e24', platformTopColor: '#2dd4bf', wallColor: '#111', decorationStyle: 'tech' };
    particles = ['neon_rain', 'sparks'];
    
    if (playerRole.includes('driver') || spec.gameplay.primaryMechanics.join(' ').toLowerCase().includes('racing')) {
      playerVisual.parts = [
        { shape: 'polygon', color: palette.primary, offsetX: 0, offsetY: 0, width: 60, height: 30, points: [{x:0,y:30},{x:60,y:15},{x:0,y:0}] },
        { shape: 'circle', color: '#fff', offsetX: 45, offsetY: 15, width: 10, height: 10 }
      ];
    }
  } else if (theme.includes('fantasy') || setting.includes('castle') || setting.includes('medieval')) {
    sceneStyle = 'fantasy';
    palette = { background: '#1c1917', primary: '#b45309', secondary: '#431407', accent: '#fef08a' };
    terrainStyle = { platformColor: '#44403c', platformTopColor: '#78716c', wallColor: '#292524', decorationStyle: 'ruins' };
    particles = ['ember', 'dust'];
    
    playerVisual.parts = [
      { shape: 'rect', color: '#78716c', offsetX: 5, offsetY: 5, width: 20, height: 25 }, // body armor
      { shape: 'circle', color: '#d6d3d1', offsetX: 15, offsetY: 5, width: 14, height: 14 }, // helmet
      { shape: 'rect', color: '#b45309', offsetX: 20, offsetY: 15, width: 15, height: 4 } // sword
    ];
  } else if (theme.includes('sci-fi') || setting.includes('space') || setting.includes('europa') || setting.includes('ice')) {
    sceneStyle = 'space';
    palette = { background: '#020617', primary: '#e2e8f0', secondary: '#38bdf8', accent: '#3b82f6' };
    terrainStyle = { platformColor: '#1e293b', platformTopColor: '#e0f2fe', wallColor: '#0f172a', decorationStyle: 'ice' };
    particles = ['snow', 'fog'];
    
    playerVisual.parts = [
      { shape: 'rect', color: '#f8fafc', offsetX: 2, offsetY: 5, width: 26, height: 25 }, // spacesuit
      { shape: 'circle', color: '#38bdf8', offsetX: 15, offsetY: 8, width: 16, height: 16 }, // visor
      { shape: 'rect', color: '#94a3b8', offsetX: -4, offsetY: 8, width: 8, height: 18 } // backpack
    ];
  } else if (setting.includes('underwater') || theme.includes('ocean')) {
    sceneStyle = 'underwater';
    palette = { background: '#082f49', primary: '#06b6d4', secondary: '#0284c7', accent: '#67e8f9' };
    terrainStyle = { platformColor: '#164e63', platformTopColor: '#0e7490', wallColor: '#083344', decorationStyle: 'nature' };
    particles = ['bubbles', 'light_rays'];
    
    playerVisual.parts = [
      { shape: 'capsule', color: '#f59e0b', offsetX: 5, offsetY: 10, width: 20, height: 10 }, // submarine body
      { shape: 'circle', color: '#cffafe', offsetX: 15, offsetY: 10, width: 12, height: 12 } // window
    ];
  } else if (setting.includes('jungle') || theme.includes('nature')) {
    sceneStyle = 'jungle';
    palette = { background: '#14532d', primary: '#84cc16', secondary: '#4d7c0f', accent: '#fde047' };
    terrainStyle = { platformColor: '#3f6212', platformTopColor: '#a3e635', wallColor: '#14532d', decorationStyle: 'nature' };
    particles = ['leaves', 'mist'];
  }

  const enemyVisuals: CharacterVisualDef[] = spec.character.antagonistOrHazard?.name ? [
    {
      type: 'enemy',
      parts: [
        { shape: 'polygon', color: palette.secondary, offsetX: 0, offsetY: 0, width: 30, height: 30, points: [{x:15,y:0},{x:30,y:30},{x:0,y:30}] },
        { shape: 'circle', color: palette.accent, offsetX: 15, offsetY: 15, width: 6, height: 6 }
      ],
      glow: palette.secondary
    }
  ] : [];

  return {
    sceneStyle,
    terrainStyle,
    playerVisual,
    enemyVisuals,
    particleEffects: particles,
    colorPalette: palette
  };
}
