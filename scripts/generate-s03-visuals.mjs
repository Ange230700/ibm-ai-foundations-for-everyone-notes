import { readFile, writeFile } from 'node:fs/promises';
/* global document */
import { resolve } from 'node:path';
import process from 'node:process';
import { run } from '../packages/presentations/node_modules/@mermaid-js/mermaid-cli/src/index.js';
import puppeteer from '../packages/presentations/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {
  createMermaidConfiguration,
  normalizeMermaidSvgForOffice,
} from '../packages/presentations/src/index.ts';

const root = resolve(import.meta.dirname, '..');
const visualRoot = resolve(root, 'teaching/visuals/s03');
const diagrams = ['workflow', 'methods', 'steps', 'checks'];
const screens = ['prompt', 'examples', 'interview', 'wrong-output', 'revision'];
const css = await readFile(resolve(visualRoot, 'screen.css'), 'utf8');
const sources = [];

for (const language of ['en', 'fr']) {
  for (const name of diagrams) {
    const stem = resolve(visualRoot, language, name);
    const source = await readFile(`${stem}.mmd`, 'utf8');
    if (!source.startsWith('flowchart ') || source.length < 90) {
      throw new Error(`Invalid S03 diagram source: ${language}/${name}.`);
    }
    sources.push({ language, name, stem, kind: 'mermaid' });
  }
  for (const name of screens) {
    const stem = resolve(visualRoot, language, name);
    const html = await readFile(`${stem}.html`, 'utf8');
    const label = language === 'en' ? 'Teaching simulation' : 'Simulation pédagogique';
    if (!html.includes('/* SCREEN_CSS */') || !html.includes(label)) {
      throw new Error(`Unlabelled S03 simulation: ${language}/${name}.`);
    }
    sources.push({ language, name, stem, kind: 'simulation', html });
  }
}

if (process.argv.includes('--check-sources')) {
  process.stdout.write(`PASS S03 sources: ${sources.length} visual assets across two languages.\n`);
} else {
  const browser = await puppeteer.launch({ headless: 'shell' });
  try {
    const { configuration } = createMermaidConfiguration();
    for (const source of sources) {
      if (source.kind === 'mermaid') {
        await run(`${source.stem}.mmd`, `${source.stem}.svg`, {
          browser,
          quiet: true,
          parseMMDOptions: { mermaidConfig: configuration, backgroundColor: '#F3F3F3' },
        });
        await writeFile(
          `${source.stem}.svg`,
          normalizeMermaidSvgForOffice(
            await readFile(`${source.stem}.svg`, 'utf8'),
            `s03-${source.language}-${source.name}`,
          ),
        );
      } else {
        const page = await browser.newPage();
        try {
          await page.setViewport({ width: 860, height: 640, deviceScaleFactor: 1 });
          await page.setContent(source.html.replace('/* SCREEN_CSS */', css));
          const height = await page.evaluate(() =>
            Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
          );
          if (height > 640) {
            throw new Error(
              `S03 ${source.language}/${source.name} exceeds its 640px canvas: ${height}px`,
            );
          }
          await page.screenshot({ path: `${source.stem}.png` });
        } finally {
          await page.close();
        }
      }
      process.stdout.write(`WROTE S03 ${source.language}/${source.name}\n`);
    }
  } finally {
    await browser.close();
  }
}
