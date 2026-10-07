import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
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
