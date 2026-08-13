const fs = require('fs');
let code = fs.readFileSync('src/agents/gameSpecAgent.ts', 'utf-8');

const oldPalette = `colorPalette: ["#111111", "#444444", "#4ade80", "#3b82f6"],`;
const newPalette = `colorPalette: theme === 'cyberpunk' ? ["#0a0a2a", "#ff00ff", "#00ffff", "#222222"] : 
                       (theme === 'fantasy' ? ["#2c1e16", "#d4af37", "#8b0000", "#555555"] : 
                       (theme === 'sci-fi' ? ["#0f172a", "#38bdf8", "#e2e8f0", "#334155"] : 
                       ["#111111", "#444444", "#4ade80", "#3b82f6"])),`;

code = code.replace(oldPalette, newPalette);

const oldTitle = `title: plan.intent.summary.slice(0, 30) || "Generated Game",`;
const newTitle = `title: plan.originalPrompt ? plan.originalPrompt.slice(0, 30) + '...' : "Generated Game",`;
code = code.replace(oldTitle, newTitle);

fs.writeFileSync('src/agents/gameSpecAgent.ts', code);
