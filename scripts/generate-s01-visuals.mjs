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
import { teachingMermaidConfiguration } from './teaching-mermaid-config.mjs';

const root = resolve(import.meta.dirname, '..');
const diagramsOnly = process.argv.includes('--diagrams-only');
const browser = await puppeteer.launch({ headless: 'shell' });
try {
  const { configuration } = createMermaidConfiguration();
  for (const language of ['en', 'fr']) {
    for (const name of ['evolution', 'learning', 'offline', 'rag']) {
      const stem = resolve(root, 'teaching/visuals/s01', language, name);
      await run(`${stem}.mmd`, `${stem}.svg`, {
        browser,
        quiet: true,
        parseMMDOptions: {
          mermaidConfig: teachingMermaidConfiguration(configuration),
          backgroundColor: '#F3F3F3',
        },
      });
      await writeFile(
        `${stem}.svg`,
        normalizeMermaidSvgForOffice(await readFile(`${stem}.svg`, 'utf8'), `${language}-${name}`),
      );
    }
    for (const name of diagramsOnly ? [] : ['alert', 'prompt']) {
      const html = await readFile(
        resolve(root, 'teaching/visuals/s01', language, `${name}.html`),
        'utf8',
      );
      const page = await browser.newPage();
      await page.setViewport({ width: 860, height: 820, deviceScaleFactor: 1 });
      await page.setContent(html);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      if (height > 820)
        throw new Error(`${language}/${name} screen exceeds its 820px canvas: ${height}px`);
      await page.screenshot({
        path: resolve(root, 'teaching/visuals/s01', language, `${name}.png`),
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
