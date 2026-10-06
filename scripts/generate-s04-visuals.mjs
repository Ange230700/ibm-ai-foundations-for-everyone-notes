import process from 'node:process';

import { generateMermaidTeachingVisuals } from './lib/generate-mermaid-teaching-visuals.mjs';

await generateMermaidTeachingVisuals({
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
