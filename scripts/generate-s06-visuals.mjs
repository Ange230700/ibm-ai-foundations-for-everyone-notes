import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
  sessionId: 's06',
  diagrams: ['review-authority', 'decision-boundaries'],
  checkSources: process.argv.includes('--check-sources'),
});
