import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import type { PdfPageRenderManifest, PdfRenderedPageRecord } from './render-pdf-pages.js';

export interface PdfContactSheetOptions {
  repositoryRoot: string;
  outputRoot: string;
  documentId: string;
  columns?: number;
  pagesPerSheet?: number;
  thumbnailWidth?: number;
}

export interface PdfContactSheetRecord {
  firstPage: number;
  lastPage: number;
  pages: number[];
  width: number;
  height: number;
  bytes: number;
  pngSha256: string;
  pngPath: string;
}

export interface PdfContactSheetManifest {
  schemaVersion: 1;
  documentId: string;
  pdfPath: string;
  pdfSha256: string;
  pageRenderDpi: number;
  pages: number;
  sheets: PdfContactSheetRecord[];
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PDF contact-sheet artifact must be inside the repository: ${absolutePath}`);
  }

  return value;
}

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  return result;
}

function validatePages(manifest: PdfPageRenderManifest): void {
  if (manifest.pages.length !== manifest.pageCount) {
    throw new Error(
      `Expected ${manifest.pageCount} rendered PDF pages; found ${manifest.pages.length}.`,
    );
  }

  for (let index = 0; index < manifest.pages.length; index += 1) {
    const expected = index + 1;

    const actual = manifest.pages[index]?.pageNumber;

    if (actual !== expected) {
      throw new Error(
        `Rendered PDF pages are not contiguous: expected page ${expected}, found ${String(actual)}.`,
      );
    }
  }
}

export async function createPdfContactSheets(
  pageManifest: PdfPageRenderManifest,
  options: PdfContactSheetOptions,
): Promise<PdfContactSheetManifest> {
  validatePages(pageManifest);

  const repositoryRoot = resolve(options.repositoryRoot);

  const outputRoot = resolve(options.outputRoot);

  repositoryRelativePath(repositoryRoot, outputRoot);

  const columns = options.columns ?? 2;

  const pagesPerSheet = options.pagesPerSheet ?? 10;

  const thumbnailWidth = options.thumbnailWidth ?? 520;

  if (
    !Number.isInteger(columns) ||
    columns <= 0 ||
    !Number.isInteger(pagesPerSheet) ||
    pagesPerSheet <= 0 ||
    !Number.isInteger(thumbnailWidth) ||
    thumbnailWidth <= 0
  ) {
    throw new Error('Invalid PDF contact-sheet layout options.');
  }

  await rm(outputRoot, {
    recursive: true,
    force: true,
  });

  await mkdir(outputRoot, {
    recursive: true,
  });

  const margin = 40;
  const gap = 32;
  const labelHeight = 38;

  const sheets: PdfContactSheetRecord[] = [];

  for (const group of chunks(pageManifest.pages, pagesPerSheet)) {
    const loaded = await Promise.all(
      group.map(async (page: PdfRenderedPageRecord) => {
        const path = resolve(repositoryRoot, page.pngPath);

        const bytes = await readFile(path);

        if (sha256(bytes) !== page.pngSha256) {
          throw new Error(`Rendered PDF page checksum mismatch: ${page.pngPath}`);
        }

        const image = await loadImage(path);

        const scale = thumbnailWidth / image.width;

        return {
          page,
          image,
          thumbnailHeight: Math.round(image.height * scale),
        };
      }),
    );

    const maxThumbnailHeight = Math.max(...loaded.map((entry) => entry.thumbnailHeight));

    const rows = Math.ceil(loaded.length / columns);

    const width = margin * 2 + columns * thumbnailWidth + (columns - 1) * gap;

    const height = margin * 2 + rows * (labelHeight + maxThumbnailHeight) + (rows - 1) * gap;

    const canvas = createCanvas(width, height);

    try {
      const context = canvas.getContext('2d');

      context.fillStyle = '#ffffff';

      context.fillRect(0, 0, width, height);

      context.font = '24px sans-serif';

      context.textBaseline = 'middle';

      for (let index = 0; index < loaded.length; index += 1) {
        const entry = loaded[index];

        if (!entry) {
          continue;
        }

        const column = index % columns;

        const row = Math.floor(index / columns);

        const x = margin + column * (thumbnailWidth + gap);

        const y = margin + row * (labelHeight + maxThumbnailHeight + gap);

        context.fillStyle = '#111111';

        context.fillText(
          [options.documentId, `Page ${entry.page.pageNumber}`].join(' - '),
          x,
          y + labelHeight / 2,
        );

        const imageY = y + labelHeight;

        context.fillStyle = '#d0d0d0';

        context.fillRect(x - 1, imageY - 1, thumbnailWidth + 2, entry.thumbnailHeight + 2);

        context.drawImage(entry.image, x, imageY, thumbnailWidth, entry.thumbnailHeight);
      }

      const first = group[0];

      const last = group.at(-1);

      if (!first || !last) {
        throw new Error('Unexpected empty PDF contact-sheet group.');
      }

      const filename = [
        options.documentId,
        `pages-${String(first.pageNumber).padStart(3, '0')}-${String(last.pageNumber).padStart(
          3,
          '0',
        )}.png`,
      ].join('.');

      const target = resolve(outputRoot, filename);

      const png = await canvas.encode('png');

      await writeFile(target, png);

      sheets.push({
        firstPage: first.pageNumber,
        lastPage: last.pageNumber,
        pages: group.map((page) => page.pageNumber),
        width: canvas.width,
        height: canvas.height,
        bytes: png.byteLength,
        pngSha256: sha256(png),
        pngPath: repositoryRelativePath(repositoryRoot, target),
      });
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  return {
    schemaVersion: 1,
    documentId: options.documentId,
    pdfPath: pageManifest.pdfPath,
    pdfSha256: pageManifest.pdfSha256,
    pageRenderDpi: pageManifest.dpi,
    pages: pageManifest.pageCount,
    sheets,
  };
}

export function serializePdfContactSheetManifest(manifest: PdfContactSheetManifest): string {
  return canonicalJson(manifest);
}
