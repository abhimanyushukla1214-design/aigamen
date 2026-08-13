const fs = require('fs');
let code = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf8');

const fallbackCode = `
    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const rawResult = JSON.parse(text);
    
    const spec: ComprehensiveGameSpec = {
      gameId: crypto.randomUUID(),
      ...rawResult
    };
    return spec;
  } catch (error) {
    console.error('Error generating game specification:', error);
    
    // Fallback if Gemini quota is exceeded or unavailable
    return {
      gameId: crypto.randomUUID(),
      title: plan.targetTitle || "Fallback Sandbox Game",
      world: {
        settingName: "Fallback Zone",
        environmentType: "Digital Void",
        atmosphere: "Silent",
        keyLocations: ["Start Area", "End Point"],
        loreBackground: "Generated as a fallback due to system unavailability."
      },
      story: {
        logline: "A hero journeys through a fallback dimension.",
        theme: "Perseverance",
        incitingIncident: "System error.",
        mainQuest: "Reach the goal.",
        narrativeTone: "Neutral"
      },
      character: {
        protagonist: {
          name: "Player 1",
          role: "Explorer",
          motivation: "Survive",
          abilities: ["Move", "Jump"]
        },
        antagonistOrHazard: {
          name: "Void",
          description: "Empty space."
        },
        keyNPCs: []
      },
      gameplay: {
        coreLoop: "Move from start to finish.",
        primaryMechanics: ["Platforming"],
        progressionSystem: "Linear",
        winCondition: "Reach the portal.",
        lossCondition: "Fall off screen or touch hazards.",
        controls: [{key: "WASD", action: "Move"}, {key: "Space", action: "Jump"}]
      },
      physics: {
        gravity: 9.8,
        movementSpeed: 5,
        jumpForce: 15,
        friction: 0.8,
        collisionType: "AABB",
        environmentalHazards: ["Pits"]
      },
      cinematography: {
        cameraPerspective: "2D_SIDE_SCROLLER",
        visualStyle: "Minimalist",
        colorPalette: ["#111111", "#444444", "#4ade80", "#3b82f6"],
        lightingMood: "Flat",
        uiStyle: "Minimalist"
      }
    };
  }
}
`;

code = code.replace(`    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const rawResult = JSON.parse(text);
    
    const spec: ComprehensiveGameSpec = {
      gameId: crypto.randomUUID(),
      ...rawResult
    };
    return spec;
  } catch (error) {
    console.error('Error generating game specification:', error);
    throw error;
  }
}`, fallbackCode);

fs.writeFileSync('src/agents/gameSpecAgent.ts', code);
console.log("Game Spec Agent patched.");
