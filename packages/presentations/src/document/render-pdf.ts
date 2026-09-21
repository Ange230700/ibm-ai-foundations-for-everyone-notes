import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';
import puppeteer from 'puppeteer';

import type { ModuleContent } from '../content/model.js';
import type { MermaidThemeTokens } from '../mermaid/config.js';
import { renderModuleMermaidAssets, serializeMermaidRenderManifest } from '../mermaid/render.js';
import { prepareDocumentMermaidAssets, replaceMermaidFences } from './mermaid.js';
import { renderMarkdownDocument } from './render-markdown-document.js';
import { createDocumentStylesheet, type DocumentThemeTokens } from './stylesheet.js';

export const PDF_RENDERER_VERSION = 1;

export const PDF_RENDER_OPTIONS = {
  printBackground: true,
  preferCSSPageSize: true,
  waitForFonts: true,
  tagged: true,
} as const;

export interface RenderModulePdfOptions {
  repositoryRoot: string;
  outputPath: string;
  mermaidAssetRoot?: string;
  documentTheme?: DocumentThemeTokens;
  mermaidTheme?: MermaidThemeTokens;
}

export interface PdfArtifactRecord {
  schemaVersion: 1;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
  stylesheetSha256: string;
  htmlSha256: string;
  mermaidManifestSha256: string;
  renderInputSha256: string;
  pdfSha256: string;
  pdfPath: string;
  bytes: number;
  diagrams: number;
  renderer: {
    name: 'chromium-via-puppeteer';
    rendererVersion: number;
    browserVersion: string;
  };
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PDF artifact must be inside the repository: ${absolutePath}`);
  }

  return value;
}

function sourceBaseHref(repositoryRoot: string, sourcePath: string): string {
  const absoluteSource = resolve(repositoryRoot, ...sourcePath.split('/'));

  return pathToFileURL(dirname(absoluteSource) + sep).href;
}

export function validatePdfBytes(bytes: Uint8Array, label = '<unknown>'): void {
  if (bytes.byteLength <= 1024) {
    throw new Error(`Generated PDF is unexpectedly small: ${label}`);
  }

  const header = Buffer.from(bytes.subarray(0, 5)).toString('ascii');

  if (header !== '%PDF-') {
    throw new Error(`Generated file is not a PDF: ${label}`);
  }

  const tail = Buffer.from(bytes.subarray(Math.max(0, bytes.byteLength - 1024))).toString('latin1');

  if (!tail.includes('%%EOF')) {
    throw new Error(`Generated PDF is missing its EOF marker: ${label}`);
  }
}

export async function renderModulePdf(
  markdown: string,
  content: ModuleContent,
  options: RenderModulePdfOptions,
): Promise<PdfArtifactRecord> {
  if (sha256(markdown) !== content.sourceSha256) {
    throw new Error('Canonical Markdown does not match the supplied ModuleContent.');
  }

  const repositoryRoot = resolve(options.repositoryRoot);

  const outputPath = resolve(options.outputPath);

  repositoryRelativePath(repositoryRoot, outputPath);

  const mermaidAssetRoot = resolve(
    options.mermaidAssetRoot ??
      resolve(
        repositoryRoot,
        '.artifacts',
        'document-pdf',
        content.courseId,
        content.moduleId,
        content.language,
        'mermaid',
      ),
  );

  repositoryRelativePath(repositoryRoot, mermaidAssetRoot);

  await Promise.all([
    mkdir(dirname(outputPath), {
      recursive: true,
    }),
    mkdir(mermaidAssetRoot, {
      recursive: true,
    }),
  ]);

  const mermaidManifest = await renderModuleMermaidAssets(content, {
    repositoryRoot,
    outputRoot: mermaidAssetRoot,
    ...(options.mermaidTheme === undefined
      ? {}
      : {
          theme: options.mermaidTheme,
        }),
  });

  const renderedMermaid = await prepareDocumentMermaidAssets(
    content,
    mermaidManifest,
    repositoryRoot,
  );

  const preparedMarkdown = replaceMermaidFences(markdown, renderedMermaid, content.language);

  const { stylesheet, stylesheetSha256 } = createDocumentStylesheet(options.documentTheme);

  const html = renderMarkdownDocument(preparedMarkdown, {
    language: content.language,
    stylesheet,
    baseHref: sourceBaseHref(repositoryRoot, content.sourcePath),
  });

  const htmlSha256 = sha256(html);

  const mermaidManifestSha256 = sha256(serializeMermaidRenderManifest(mermaidManifest));

  const browser = await puppeteer.launch({
    headless: 'shell',
  });

  try {
    const browserVersion = await browser.version();

    const renderInputSha256 = sha256(
      canonicalJson({
        moduleContentSha256: content.moduleContentSha256,
        stylesheetSha256,
        htmlSha256,
        mermaidManifestSha256,
        renderer: {
          name: 'chromium-via-puppeteer',
          rendererVersion: PDF_RENDERER_VERSION,
          browserVersion,
        },
        pdfOptions: PDF_RENDER_OPTIONS,
      }),
    );

    const page = await browser.newPage();

    try {
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        const url = request.url();

        if (/^https?:/iu.test(url)) {
          void request.abort();
          return;
        }

        void request.continue();
      });

      await page.emulateMediaType('print');

      await page.setContent(html, {
        waitUntil: 'load',
      });

      const imageFailures = await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.src),
      );

      if (imageFailures.length > 0) {
        throw new Error(['Failed PDF image resources:', ...imageFailures].join('\n'));
      }

      const bytes = await page.pdf({
        printBackground: PDF_RENDER_OPTIONS.printBackground,
        preferCSSPageSize: PDF_RENDER_OPTIONS.preferCSSPageSize,
        waitForFonts: PDF_RENDER_OPTIONS.waitForFonts,
        tagged: PDF_RENDER_OPTIONS.tagged,
      });

      validatePdfBytes(bytes, outputPath);

      await writeFile(outputPath, bytes);

      return {
        schemaVersion: 1,
        courseId: content.courseId,
        moduleId: content.moduleId,
        language: content.language,
        sourcePath: content.sourcePath,
        sourceSha256: content.sourceSha256,
        moduleContentSha256: content.moduleContentSha256,
        stylesheetSha256,
        htmlSha256,
        mermaidManifestSha256,
        renderInputSha256,
        pdfSha256: sha256(bytes),
        pdfPath: repositoryRelativePath(repositoryRoot, outputPath),
        bytes: bytes.byteLength,
        diagrams: content.diagrams.length,
        renderer: {
          name: 'chromium-via-puppeteer',
          rendererVersion: PDF_RENDERER_VERSION,
          browserVersion,
        },
      };
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

export function serializePdfArtifactRecord(record: PdfArtifactRecord): string {
  return canonicalJson(record);
}
