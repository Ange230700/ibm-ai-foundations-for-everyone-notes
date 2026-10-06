import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import { run } from '../packages/presentations/node_modules/@mermaid-js/mermaid-cli/src/index.js';
import puppeteer from '../packages/presentations/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {
  createMermaidConfiguration,
  normalizeMermaidSvgForOffice,
} from '../packages/presentations/src/index.ts';
import { teachingMermaidConfiguration } from './teaching-mermaid-config.mjs';

const root = resolve(import.meta.dirname, '..');
const visualRoot = resolve(root, 'teaching/visuals/s05');

const diagrams = [
  'workflow-canvas',
  'manual-vs-ai',
  'responsibility-model',
  'exception-path',
  'improvement-loop',
];

const sources = [];

for (const language of ['en', 'fr']) {
  for (const name of diagrams) {
    const stem = resolve(visualRoot, language, name);
    const source = await readFile(`${stem}.mmd`, 'utf8');

    if (!source.startsWith('flowchart ') || source.length < 90) {
      throw new Error(`Invalid S05 diagram source: ${language}/${name}.`);
    }

    sources.push({ language, name, stem });
  }
}

if (process.argv.includes('--check-sources')) {
  process.stdout.write(
    `PASS S05 sources: ${sources.length} Mermaid assets across two languages.\n`,
  );
} else {
  const browser = await puppeteer.launch({ headless: 'shell' });

  try {
    const { configuration } = createMermaidConfiguration();

    for (const source of sources) {
      await run(`${source.stem}.mmd`, `${source.stem}.svg`, {
        browser,
        quiet: true,
        parseMMDOptions: {
          mermaidConfig: teachingMermaidConfiguration(configuration),
          backgroundColor: '#F3F3F3',
        },
      });

      await writeFile(
        `${source.stem}.svg`,
        normalizeMermaidSvgForOffice(
          await readFile(`${source.stem}.svg`, 'utf8'),
          `s05-${source.language}-${source.name}`,
        ),
      );

      process.stdout.write(`WROTE S05 ${source.language}/${source.name}\n`);
    }
  } finally {
    await browser.close();
  }
}
