import { createRequire } from 'node:module';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

import { run as runMermaid } from '@mermaid-js/mermaid-cli';
import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';
import puppeteer, { type Browser } from 'puppeteer';

import type { MermaidDiagram, ModuleContent, SourceRef } from '../content/model.js';
import { createMermaidConfiguration, type MermaidThemeTokens } from './config.js';
import {
  MERMAID_CLI_ARGUMENTS,
  MERMAID_RENDERER_VERSION,
  mermaidRenderIdentity,
} from './render-identity.js';
import { canonicalMermaidSource } from './source.js';
import { normalizeMermaidSvgForOffice } from './office-svg.js';

export interface MermaidRendererContext {
  cliVersion: string;
  configuration: Record<string, unknown>;
  configurationSha256: string;
}

export interface MermaidRenderOptions {
  repositoryRoot: string;
  outputRoot: string;
  theme?: MermaidThemeTokens;
}

export interface MermaidRenderedAssetRecord {
  diagramId: string;
  source: SourceRef;
  definitionSha256: string;
  renderHash: string;
  svgSha256: string;
  svgPath: string;
  pngSha256: string;
  pngPath: string;
}

export interface MermaidRenderManifest {
  schemaVersion: 1;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  moduleContentSha256: string;
  renderer: {
    name: '@mermaid-js/mermaid-cli';
    cliVersion: string;
    rendererVersion: number;
    configurationSha256: string;
  };
  assets: MermaidRenderedAssetRecord[];
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`Mermaid output must be inside the repository: ${absolutePath}`);
  }

  return value;
}

async function mermaidCliVersion(): Promise<string> {
  const require = createRequire(import.meta.url);
  const entrypoint = require.resolve('@mermaid-js/mermaid-cli');

  const packagePath = resolve(dirname(entrypoint), '..', 'package.json');

  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
    version?: unknown;
  };

  if (typeof packageJson.version !== 'string') {
    throw new TypeError('Cannot determine @mermaid-js/mermaid-cli version.');
  }

  return packageJson.version;
}

export async function loadMermaidRendererContext(
  theme?: MermaidThemeTokens,
): Promise<MermaidRendererContext> {
  const { configuration, configurationSha256 } = createMermaidConfiguration(theme);

  return {
    cliVersion: await mermaidCliVersion(),
    configuration,
    configurationSha256,
  };
}

export function validateMermaidSvg(svg: string, diagramId = '<unknown>'): void {
  const forbidden = [
    {
      pattern: /<script\b/i,
      label: 'script element',
    },
    {
      pattern: /<foreignObject\b/i,
      label: 'foreignObject element',
    },
    {
      pattern: /(?:href|src)=["'](?:https?:|file:)/i,
      label: 'external reference',
    },
  ];

  for (const rule of forbidden) {
    if (rule.pattern.test(svg)) {
      throw new Error(`Rendered SVG for ${diagramId} contains a forbidden ${rule.label}.`);
    }
  }

  if (!/<svg\b/i.test(svg)) {
    throw new Error(`Rendered asset for ${diagramId} is not SVG.`);
  }
}

export function validateMermaidPng(png: Uint8Array, diagramId = '<unknown>'): void {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];

  if (!signature.every((value, index) => png[index] === value)) {
    throw new Error(`Rendered fallback for ${diagramId} is not PNG.`);
  }
}

async function cachedAsset(
  diagram: MermaidDiagram,
  renderHash: string,
  repositoryRoot: string,
  outputRoot: string,
): Promise<MermaidRenderedAssetRecord | null> {
  const svgPath = join(outputRoot, `${renderHash}.svg`);

  const pngPath = join(outputRoot, `${renderHash}.png`);

  try {
    const [svg, svgChecksum, png, pngChecksum] = await Promise.all([
      readFile(svgPath, 'utf8'),
      readFile(`${svgPath}.sha256`, 'utf8'),
      readFile(pngPath),
      readFile(`${pngPath}.sha256`, 'utf8'),
    ]);

    validateMermaidSvg(svg, diagram.diagramId);
    validateMermaidPng(png, diagram.diagramId);

    const svgSha256 = sha256(svg);
    const pngSha256 = sha256(png);

    if (svgChecksum.trim() !== svgSha256 || pngChecksum.trim() !== pngSha256) {
      return null;
    }

    return {
      diagramId: diagram.diagramId,
      source: diagram.source,
      definitionSha256: diagram.definitionSha256,
      renderHash,
      svgSha256,
      svgPath: repositoryRelativePath(repositoryRoot, svgPath),
      pngSha256,
      pngPath: repositoryRelativePath(repositoryRoot, pngPath),
    };
  } catch {
    return null;
  }
}

