import { ComprehensiveGameSpec } from '../types/nexusSpec.js';

export interface ContentDesignResult {
  spec: ComprehensiveGameSpec;
  logs: string[];
}

/**
 * Content Design Agent: Takes a validated Game Specification and enriches it
 * with deep mechanical and thematic content, catalog entries, and garage upgrades.
 */
export function enrichGameContent(spec: ComprehensiveGameSpec): ContentDesignResult {
  const logs: string[] = [];
  const themeLower = (spec.story.theme || '').toLowerCase();
  
  if (!spec.genreExtensions) {
    spec.genreExtensions = {};
  }

  // 1. Establish high-fidelity vehicle details
  const isDriving = (spec.character?.protagonist?.name || '').toLowerCase().includes('buggy') ||
                    (spec.character?.protagonist?.role || '').toLowerCase().includes('driver') ||
                    (spec.gameplay?.primaryMechanics || []).join(' ').toLowerCase().includes('racing') ||
                    (spec.gameplay?.coreLoop || '').toLowerCase().includes('race') ||
                    (spec.story?.logline || '').toLowerCase().includes('driving');

  if (isDriving) {
    logs.push("Content Design: Constructing themed vehicle rosters, power curves, and transmission metrics.");

    // Determine theme-specific names and stats
    if (themeLower.includes('cyberpunk') || themeLower.includes('neon')) {
      spec.genreExtensions.vehiclePhysics = {
        vehicleRoster: [
          { name: "Neon Katana (Interceptor)", weight: 850, power: 180, grip: 1.4, fuelCapacity: 100 },
          { name: "Zenith Drift-Buggy", weight: 950, power: 210, grip: 1.3, fuelCapacity: 110 },
          { name: "Chronos Heavy Rig", weight: 1600, power: 340, grip: 1.7, fuelCapacity: 140 }
        ],
        engine: { power: 195, maxSpeed: 160, acceleration: 18 },
        suspension: { strength: 22, damping: 7 },
        wheels: { radius: 24, friction: 0.8, grip: 1.5 },
        fuel: { capacity: 100, consumptionRate: 0.12 },
        brakePower: 40,
        airControl: 2.2
      };
    } else if (themeLower.includes('fantasy') || themeLower.includes('magic')) {
      spec.genreExtensions.vehiclePhysics = {
        vehicleRoster: [
          { name: "Chariot of Sol (Gilded)", weight: 1100, power: 140, grip: 1.2, fuelCapacity: 90 },
          { name: "Rune-Powered Juggernaut", weight: 1800, power: 290, grip: 1.5, fuelCapacity: 130 },
          { name: "Zephyr Windskiff", weight: 650, power: 110, grip: 1.0, fuelCapacity: 80 }
        ],
        engine: { power: 155, maxSpeed: 130, acceleration: 14 },
        suspension: { strength: 16, damping: 5 },
        wheels: { radius: 20, friction: 0.9, grip: 1.3 },
        fuel: { capacity: 90, consumptionRate: 0.10 },
        brakePower: 30,
        airControl: 1.6
      };
    } else {
      // Sci-Fi / Space default
      spec.genreExtensions.vehiclePhysics = {
        vehicleRoster: [
          { name: "Aphelion Rover (Light)", weight: 750, power: 150, grip: 1.25, fuelCapacity: 90 },
          { name: "Solar Wind Voyager (V2)", weight: 1200, power: 220, grip: 1.45, fuelCapacity: 110 },
          { name: "Titan Crusher (Heavy duty)", weight: 1900, power: 380, grip: 1.8, fuelCapacity: 150 }
        ],
        engine: { power: 175, maxSpeed: 145, acceleration: 16 },
        suspension: { strength: 20, damping: 6 },
        wheels: { radius: 26, friction: 0.85, grip: 1.4 },
        fuel: { capacity: 100, consumptionRate: 0.14 },
        brakePower: 35,
        airControl: 2.0
      };
    }

    // 2. Build deep store/garage upgrade systems
    logs.push("Content Design: Structuring active garage upgrade levels and vehicle unlocking matrices.");
    spec.genreExtensions.progressionSystem = {
      upgradeCategories: [
        { name: "Sub-Light Engine (Power)", effect: "Augments horsepower and slope climb torque (+15% speed)", levels: 5 },
        { name: "Mag-Fluid Coils (Suspension)", effect: "Improves kinetic landing damping (-25% vehicle shock)", levels: 5 },
        { name: "Gravity Tires (Grip)", effect: "Maximizes friction on extreme spline slopes (+20% static grip)", levels: 5 },
        { name: "Auxiliary Reserve Cell (Fuel)", effect: "Expands chassis tank size (+25L max capacity)", levels: 5 }
      ],
      unlockables: [
        { type: "vehicle", name: "Solar Wind Voyager (V2)", requirement: "Pass the 1,000m atmospheric line." },
        { type: "vehicle", name: "Titan Crusher (Heavy duty)", requirement: "Achieve a total cumulative score of 6,000." },
        { type: "environment", name: "Abyssal Rift Valley", requirement: "Perform 3 backflips in a single expedition." }
      ]
    };

    // 3. Define stunt trick configurations
    logs.push("Content Design: Instantiating specific rotational air tricks and multiplier metrics.");
    spec.genreExtensions.trickSystem = {
      tricks: [
        { name: "Backflip Spark", scoreValue: 500 },
        { name: "Frontflip Surge", scoreValue: 600 },
        { name: "Sling Jump (Long Air)", scoreValue: 150 },
        { name: "Traction Wheelie", scoreValue: 200 }
      ],
      comboRules: "Consecutive air flips multiply trick points linearly (x2, x3, x4) before applying back to the score."
    };

    // 4. Construct high-fidelity fuel resource system
    logs.push("Content Design: Integrating critical resource systems.");
    spec.genreExtensions.resourceSystems = {
      fuel: {
        name: "Antimatter Fuel Canister",
        capacity: 100,
        consumptionRate: 0.14,
        replenishMethod: "Collect floating canisters scattered dynamically across the steep crests."
      }
    };
  }

  logs.push("Content Design: Refinements applied successfully.");
  return {
    spec,
    logs
  };
}
