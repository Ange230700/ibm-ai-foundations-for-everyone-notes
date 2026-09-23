import { mkdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import { deckSpecSha256 } from '../deck/identity.js';
import type { DeckSpec, SlideSpec } from '../deck/model.js';
import { DEFAULT_NATIVE_PPTX_THEME, nativePptxThemeSha256, type NativePptxTheme } from './theme.js';
import {
  resolveNativePptxDiagramAssets,
  type NativePptxDiagramAsset,
  type ResolvedNativePptxDiagramAsset,
} from './resources.js';

export const PPTX_RENDERER_VERSION = 4;

const SLIDE = {
  width: (7.5 / 9) * 16,
  height: 7.5,
  left: 0.72,
  right: 0.72,
  footerTop: 6.92,
} as const;

const SUPPORTED_SLIDE_KINDS = new Set<SlideSpec['kind']>([
  'title',
  'objectives',
  'overview',
  'concepts',
  'diagram',
  'table',
  'code',
  'summary',
]);

function estimatedWrappedLines(value: string, charactersPerLine: number): number {
  return value.split(/\r?\n/u).reduce((total, line) => {
    const normalized = line.replace(/\s+/gu, ' ').trim();

    return total + Math.max(1, Math.ceil(normalized.length / charactersPerLine));
  }, 0);
}

function proportionalHeights(
  weights: readonly number[],
  availableHeight: number,
  minimumHeight: number,
): number[] {
  if (weights.length === 0) {
    return [];
  }

  const minimumTotal = minimumHeight * weights.length;

  if (minimumTotal >= availableHeight) {
    return weights.map(() => availableHeight / weights.length);
  }

  const normalizedWeights = weights.map((weight) => Math.max(1, weight));
  const totalWeight = normalizedWeights.reduce((total, weight) => total + weight, 0);
  const flexibleHeight = availableHeight - minimumTotal;

  return normalizedWeights.map((weight) => minimumHeight + flexibleHeight * (weight / totalWeight));
}

function listFontSize(itemCount: number, visualLines: number): number {
  if (itemCount <= 4 && visualLines <= 6) return 21;
  if (itemCount <= 6 && visualLines <= 9) return 18;
  return 16;
}

function tableBodyFontSize(
  rowCount: number,
  columnCount: number,
  maximumVisualLines: number,
): number {
  if (rowCount <= 6 && columnCount <= 4 && maximumVisualLines <= 2) return 15;
  if (rowCount <= 8 && maximumVisualLines <= 3) return 13;
  return 11;
}

function tableRowVisualLines(row: readonly string[], columnCount: number): number {
  const charactersPerLine = Math.max(16, Math.floor(105 / Math.max(1, columnCount)));

  return Math.max(1, ...row.map((cell) => estimatedWrappedLines(cell, charactersPerLine)));
}

function tableRowFillColor(rowIndex: number, theme: NativePptxTheme): string {
  if (rowIndex === 0) return theme.colors.accent;
  if (rowIndex % 2 === 1) return theme.colors.surface;
  return theme.colors.canvas;
}

const MAX_NATIVE_CODE_LINE_LENGTH = 96;

function codeFontSize(lineCount: number, longestLine: number): number {
  let verticalSize = 11;

  if (lineCount <= 12) {
    verticalSize = 15;
  } else if (lineCount <= 20) {
    verticalSize = 13;
  }

  let horizontalSize = 11;

  if (longestLine <= 72) {
    horizontalSize = 15;
  } else if (longestLine <= 88) {
    horizontalSize = 13;
  }

  return Math.min(verticalSize, horizontalSize);
}

function wrapCodeLine(line: string, maximumLength: number): string[] {
  if (line.length <= maximumLength || !line.trim()) {
    return [line];
  }

  const indentation = line.match(/^\s*/u)?.[0] ?? '';
  const words = line.trim().split(/\s+/u);
  const wrapped: string[] = [];
  let current = indentation;

  for (const word of words) {
    const separator = current.trim() ? ' ' : '';
    const candidate = `${current}${separator}${word}`;

    if (candidate.length <= maximumLength || !current.trim()) {
      current = candidate;
      continue;
    }

    wrapped.push(current);
    current = `${indentation}${word}`;
  }

  wrapped.push(current);
  return wrapped;
}

export function wrapCodeForNativePptx(value: string): string {
  return value
    .split(/\r?\n/u)
    .flatMap((line) => wrapCodeLine(line, MAX_NATIVE_CODE_LINE_LENGTH))
    .join('\n');
}

export interface RenderNativePptxOptions {
  repositoryRoot: string;
  outputPath: string;
  theme?: NativePptxTheme;
  author?: string;
  company?: string;
  diagramAssets?: readonly NativePptxDiagramAsset[];
}

export interface NativePptxArtifactRecord {
  schemaVersion: 1;
  deckId: string;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
  deckSpecSha256: string;
  themeId: string;
  themeSha256: string;
  brandAssets: {
    logo: NativePptxBrandAssetRecord;
    symbol: NativePptxBrandAssetRecord;
  };
  renderInputSha256: string;
  renderer: {
    name: 'pptxgenjs';
    version: string;
    rendererVersion: number;
  };
  pptxPath: string;
  pptxSha256: string;
  bytes: number;
  slides: number;
}

type PptxGenJSConstructor = typeof import('pptxgenjs').default;

type PptxGenJSInstance = InstanceType<PptxGenJSConstructor>;

type PptxSlide = ReturnType<PptxGenJSInstance['addSlide']>;

type PptxTableRows = Parameters<PptxSlide['addTable']>[0];

const PRESENTATIONS_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const PRESENTATIONS_PACKAGE_PREFIX = 'packages/presentations/';

interface NativePptxBrandAssetRecord {
  path: string;
  sha256: string;
}

interface ResolvedNativePptxBrandAsset extends NativePptxBrandAssetRecord {
  absolutePath: string;
}

interface ResolvedNativePptxBrand {
  logo: ResolvedNativePptxBrandAsset;
  symbol: ResolvedNativePptxBrandAsset;
}

function unwrapDefaultExport(value: unknown): unknown {
  let current = value;

  for (let depth = 0; depth < 3; depth += 1) {
    if (current === null || typeof current !== 'object' || !('default' in current)) {
      break;
    }

    current = (
      current as {
        default?: unknown;
      }
    ).default;
  }

  return current;
}

async function loadPptxGenJS(): Promise<PptxGenJSConstructor> {
  const module = await import('pptxgenjs');

  const candidate = unwrapDefaultExport(module);

  if (typeof candidate !== 'function') {
    throw new TypeError('pptxgenjs did not expose a constructible runtime export.');
  }

  return candidate as PptxGenJSConstructor;
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PPTX artifact must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

async function resolveBrandAsset(
  repositoryRoot: string,
  relativePath: string,
  label: string,
): Promise<ResolvedNativePptxBrandAsset> {
  const path = toPosixPath(relativePath);
  const repositoryPath = resolve(repositoryRoot, path);

  repositoryRelativePath(repositoryRoot, repositoryPath);

  const candidates = [repositoryPath];

  if (path.startsWith(PRESENTATIONS_PACKAGE_PREFIX)) {
    const packagePath = resolve(
      PRESENTATIONS_PACKAGE_ROOT,
      path.slice(PRESENTATIONS_PACKAGE_PREFIX.length),
    );

    repositoryRelativePath(PRESENTATIONS_PACKAGE_ROOT, packagePath);
    candidates.push(packagePath);
  }

  let absolutePath: string | undefined;
  let bytes: Buffer | undefined;

  for (const candidate of candidates) {
    try {
      bytes = await readFile(candidate);
      absolutePath = candidate;
      break;
    } catch (error) {
      if (
        error === null ||
        typeof error !== 'object' ||
        !('code' in error) ||
        error.code !== 'ENOENT'
      ) {
        throw error;
      }
    }
  }

  if (!absolutePath || !bytes) {
    throw new Error(`KRAAK ${label} asset was not found: ${path}`);
  }

  if (
    bytes.byteLength < 8 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    throw new Error(`KRAAK ${label} must be a valid PNG asset: ${path}`);
  }

  return {
    absolutePath,
    path,
    sha256: sha256(bytes),
  };
}

async function resolveNativePptxBrand(
  repositoryRoot: string,
  theme: NativePptxTheme,
): Promise<ResolvedNativePptxBrand> {
  const [logo, symbol] = await Promise.all([
    resolveBrandAsset(repositoryRoot, theme.brand.logoPath, 'logo'),
    resolveBrandAsset(repositoryRoot, theme.brand.symbolPath, 'symbol'),
  ]);

  return {
    logo,
    symbol,
  };
}

function sourceNotes(slide: SlideSpec): string {
  return [
    '[Sources]',
    ...slide.sourceRefs.map((source) => {
      const heading = source.headingPath.join(' > ');

      return [
        '- ',
        source.path,
        ':',
        source.startLine,
        '-',
        source.endLine,
        heading ? ` — ${heading}` : '',
      ].join('');
    }),
    '[/Sources]',
  ].join('\n');
}

function prepareSlide(slide: PptxSlide, theme: NativePptxTheme): void {
  slide.background = {
    color: theme.colors.canvas,
  };
}

function addFooter(
  slide: PptxSlide,
  spec: DeckSpec,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  slide.addShape('line', {
    x: SLIDE.left,
    y: SLIDE.footerTop,
    w: SLIDE.width - SLIDE.left - SLIDE.right,
    h: 0,
    line: {
      color: theme.colors.border,
      width: 0.75,
    },
  });

  slide.addImage({
    path: brand.symbol.absolutePath,
    x: SLIDE.left,
    y: 7.01,
    w: 0.23,
    h: 0.23,
  });

  slide.addText(theme.brand.footerText, {
    x: SLIDE.left + 0.35,
    y: 7.02,
    w: 3.2,
    h: 0.22,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 9,
    bold: true,
    color: theme.colors.muted,
  });

  slide.addText(spec.deckId, {
    x: 4.2,
    y: 7.02,
    w: 5,
    h: 0.22,
    margin: 0,
    align: 'center',
    fontFace: theme.fonts.body,
    fontSize: 9,
    color: theme.colors.muted,
  });

  slide.addText(String(pageNumber).padStart(2, '0'), {
    x: 11.8,
    y: 7.02,
    w: 0.8,
    h: 0.22,
    margin: 0,
    align: 'right',
    fontFace: theme.fonts.body,
    fontSize: 9,
    bold: true,
    color: theme.colors.muted,
  });
}

function addSlideTitle(slide: PptxSlide, title: string, theme: NativePptxTheme): void {
  slide.addText(title, {
    x: SLIDE.left,
    y: 0.48,
    w: 11.9,
    h: 0.78,
    margin: 0,
    fontFace: theme.fonts.heading,
    fontSize: 28,
    bold: true,
    color: theme.colors.ink,
    fit: 'shrink',
    valign: 'middle',
  });
}

function finishSlide(
  slide: PptxSlide,
  spec: DeckSpec,
  slideSpec: SlideSpec,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  addFooter(slide, spec, pageNumber, theme, brand);

  slide.addNotes(sourceNotes(slideSpec));
}

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

function containFrame(frame: Frame, aspectRatio: number, padding = 0.24): Frame {
  const available: Frame = {
    x: frame.x + padding,
    y: frame.y + padding,
    w: frame.w - padding * 2,
    h: frame.h - padding * 2,
  };

  const frameRatio = available.w / available.h;

  if (aspectRatio >= frameRatio) {
    const height = available.w / aspectRatio;

    return {
      x: available.x,
      y: available.y + (available.h - height) / 2,
      w: available.w,
      h: height,
    };
  }

  const width = available.h * aspectRatio;

  return {
    x: available.x + (available.w - width) / 2,
    y: available.y,
    w: width,
    h: available.h,
  };
}

function renderTitle(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'title' }>,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  slide.addText(slideSpec.subtitle, {
    x: SLIDE.left,
    y: 0.75,
    w: 8.45,
    h: 0.4,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 16,
    bold: true,
    color: theme.colors.accent,
    fit: 'shrink',
  });

  slide.addImage({
    path: brand.logo.absolutePath,
    x: 9.7,
    y: 0.34,
    w: 2.95,
    h: 0.99,
  });

  slide.addShape('rect', {
    x: SLIDE.left,
    y: 1.55,
    w: 1.1,
    h: 0.06,
    fill: {
      color: theme.colors.accent,
    },
    line: {
      color: theme.colors.accent,
      transparency: 100,
    },
  });

  slide.addText(slideSpec.title, {
    x: SLIDE.left,
    y: 2.05,
    w: 11.45,
    h: 3.65,
    margin: 0,
    fontFace: theme.fonts.heading,
    fontSize: 38,
    bold: true,
    color: theme.colors.ink,
    fit: 'shrink',
    valign: 'middle',
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

function renderListSlide(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<
    SlideSpec,
    {
      kind: 'objectives' | 'overview' | 'summary';
    }
  >,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  if (slideSpec.items.length === 0) {
    throw new Error(`${slideSpec.slideId} has no list items.`);
  }

  if (slideSpec.items.length > 8) {
    throw new Error(
      `${slideSpec.slideId} has ${slideSpec.items.length} items; the core native layout supports at most 8.`,
    );
  }

  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  addSlideTitle(slide, slideSpec.title, theme);

  if (slideSpec.kind === 'objectives' && slideSpec.leadIn) {
    slide.addText(slideSpec.leadIn, {
      x: SLIDE.left,
      y: 1.32,
      w: 11.9,
      h: 0.38,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.muted,
      fit: 'shrink',
    });
  }

  const top = slideSpec.kind === 'objectives' && slideSpec.leadIn ? 1.86 : 1.55;

  const gap = 0.11;
  const availableHeight = 6.55 - top - gap * (slideSpec.items.length - 1);
  const initialWeights = slideSpec.items.map((item) => estimatedWrappedLines(item, 88));
  const visualLines = initialWeights.reduce((total, weight) => total + weight, 0);
  const fontSize = listFontSize(slideSpec.items.length, visualLines);
  const charactersPerLine = fontSize >= 21 ? 78 : fontSize >= 18 ? 90 : 102;
  const rowWeights = slideSpec.items.map((item) => estimatedWrappedLines(item, charactersPerLine));
  const rowHeights = proportionalHeights(rowWeights, availableHeight, 0.46);
  let y = top;

  slideSpec.items.forEach((item, index) => {
    const rowHeight = rowHeights[index] ?? availableHeight / slideSpec.items.length;

    slide.addShape('rect', {
      x: SLIDE.left,
      y,
      w: 0.68,
      h: rowHeight,
      fill: {
        color: theme.colors.surface,
      },
      line: {
        color: theme.colors.border,
        width: 0.75,
      },
    });

    slide.addText(String(index + 1).padStart(2, '0'), {
      x: SLIDE.left + 0.08,
      y: y + 0.05,
      w: 0.52,
      h: rowHeight - 0.1,
      margin: 0,
      align: 'center',
      valign: 'middle',
      fontFace: theme.fonts.body,
      fontSize: 13,
      bold: true,
      color: theme.colors.accent,
    });

    slide.addText(item, {
      x: SLIDE.left + 0.88,
      y: y + 0.05,
      w: 10.95,
      h: rowHeight - 0.1,
      margin: 0,
      valign: 'middle',
      fontFace: theme.fonts.body,
      fontSize,
      color: theme.colors.ink,
      fit: 'shrink',
    });

    y += rowHeight + gap;
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

function renderConcepts(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'concepts' }>,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  if (slideSpec.concepts.length === 0 || slideSpec.concepts.length > 3) {
    throw new Error(
      `${slideSpec.slideId} must contain 1 to 3 concepts for the core native layout.`,
    );
  }

  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  addSlideTitle(slide, slideSpec.title, theme);

  const gap = 0.28;

  const usableWidth = SLIDE.width - SLIDE.left - SLIDE.right;

  const cardWidth =
    (usableWidth - gap * (slideSpec.concepts.length - 1)) / slideSpec.concepts.length;

  slideSpec.concepts.forEach((concept, index) => {
    const x = SLIDE.left + index * (cardWidth + gap);
    const contentWidth = cardWidth - 0.52;
    const titleFontSize = slideSpec.concepts.length === 3 ? 18 : 20;
    const bodyFontSize = slideSpec.concepts.length === 3 ? 15 : 16;
    const titleCharactersPerLine = Math.max(22, Math.floor(contentWidth * 9));
    const bodyCharactersPerLine = Math.max(28, Math.floor(contentWidth * 12));
    const titleLines = estimatedWrappedLines(concept.title, titleCharactersPerLine);
    const bodyLines = estimatedWrappedLines(concept.explanation, bodyCharactersPerLine);
    const titleHeight = Math.min(1.5, Math.max(0.64, titleLines * 0.34));
    const bodyTop = 2.32 + titleHeight + 0.13;
    const bodyHeight = Math.max(0.8, 6.12 - bodyTop);

    slide.addShape('rect', {
      x,
      y: 1.62,
      w: cardWidth,
      h: 4.82,
      fill: {
        color: theme.colors.surface,
      },
      line: {
        color: theme.colors.border,
        width: 0.75,
      },
    });

    slide.addText(String(index + 1).padStart(2, '0'), {
      x: x + 0.26,
      y: 1.9,
      w: cardWidth - 0.52,
      h: 0.28,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: 12,
      bold: true,
      color: theme.colors.accent,
    });

    slide.addText(concept.title, {
      x: x + 0.26,
      y: 2.32,
      w: contentWidth,
      h: titleHeight,
      margin: 0,
      fontFace: theme.fonts.heading,
      fontSize: titleFontSize,
      bold: true,
      color: theme.colors.ink,
      fit: 'shrink',
    });

    slide.addText(concept.explanation, {
      x: x + 0.26,
      y: bodyTop,
      w: contentWidth,
      h: bodyHeight,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: bodyLines > 8 ? 14 : bodyFontSize,
      color: theme.colors.muted,
      fit: 'shrink',
    });
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

function renderDiagram(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'diagram' }>,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
  assets: Map<string, ResolvedNativePptxDiagramAsset>,
): void {
  const asset = assets.get(slideSpec.diagramId);

  if (!asset) {
    throw new Error(`Missing resolved diagram asset for ${slideSpec.diagramId}.`);
  }

  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  addSlideTitle(slide, slideSpec.title, theme);

  const wide = asset.aspectRatio >= 1.9;

  if (wide) {
    const frame: Frame = {
      x: SLIDE.left,
      y: 1.55,
      w: 11.9,
      h: 3.65,
    };

    slide.addShape('rect', {
      ...frame,
      fill: {
        color: theme.colors.surface,
      },
      line: {
        color: theme.colors.border,
        width: 0.75,
      },
    });

    const image = containFrame(frame, asset.aspectRatio);

    slide.addImage({
      path: asset.absolutePath,
      ...image,
    });

    slide.addText(slideSpec.explanation, {
      x: SLIDE.left,
      y: 5.46,
      w: 11.9,
      h: 0.92,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: 16,
      color: theme.colors.muted,
      fit: 'shrink',
      valign: 'middle',
    });
  } else {
    slide.addText(slideSpec.explanation, {
      x: SLIDE.left,
      y: 1.72,
      w: 3.45,
      h: 4.55,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: 18,
      color: theme.colors.muted,
      fit: 'shrink',
      valign: 'middle',
    });

    const frame: Frame = {
      x: 4.48,
      y: 1.55,
      w: 8.13,
      h: 4.85,
    };

    slide.addShape('rect', {
      ...frame,
      fill: {
        color: theme.colors.surface,
      },
      line: {
        color: theme.colors.border,
        width: 0.75,
      },
    });

    const image = containFrame(frame, asset.aspectRatio);

    slide.addImage({
      path: asset.absolutePath,
      ...image,
    });
  }

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

function renderTable(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'table' }>,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  const columnCount = slideSpec.headers.length;

  const rowCount = slideSpec.rows.length + 1;

  if (columnCount === 0) {
    throw new Error(`${slideSpec.slideId} has no table columns.`);
  }

  if (columnCount > 6) {
    throw new Error(
      `${slideSpec.slideId} has ${columnCount} columns; the native table layout currently supports at most 6.`,
    );
  }

  if (rowCount > 11) {
    throw new Error(
      `${slideSpec.slideId} has ${rowCount} rows including the header; the native table layout currently supports at most 11.`,
    );
  }

  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  addSlideTitle(slide, slideSpec.title, theme);

  slide.addText(slideSpec.explanation, {
    x: SLIDE.left,
    y: 1.35,
    w: 11.9,
    h: 0.48,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.muted,
    fit: 'shrink',
  });

  const values = [slideSpec.headers, ...slideSpec.rows];
  const rowWeights = values.map((row, index) => {
    const visualLines = tableRowVisualLines(row, columnCount);

    return index === 0 ? Math.max(1.25, visualLines) : visualLines;
  });
  const maximumVisualLines = Math.max(...rowWeights);
  const bodyFontSize = tableBodyFontSize(rowCount, columnCount, maximumVisualLines);

  const tableRows: PptxTableRows = values.map((row, rowIndex) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontFace: theme.fonts.body,
        fontSize: rowIndex === 0 ? bodyFontSize + 1 : bodyFontSize,
        bold: rowIndex === 0,
        color: rowIndex === 0 ? theme.colors.inverse : theme.colors.ink,
        fill: {
          color: tableRowFillColor(rowIndex, theme),
        },
        valign: 'middle',
        margin: [0.05, 0.07, 0.05, 0.07],
      },
    })),
  );

  const usableWidth = SLIDE.width - SLIDE.left - SLIDE.right;

  const rowHeights = proportionalHeights(rowWeights, 4.45, 0.34);

  slide.addTable(tableRows, {
    x: SLIDE.left,
    y: 2.02,
    w: usableWidth,
    colW: Array.from(
      {
        length: columnCount,
      },
      () => usableWidth / columnCount,
    ),
    rowH: rowHeights,
    border: {
      type: 'solid',
      color: theme.colors.border,
      pt: 0.75,
    },
    margin: 0,
    autoPage: false,
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

function renderCode(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'code' }>,
  pageNumber: number,
  theme: NativePptxTheme,
  brand: ResolvedNativePptxBrand,
): void {
  const displayCode = wrapCodeForNativePptx(slideSpec.code);
  const lines = displayCode.split(/\r?\n/u);

  if (lines.length > 28) {
    throw new Error(
      `${slideSpec.slideId} contains ${lines.length} visual code lines after wrapping; the native code layout currently supports at most 28.`,
    );
  }

  const longestLine = Math.max(0, ...lines.map((line) => line.length));

  if (longestLine > 110) {
    throw new Error(
      `${slideSpec.slideId} contains an unbreakable code segment ${longestLine} characters long; split or simplify it before native rendering.`,
    );
  }

  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  addSlideTitle(slide, slideSpec.title, theme);

  slide.addText(slideSpec.explanation, {
    x: SLIDE.left,
    y: 1.72,
    w: 3.35,
    h: 4.5,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 17,
    color: theme.colors.muted,
    fit: 'shrink',
    valign: 'middle',
  });

  slide.addShape('rect', {
    x: 4.35,
    y: 1.55,
    w: 8.26,
    h: 4.86,
    fill: {
      color: theme.colors.surface,
    },
    line: {
      color: theme.colors.border,
      width: 0.75,
    },
  });

  slide.addShape('rect', {
    x: 4.35,
    y: 1.55,
    w: 0.06,
    h: 4.86,
    fill: {
      color: theme.colors.accent,
    },
    line: {
      color: theme.colors.accent,
      transparency: 100,
    },
  });

  slide.addText(slideSpec.language.toUpperCase(), {
    x: 4.67,
    y: 1.82,
    w: 7.5,
    h: 0.3,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 11,
    bold: true,
    color: theme.colors.accent,
  });

  const fontSize = codeFontSize(lines.length, longestLine);

  slide.addText(displayCode, {
    x: 4.67,
    y: 2.25,
    w: 7.55,
    h: 3.76,
    margin: 0,
    fontFace: theme.fonts.mono,
    fontSize,
    color: theme.colors.ink,
    fit: 'shrink',
    breakLine: false,
    valign: 'top',
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme, brand);
}

export function validatePptxBytes(bytes: Uint8Array, label: string): void {
  if (bytes.byteLength < 4096) {
    throw new Error(`PPTX is unexpectedly small: ${label}`);
  }

  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    throw new Error(`PPTX is not an OOXML ZIP package: ${label}`);
  }
}

export async function renderNativePptx(
  spec: DeckSpec,
  options: RenderNativePptxOptions,
): Promise<NativePptxArtifactRecord> {
  const repositoryRoot = resolve(options.repositoryRoot);

  const outputPath = resolve(options.outputPath);

  const relativeOutputPath = repositoryRelativePath(repositoryRoot, outputPath);

  const theme = options.theme ?? DEFAULT_NATIVE_PPTX_THEME;

  if (theme.id !== spec.themeId) {
    throw new Error(`Deck theme ${spec.themeId} does not match renderer theme ${theme.id}.`);
  }

  const brand = await resolveNativePptxBrand(repositoryRoot, theme);

  const diagramAssets = await resolveNativePptxDiagramAssets(
    repositoryRoot,
    spec,
    options.diagramAssets ?? [],
  );

  const unsupported = spec.slides.filter((slide) => !SUPPORTED_SLIDE_KINDS.has(slide.kind));

  if (unsupported.length > 0) {
    throw new Error(
      [
        'Phase 3B1 renderer does not yet support:',
        ...unsupported.map((slide) => `${slide.slideId}:${slide.kind}`),
      ].join(' '),
    );
  }

  const author = options.author ?? theme.brand.name;

  const company = options.company ?? theme.brand.name;

  const PptxGenJS = await loadPptxGenJS();

  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE';

  pptx.author = author;
  pptx.company = company;
  pptx.subject = spec.purpose;
  pptx.title = spec.title;
  pptx.revision = '1';
  (pptx as PptxGenJSInstance & { lang: string }).lang = spec.language === 'fr' ? 'fr-FR' : 'en-US';

  pptx.theme = {
    headFontFace: theme.fonts.heading,
    bodyFontFace: theme.fonts.body,
  };

  for (let index = 0; index < spec.slides.length; index += 1) {
    const slideSpec = spec.slides[index];

    if (!slideSpec) {
      continue;
    }

    const pageNumber = index + 1;

    switch (slideSpec.kind) {
      case 'title':
        renderTitle(pptx, spec, slideSpec, pageNumber, theme, brand);
        break;

      case 'objectives':
      case 'overview':
      case 'summary':
        renderListSlide(pptx, spec, slideSpec, pageNumber, theme, brand);
        break;

      case 'concepts':
        renderConcepts(pptx, spec, slideSpec, pageNumber, theme, brand);
        break;

      case 'diagram':
        renderDiagram(pptx, spec, slideSpec, pageNumber, theme, brand, diagramAssets);
        break;

      case 'table':
        renderTable(pptx, spec, slideSpec, pageNumber, theme, brand);
        break;

      case 'code':
        renderCode(pptx, spec, slideSpec, pageNumber, theme, brand);
        break;
    }
  }

  await mkdir(dirname(outputPath), {
    recursive: true,
  });

  const specSha256 = deckSpecSha256(spec);

  const themeSha256 = nativePptxThemeSha256(theme);

  const diagramIdentity = spec.slides
    .filter((slide) => slide.kind === 'diagram')
    .map((slide) => {
      const asset = diagramAssets.get(slide.diagramId);

      if (!asset) {
        throw new Error(`Missing resolved diagram identity for ${slide.diagramId}.`);
      }

      return {
        diagramId: slide.diagramId,
        svgSha256: asset.svgSha256,
      };
    });

  const renderInputSha256 = sha256(
    canonicalJson({
      rendererVersion: PPTX_RENDERER_VERSION,
      pptxgenjsVersion: pptx.version,
      deckSpecSha256: specSha256,
      themeSha256,
      brandAssets: {
        logo: {
          path: brand.logo.path,
          sha256: brand.logo.sha256,
        },
        symbol: {
          path: brand.symbol.path,
          sha256: brand.symbol.sha256,
        },
      },
      diagramAssets: diagramIdentity,
      metadata: {
        author,
        company,
      },
    }),
  );

  await pptx.writeFile({
    fileName: outputPath,
  });

  const bytes = await readFile(outputPath);

  validatePptxBytes(bytes, relativeOutputPath);

  return {
    schemaVersion: 1,
    deckId: spec.deckId,
    courseId: spec.courseId,
    moduleId: spec.moduleId,
    language: spec.language,
    sourcePath: spec.sourcePath,
    sourceSha256: spec.sourceSha256,
    moduleContentSha256: spec.moduleContentSha256,
    deckSpecSha256: specSha256,
    themeId: theme.id,
    themeSha256,
    brandAssets: {
      logo: {
        path: brand.logo.path,
        sha256: brand.logo.sha256,
      },
      symbol: {
        path: brand.symbol.path,
        sha256: brand.symbol.sha256,
      },
    },
    renderInputSha256,
    renderer: {
      name: 'pptxgenjs',
      version: pptx.version,
      rendererVersion: PPTX_RENDERER_VERSION,
    },
    pptxPath: relativeOutputPath,
    pptxSha256: sha256(bytes),
    bytes: bytes.byteLength,
    slides: spec.slides.length,
  };
}

export function serializeNativePptxArtifactRecord(record: NativePptxArtifactRecord): string {
  return canonicalJson(record);
}
