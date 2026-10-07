import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
  sessionId: 's04',
  diagrams: [
    'evidence-states',
    'source-grounded-method',
    'gap-vs-conflict',
    'statement-layers',
    'verification-loop',
  ],
  checkSources: process.argv.includes('--check-sources'),
});
