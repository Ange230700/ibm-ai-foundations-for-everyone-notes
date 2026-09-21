import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { createCanvas } from '@napi-rs/canvas';
import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import { NapiCanvasFactory } from './pdf-canvas.js';
import { validatePdfBytes } from './render-pdf.js';

export interface RenderPdfPagesOptions {
  repositoryRoot: string;
  pdfPath: string;
  outputRoot: string;
  dpi?: number;
}

export interface PdfRenderedPageRecord {
  pageNumber: number;
  width: number;
  height: number;
  bytes: number;
  pngSha256: string;
  pngPath: string;
}

export interface PdfPageRenderManifest {
  schemaVersion: 1;
  pdfPath: string;
  pdfSha256: string;
  dpi: number;
  pageCount: number;
  pages: PdfRenderedPageRecord[];
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PDF visual-QA artifact must be inside the repository: ${absolutePath}`);
  }

  return value;
}

function validatePng(bytes: Uint8Array, label: string): void {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];

  if (!signature.every((value, index) => bytes[index] === value)) {
    throw new Error(`Rendered PDF page is not PNG: ${label}`);
  }
}

export async function renderPdfPages(
  options: RenderPdfPagesOptions,
): Promise<PdfPageRenderManifest> {
  const repositoryRoot = resolve(options.repositoryRoot);

  const pdfPath = resolve(options.pdfPath);

  const outputRoot = resolve(options.outputRoot);

  const relativePdfPath = repositoryRelativePath(repositoryRoot, pdfPath);

  repositoryRelativePath(repositoryRoot, outputRoot);

  const dpi = options.dpi ?? 200;

  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new Error(`Invalid PDF render DPI: ${dpi}`);
  }

  const buffer = await readFile(pdfPath);

  validatePdfBytes(buffer, relativePdfPath);

  const pdfSha256 = sha256(buffer);

  await rm(outputRoot, {
    recursive: true,
    force: true,
  });

  await mkdir(outputRoot, {
    recursive: true,
  });

  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const loadingTask = getDocument({
    data: new Uint8Array(buffer).slice(),
    useSystemFonts: true,
    CanvasFactory: NapiCanvasFactory as never,
  });

  const pdf = await loadingTask.promise;

  const scale = dpi / 72;

  const pages: PdfRenderedPageRecord[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({
        scale,
      });

      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));

      try {
        const renderTask = page.render({
          canvas: canvas as never,
          viewport,
          intent: 'display',
        });

        await renderTask.promise;

        const png = await canvas.encode('png');

        const filename = `page-${String(pageNumber).padStart(3, '0')}.png`;

        const target = resolve(outputRoot, filename);

        validatePng(png, filename);

        await writeFile(target, png);

        pages.push({
          pageNumber,
          width: canvas.width,
          height: canvas.height,
          bytes: png.byteLength,
          pngSha256: sha256(png),
          pngPath: repositoryRelativePath(repositoryRoot, target),
        });
      } finally {
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  } finally {
    await loadingTask.destroy();
  }

  return {
    schemaVersion: 1,
    pdfPath: relativePdfPath,
    pdfSha256,
    dpi,
    pageCount: pdf.numPages,
    pages,
  };
}

export function serializePdfPageRenderManifest(manifest: PdfPageRenderManifest): string {
  return canonicalJson(manifest);
}
