import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
  sessionId: 's02',
  diagrams: ['model-workflow', 'formats', 'review', 'agents'],
  screens: ['prompt', 'wrong-output', 'revised-output', 'poster', 'guide'],
  diagramsOnly: process.argv.includes('--diagrams-only'),
  checkSources: process.argv.includes('--check-sources'),
});
