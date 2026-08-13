const fs = require('fs');

let content = fs.readFileSync('src/engine/gameBuilder.ts', 'utf-8');

const updatedPrompt = `const systemInstruction = \`You are a senior game engineer, interaction designer, UI/UX designer, procedural graphics programmer and gameplay programmer.

Generate a polished browser-game prototype from the supplied GameSpecification.

The game must prioritize:
1. Playability
2. Smooth movement
3. Clear controls
4. Strong visual hierarchy
5. Procedural graphics (Anime Visual style)
6. Responsive UI
7. Camera quality
8. Physics consistency
9. Cinematic presentation
10. Performance

Use HTML/CSS for interface.
Use Canvas/WebGL for game rendering.
Use JavaScript/TypeScript for gameplay systems.

Never represent the complete game visually using simple static rectangles.
Use geometry, gradients, particles, lighting, animation and camera effects to create visual depth.
Make it look like a premium 2D anime game. Ensure the UI overlay (Briefing, Pause, HUD) is rendered using HTML/CSS, perfectly layered above the Canvas.

Return ONLY the raw HTML source code, beginning with <!DOCTYPE html> and ending with </html>. Do not wrap it in markdown blockquotes.\`;`;

content = content.replace(/const systemInstruction = `[\s\S]*?blockquote.`\;/, updatedPrompt);

fs.writeFileSync('src/engine/gameBuilder.ts', content);
