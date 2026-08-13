import { orchestrateGameDirector } from './src/agents/gameDirector.js';
import { generateGameSpecification } from './src/agents/gameSpecAgent.js';
import { buildGame } from './src/engine/gameBuilder.js';

async function run(prompt: string, name: string) {
    console.log(`\n\n--- RUNNING TEST: ${name} ---`);
    console.log("PROMPT:", prompt);
    const plan = await orchestrateGameDirector(prompt, `req-${name}`);
    console.log("DIRECTOR INTENT:", plan.intent.genre, plan.intent.theme, plan.intent.cameraPerspective);
    const spec = await generateGameSpecification(plan);
    console.log("SPEC CAMERA:", spec.cinematography.cameraPerspective, "GRAVITY:", spec.physics.gravity, "COLOR:", spec.cinematography.colorPalette[0]);
    const game = await buildGame({ spec });
    console.log("GAME TYPE:", game.definition?.gameType);
    console.log("GAME HTML LENGTH:", game.html?.length);
    console.log("HAS ROAD:", game.definition?.entities.platforms.some(p => p.type === 'road'));
    console.log("HAS ENEMIES:", (game.definition?.entities.enemies?.length ?? 0) > 0);
    console.log("PLAYER SHAPE:", game.definition?.player.shape);
}

async function main() {
    await run("Create a fast cyberpunk motorcycle racing game through a neon city during heavy rain. The player should accelerate, brake, drift and use boost while avoiding traffic.", "TEST A");
    await run("Create a dark medieval fantasy dungeon adventure where a warrior explores ancient ruins, fights monsters, finds treasure and unlocks a sealed chamber.", "TEST B");
    await run("Create a peaceful exploration game on Europa where an astronaut searches an abandoned research station while snow and ice particles move through the environment.", "TEST C");
    await run("Create a classic platformer where you jump over pits.", "TEST D");
}

main().catch(console.error);
