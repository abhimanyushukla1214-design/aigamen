const fs = require('fs');
let code = fs.readFileSync('src/components/StudioView.tsx', 'utf8');

code = code.replace(
  'interface StudioViewProps {\n  onBackToLanding: () => void;\n  onOpenDiagnostic: () => void;\n}',
  'interface StudioViewProps {\n  initialPrompt?: string;\n  onBackToLanding: () => void;\n  onOpenDiagnostic: () => void;\n}'
);

code = code.replace(
  'export const StudioView: React.FC<StudioViewProps> = ({ onBackToLanding }) => {',
  'export const StudioView: React.FC<StudioViewProps> = ({ initialPrompt = \'\', onBackToLanding }) => {'
);

code = code.replace(
  "const [prompt, setPrompt] = useState('');",
  "const [prompt, setPrompt] = useState(initialPrompt);"
);

fs.writeFileSync('src/components/StudioView.tsx', code);
