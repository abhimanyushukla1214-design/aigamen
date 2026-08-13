const fs = require('fs');
let code = fs.readFileSync('src/components/PlayView.tsx', 'utf-8');

// The replacement was: "{showExitConfirm && (" became endScreens + "\n        {showExitConfirm && ("
// I replaced AnimatePresence wrong or duplicated. Let's fix the duplicated blocks.
code = code.replace(/<AnimatePresence>\s*<AnimatePresence>/g, '<AnimatePresence>');
code = code.replace(/<\/AnimatePresence>\s*<\/AnimatePresence>/g, '</AnimatePresence>');
// Wait, I can just replace the weird duplicate AnimatePresence on line 261.
code = code.replace("<AnimatePresence>\n      \n      <AnimatePresence>", "<AnimatePresence>");

fs.writeFileSync('src/components/PlayView.tsx', code);
