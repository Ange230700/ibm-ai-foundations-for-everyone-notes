import process from 'node:process';

import { generateMermaidTeachingVisuals } from './lib/generate-mermaid-teaching-visuals.mjs';

await generateMermaidTeachingVisuals({
  sessionId: 's05',
  diagrams: [
    'workflow-canvas',
    'manual-vs-ai',
    'responsibility-model',
    'exception-path',
    'improvement-loop',
  ],
  checkSources: process.argv.includes('--check-sources'),
});
