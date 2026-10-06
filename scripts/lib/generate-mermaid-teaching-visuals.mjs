import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import { run } from '../../packages/presentations/node_modules/@mermaid-js/mermaid-cli/src/index.js';
import puppeteer from '../../packages/presentations/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {
  createMermaidConfiguration,
  normalizeMermaidSvgForOffice,
} from '../../packages/presentations/src/index.ts';
import { teachingMermaidConfiguration } from '../teaching-mermaid-config.mjs';

const languages = ['en', 'fr'];

export async function generateMermaidTeachingVisuals({
  sessionId,
  diagrams,
  checkSources = false,
}) {
  const root = resolve(import.meta.dirname, '../..');
  const visualRoot = resolve(root, 'teaching/visuals', sessionId);
  const sources = [];

  for (const language of languages) {
    for (const name of diagrams) {
      const stem = resolve(visualRoot, language, name);
      const source = await readFile(`${stem}.mmd`, 'utf8');

      if (!source.startsWith('flowchart ') || source.length < 90) {
        throw new Error(`Invalid ${sessionId.toUpperCase()} diagram source: ${language}/${name}.`);
      }

      sources.push({ language, name, stem });
    }
  }

  if (checkSources) {
    process.stdout.write(
      `PASS ${sessionId.toUpperCase()} sources: ${sources.length} Mermaid assets across two languages.\n`,
    );
    return;
  }

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
          `${sessionId}-${source.language}-${source.name}`,
        ),
      );

      process.stdout.write(`WROTE ${sessionId.toUpperCase()} ${source.language}/${source.name}\n`);
    }
  } finally {
    await browser.close();
  }
}
