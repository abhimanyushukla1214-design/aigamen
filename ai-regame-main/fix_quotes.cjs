const fs = require('fs');
let code = fs.readFileSync('src/engine/template.ts', 'utf8');

const bad = `            window.emitEvent = function(type, payload) {
            window.parent.postMessage({ type: 'NEXUS_EVENT', eventType: type, payload: payload }, '*');
        };
    '        function initLevel() {',`;

const good = `    '        window.emitEvent = function(type, payload) {',
    '            window.parent.postMessage({ type: "NEXUS_EVENT", eventType: type, payload: payload }, "*");',
    '        };',
    '        function initLevel() {',`;

code = code.replace(bad, good);
fs.writeFileSync('src/engine/template.ts', code);
console.log("Fixed quotes.");
