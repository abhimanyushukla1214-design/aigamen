const fs = require('fs');

const content = fs.readFileSync('src/services/geminiSchemas.ts', 'utf-8');

const newSchemas = `
export const animeVisualSpecificationSchema = {
  type: Type.OBJECT,
  properties: {
    visualStyle: { type: Type.ARRAY, items: { type: Type.STRING } },
    artDirection: { type: Type.STRING },
    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
    environment: {
      type: Type.OBJECT,
      properties: {
        background: { type: Type.ARRAY, items: { type: Type.STRING } },
        midground: { type: Type.ARRAY, items: { type: Type.STRING } },
        gameplay: { type: Type.ARRAY, items: { type: Type.STRING } },
        foreground: { type: Type.ARRAY, items: { type: Type.STRING } },
        atmosphere: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['background', 'midground', 'gameplay', 'foreground', 'atmosphere']
    },
    characterVisuals: {
      type: Type.OBJECT,
      properties: {
        proportions: { type: Type.STRING },
        clothing: { type: Type.ARRAY, items: { type: Type.STRING } },
        accessories: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['proportions', 'clothing', 'accessories']
    },
    animation: { type: Type.ARRAY, items: { type: Type.STRING } },
    camera: { type: Type.ARRAY, items: { type: Type.STRING } },
    lighting: { type: Type.ARRAY, items: { type: Type.STRING } },
    particles: { type: Type.ARRAY, items: { type: Type.STRING } },
    effects: { type: Type.ARRAY, items: { type: Type.STRING } },
    composition: { type: Type.ARRAY, items: { type: Type.STRING } },
    uiDirection: { type: Type.STRING },
    motionDirection: { type: Type.STRING }
  },
  required: ['visualStyle', 'artDirection', 'colorPalette', 'environment', 'characterVisuals', 'animation', 'camera', 'lighting', 'particles', 'effects', 'composition', 'uiDirection', 'motionDirection']
};

export const motionSpecificationSchema = {
  type: Type.OBJECT,
  properties: {
    acceleration: { type: Type.NUMBER },
    deceleration: { type: Type.NUMBER },
    maximumSpeed: { type: Type.NUMBER },
    jump: { type: Type.NUMBER },
    gravity: { type: Type.NUMBER },
    airControl: { type: Type.NUMBER },
    friction: { type: Type.NUMBER },
    dash: { type: Type.NUMBER },
    knockback: { type: Type.NUMBER },
    animationSpeed: { type: Type.NUMBER },
    cameraResponse: { type: Type.ARRAY, items: { type: Type.STRING } },
    environmentalMovement: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['acceleration', 'deceleration', 'maximumSpeed', 'jump', 'gravity', 'airControl', 'friction', 'dash', 'knockback', 'animationSpeed', 'cameraResponse', 'environmentalMovement']
};
`;

if (!content.includes('animeVisualSpecificationSchema')) {
    fs.writeFileSync('src/services/geminiSchemas.ts', content + '\n' + newSchemas);
}
