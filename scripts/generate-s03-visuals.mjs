import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
  sessionId: 's03',
  diagrams: ['workflow', 'methods', 'steps', 'checks'],
  screens: ['prompt', 'examples', 'interview', 'wrong-output', 'revision'],
  diagramsOnly: process.argv.includes('--diagrams-only'),
  checkSources: process.argv.includes('--check-sources'),
});
