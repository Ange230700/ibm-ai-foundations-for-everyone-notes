import process from 'node:process';

import { generateTeachingVisuals } from './lib/generate-teaching-visuals.mjs';

await generateTeachingVisuals({
  sessionId: 's01',
  diagrams: ['evolution', 'learning', 'offline', 'rag'],
  screens: ['alert', 'prompt'],
  diagramsOnly: process.argv.includes('--diagrams-only'),
  checkSources: process.argv.includes('--check-sources'),
  screenCss: false,
  screenWidth: 860,
  screenHeight: 820,
  requireSimulationLabel: false,
  mermaidIdentityPrefix: '',
});
