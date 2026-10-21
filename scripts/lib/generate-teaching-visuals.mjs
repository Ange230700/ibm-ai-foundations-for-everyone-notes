/* global document */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  createMermaidConfiguration,
  normalizeMermaidSvgForOffice,
} from '../../packages/presentations/src/index.ts';
import { teachingMermaidConfiguration } from '../teaching-mermaid-config.mjs';

const LANGUAGES = ['en', 'fr'];
const SCREEN_CSS_MARKER = '/* SCREEN_CSS */';
const presentationsRequire = createRequire(
  resolve(import.meta.dirname, '../../packages/presentations/package.json'),
);
const mermaidCli = await import(
  pathToFileURL(presentationsRequire.resolve('@mermaid-js/mermaid-cli')).href
);
const puppeteerModule = await import(pathToFileURL(presentationsRequire.resolve('puppeteer')).href);
const { run } = mermaidCli;
const puppeteer = puppeteerModule.default;

async function collectDiagramSource(visualRoot, sessionId, language, name) {
  const stem = resolve(visualRoot, language, name);
  const source = await readFile(`${stem}.mmd`, 'utf8');
  if (!source.startsWith('flowchart ') || source.length < 90) {
    throw new Error(`Invalid ${sessionId.toUpperCase()} diagram source: ${language}/${name}.`);
  }
  return { kind: 'mermaid', language, name, stem };
}

async function collectScreenSource({
  visualRoot,
  sessionId,
  language,
  name,
  screenCss,
  requireSimulationLabel,
}) {
  const stem = resolve(visualRoot, language, name);
  let html = await readFile(`${stem}.html`, 'utf8');
  const titleStart = html.indexOf('<title>');
  const titleEnd = html.indexOf('</title>', titleStart + 7);
  if (titleStart < 0 || titleEnd < 0 || !html.slice(titleStart + 7, titleEnd).trim()) {
    throw new Error(`Missing title in ${sessionId.toUpperCase()} simulation: ${language}/${name}.`);
  }
  const stylesheets = [
    ...html.matchAll(/<link rel="stylesheet" href="(\.\.\/[^"/]+\.css)"\s*\/>/gu),
  ];
  const styles = await Promise.all(
    stylesheets.map(async (match) => ({
      tag: match[0],
      css: await readFile(resolve(dirname(stem), match[1]), 'utf8'),
    })),
  );
  for (const { tag, css } of styles) html = html.replace(tag, () => `<style>${css}</style>`);
  const label = language === 'en' ? 'Teaching simulation' : 'Simulation pédagogique';
  if (screenCss && !html.includes(SCREEN_CSS_MARKER)) {
    throw new Error(
      `Missing screen CSS marker in ${sessionId.toUpperCase()} simulation: ${language}/${name}.`,
    );
  }
  if (requireSimulationLabel && !html.includes(label)) {
    throw new Error(`Unlabelled ${sessionId.toUpperCase()} simulation: ${language}/${name}.`);
  }
  return { kind: 'simulation', language, name, stem, html };
}

async function collectSources({
  visualRoot,
  sessionId,
  diagrams,
  screens,
  diagramsOnly,
  screenCss,
  requireSimulationLabel,
}) {
  return Promise.all(
    LANGUAGES.flatMap((language) => [
      ...diagrams.map((name) => collectDiagramSource(visualRoot, sessionId, language, name)),
      ...(diagramsOnly ? [] : screens).map((name) =>
        collectScreenSource({
          visualRoot,
          sessionId,
          language,
          name,
          screenCss,
          requireSimulationLabel,
        }),
      ),
    ]),
  );
}

async function renderMermaid({ browser, configuration, mermaidIdentityPrefix, source }) {
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
      mermaidIdentityPrefix
        ? `${mermaidIdentityPrefix}-${source.language}-${source.name}`
        : `${source.language}-${source.name}`,
    ),
  );
}

async function renderSimulation({
  browser,
  css,
  sessionId,
  screenCss,
  screenWidth,
  screenHeight,
  source,
}) {
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: screenWidth,
      height: screenHeight,
      deviceScaleFactor: 1,
    });

    await page.setContent(screenCss ? source.html.replace(SCREEN_CSS_MARKER, css) : source.html);

    const height = await page.evaluate(() =>
      Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    );

    if (height > screenHeight) {
      throw new Error(
        `${sessionId.toUpperCase()} ${source.language}/${source.name} exceeds its ${screenHeight}px canvas: ${height}px`,
      );
    }

    await page.screenshot({
      path: `${source.stem}.png`,
    });
  } finally {
    await page.close();
  }
}

export async function generateTeachingVisuals({
  sessionId,
  diagrams,
  screens = [],
  diagramsOnly = false,
  checkSources = false,
  screenCss = true,
  screenWidth = 860,
  screenHeight = 640,
  screenHeights = {},
  requireSimulationLabel = true,
  mermaidIdentityPrefix = sessionId,
}) {
  const root = resolve(import.meta.dirname, '../..');
  const visualRoot = resolve(root, 'teaching/visuals', sessionId);

  const sources = await collectSources({
    visualRoot,
    sessionId,
    diagrams,
    screens,
    diagramsOnly,
    screenCss,
    requireSimulationLabel,
  });

  if (checkSources) {
    const assetLabel = screens.length === 0 ? 'Mermaid assets' : 'visual assets';

    process.stdout.write(
      `PASS ${sessionId.toUpperCase()} sources: ${sources.length} ${assetLabel} across two languages.\n`,
    );
    return;
  }

  const css =
    screenCss && screens.length > 0 && !diagramsOnly
      ? await readFile(resolve(visualRoot, 'screen.css'), 'utf8')
      : '';

  const browser = await puppeteer.launch({ headless: 'shell' });

  try {
    const { configuration } = createMermaidConfiguration();

    for (const source of sources) {
      if (source.kind === 'mermaid') {
        await renderMermaid({
          browser,
          configuration,
          mermaidIdentityPrefix,
          source,
        });
      } else {
        await renderSimulation({
          browser,
          css,
          sessionId,
          screenCss,
          screenWidth,
          screenHeight: screenHeights[source.name] ?? screenHeight,
          source,
        });
      }

      process.stdout.write(`WROTE ${sessionId.toUpperCase()} ${source.language}/${source.name}\n`);
    }
  } finally {
    await browser.close();
  }
}