async function renderDiagram(
  diagram: MermaidDiagram,
  context: MermaidRendererContext,
  repositoryRoot: string,
  outputRoot: string,
  browser: Browser,
): Promise<MermaidRenderedAssetRecord> {
  const { effectiveConfiguration, renderHash } = mermaidRenderIdentity(diagram, context);

  const cached = await cachedAsset(diagram, renderHash, repositoryRoot, outputRoot);

  if (cached) {
    return cached;
  }

  const svgPath = join(outputRoot, `${renderHash}.svg`);

  const pngPath = join(outputRoot, `${renderHash}.png`);

  const temporaryStem = join(
    outputRoot,
    `.${renderHash}.${process.pid}.${Date.now().toString(36)}`,
  );

  const inputPath = `${temporaryStem}.mmd`;
  const temporarySvgPath = `${temporaryStem}.svg` as `${string}.svg`;

  const temporaryPngPath = `${temporaryStem}.png` as `${string}.png`;

  await writeFile(inputPath, canonicalMermaidSource(diagram.definition), 'utf8');

  try {
    const common = {
      browser,
      quiet: true,
      parseMMDOptions: {
        mermaidConfig: effectiveConfiguration,
        backgroundColor: MERMAID_CLI_ARGUMENTS.backgroundColor,
        svgId: `mermaid-${renderHash.slice(0, 16)}`,
      },
    };

    await runMermaid(inputPath, temporarySvgPath, common);

    await runMermaid(inputPath, temporaryPngPath, {
      ...common,
      parseMMDOptions: {
        ...common.parseMMDOptions,
        viewport: {
          width: 800,
          height: 600,
          deviceScaleFactor: MERMAID_CLI_ARGUMENTS.fallbackPngScale,
        },
      },
    });

    const [rawSvg, png] = await Promise.all([
      readFile(temporarySvgPath, 'utf8'),
      readFile(temporaryPngPath),
    ]);

    const svg = normalizeMermaidSvgForOffice(rawSvg, diagram.diagramId);

    validateMermaidSvg(svg, diagram.diagramId);

    validateMermaidPng(png, diagram.diagramId);

    const svgSha256 = sha256(svg);
    const pngSha256 = sha256(png);

    await Promise.all([
      writeFile(temporarySvgPath, svg, 'utf8'),
      writeFile(`${temporarySvgPath}.sha256`, `${svgSha256}\n`, 'utf8'),
      writeFile(`${temporaryPngPath}.sha256`, `${pngSha256}\n`, 'utf8'),
    ]);

    await Promise.all([
      rename(temporarySvgPath, svgPath),
      rename(`${temporarySvgPath}.sha256`, `${svgPath}.sha256`),
      rename(temporaryPngPath, pngPath),
      rename(`${temporaryPngPath}.sha256`, `${pngPath}.sha256`),
    ]);

    return {
      diagramId: diagram.diagramId,
      source: diagram.source,
      definitionSha256: diagram.definitionSha256,
      renderHash,
      svgSha256,
      svgPath: repositoryRelativePath(repositoryRoot, svgPath),
      pngSha256,
      pngPath: repositoryRelativePath(repositoryRoot, pngPath),
    };
  } finally {
    await Promise.all([
      rm(inputPath, {
        force: true,
      }),
      rm(temporarySvgPath, {
        force: true,
      }),
      rm(`${temporarySvgPath}.sha256`, {
        force: true,
      }),
      rm(temporaryPngPath, {
        force: true,
      }),
      rm(`${temporaryPngPath}.sha256`, {
        force: true,
      }),
    ]);
  }
}

export async function renderModuleMermaidAssets(
  content: ModuleContent,
  options: MermaidRenderOptions,
): Promise<MermaidRenderManifest> {
  const repositoryRoot = resolve(options.repositoryRoot);

  const outputRoot = resolve(options.outputRoot);

  repositoryRelativePath(repositoryRoot, outputRoot);

  await mkdir(outputRoot, {
    recursive: true,
  });

  const context = await loadMermaidRendererContext(options.theme);

  const assets: MermaidRenderedAssetRecord[] = [];

  if (content.diagrams.length > 0) {
    const browser = await puppeteer.launch({
      headless: 'shell',
    });

    try {
      for (const diagram of content.diagrams) {
        assets.push(await renderDiagram(diagram, context, repositoryRoot, outputRoot, browser));
      }
    } finally {
      await browser.close();
    }
  }

  return {
    schemaVersion: 1,
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    sourcePath: content.sourcePath,
    moduleContentSha256: content.moduleContentSha256,
    renderer: {
      name: '@mermaid-js/mermaid-cli',
      cliVersion: context.cliVersion,
      rendererVersion: MERMAID_RENDERER_VERSION,
      configurationSha256: context.configurationSha256,
    },
    assets,
  };
}

export function serializeMermaidRenderManifest(manifest: MermaidRenderManifest): string {
  return canonicalJson(manifest);
}
