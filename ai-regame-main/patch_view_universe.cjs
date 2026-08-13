const fs = require('fs');
let code = fs.readFileSync('src/components/PlayView.tsx', 'utf8');

const replacement = `    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'NEXUS_EVENT') {
        console.log('[NEXUS EVENT]', e.data.eventType, e.data.payload);
        
        if (e.data.eventType === 'VIEW_UNIVERSE') {
            setShowUniverse(true);
            return;
        }
        
        if (session) {`;

code = code.replace(`    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'NEXUS_EVENT') {
        console.log('[NEXUS EVENT]', e.data.eventType, e.data.payload);
        if (session) {`, replacement);

fs.writeFileSync('src/components/PlayView.tsx', code);
console.log("PlayView VIEW_UNIVERSE patched.");
