import { mkdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import { deckSpecSha256 } from '../deck/identity.js';
import type { DeckSpec, SlideSpec } from '../deck/model.js';
import { DEFAULT_NATIVE_PPTX_THEME, nativePptxThemeSha256, type NativePptxTheme } from './theme.js';
import {
  resolveNativePptxDiagramAssets,
  type NativePptxDiagramAsset,
  type ResolvedNativePptxDiagramAsset,
} from './resources.js';

export const PPTX_RENDERER_VERSION = 2;

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

function listFontSize(itemCount: number): number {
  if (itemCount <= 4) return 21;
  if (itemCount <= 6) return 18;
  return 16;
}

function tableBodyFontSize(rowCount: number, columnCount: number): number {
  if (rowCount <= 6 && columnCount <= 4) return 15;
  if (rowCount <= 8) return 13;
  return 11;
}

function tableRowFillColor(rowIndex: number, theme: NativePptxTheme): string {
  if (rowIndex === 0) return theme.colors.accent;
  if (rowIndex % 2 === 1) return theme.colors.surface;
  return theme.colors.canvas;
}

function codeFontSize(lineCount: number): number {
  if (lineCount <= 12) return 15;
  if (lineCount <= 20) return 13;
  return 11;
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

  slide.addText(spec.deckId, {
    x: SLIDE.left,
    y: 7.02,
    w: 9.5,
    h: 0.22,
    margin: 0,
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
): void {
  addFooter(slide, spec, pageNumber, theme);

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
): void {
  const slide = pptx.addSlide();

  prepareSlide(slide, theme);

  slide.addText(slideSpec.subtitle, {
    x: SLIDE.left,
    y: 0.75,
    w: 8.8,
    h: 0.4,
    margin: 0,
    fontFace: theme.fonts.body,
    fontSize: 16,
    bold: true,
    color: theme.colors.accent,
    fit: 'shrink',
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

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
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

  const availableHeight = 6.55 - top;

  const gap = 0.11;

  const rowHeight = (availableHeight - gap * (slideSpec.items.length - 1)) / slideSpec.items.length;

  const fontSize = listFontSize(slideSpec.items.length);

  slideSpec.items.forEach((item, index) => {
    const y = top + index * (rowHeight + gap);

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
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
}

function renderConcepts(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'concepts' }>,
  pageNumber: number,
  theme: NativePptxTheme,
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
      w: cardWidth - 0.52,
      h: 1.08,
      margin: 0,
      fontFace: theme.fonts.heading,
      fontSize: 20,
      bold: true,
      color: theme.colors.ink,
      fit: 'shrink',
    });

    slide.addText(concept.explanation, {
      x: x + 0.26,
      y: 3.55,
      w: cardWidth - 0.52,
      h: 2.48,
      margin: 0,
      fontFace: theme.fonts.body,
      fontSize: 16,
      color: theme.colors.muted,
      fit: 'shrink',
    });
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
}

function renderDiagram(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'diagram' }>,
  pageNumber: number,
  theme: NativePptxTheme,
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

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
}

function renderTable(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'table' }>,
  pageNumber: number,
  theme: NativePptxTheme,
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

  const bodyFontSize = tableBodyFontSize(rowCount, columnCount);

  const values = [slideSpec.headers, ...slideSpec.rows];

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

  const rowHeight = Math.min(0.72, 4.45 / rowCount);

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
    rowH: Array.from(
      {
        length: rowCount,
      },
      () => rowHeight,
    ),
    border: {
      type: 'solid',
      color: theme.colors.border,
      pt: 0.75,
    },
    margin: 0,
    autoPage: false,
  });

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
}

function renderCode(
  pptx: PptxGenJSInstance,
  spec: DeckSpec,
  slideSpec: Extract<SlideSpec, { kind: 'code' }>,
  pageNumber: number,
  theme: NativePptxTheme,
): void {
  const lines = slideSpec.code.split(/\r?\n/u);

  if (lines.length > 28) {
    throw new Error(
      `${slideSpec.slideId} contains ${lines.length} code lines; the native code layout currently supports at most 28.`,
    );
  }

  const longestLine = Math.max(0, ...lines.map((line) => line.length));

  if (longestLine > 110) {
    throw new Error(
      `${slideSpec.slideId} contains a code line ${longestLine} characters long; split or simplify it before native rendering.`,
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

  const fontSize = codeFontSize(lines.length);

  slide.addText(slideSpec.code, {
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

  finishSlide(slide, spec, slideSpec, pageNumber, theme);
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

  const author = options.author ?? 'Coursera Program Notes';

  const company = options.company ?? 'Coursera Program Notes';

  const PptxGenJS = await loadPptxGenJS();

  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE';

  pptx.author = author;
  pptx.company = company;
  pptx.subject = spec.purpose;
  pptx.title = spec.title;
  pptx.revision = '1';

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
        renderTitle(pptx, spec, slideSpec, pageNumber, theme);
        break;

      case 'objectives':
      case 'overview':
      case 'summary':
        renderListSlide(pptx, spec, slideSpec, pageNumber, theme);
        break;

      case 'concepts':
        renderConcepts(pptx, spec, slideSpec, pageNumber, theme);
        break;

      case 'diagram':
        renderDiagram(pptx, spec, slideSpec, pageNumber, theme, diagramAssets);
        break;

      case 'table':
        renderTable(pptx, spec, slideSpec, pageNumber, theme);
        break;

      case 'code':
        renderCode(pptx, spec, slideSpec, pageNumber, theme);
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
