import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';
import puppeteer, { type Page } from 'puppeteer';

import {
  normalizePdfSemanticText,
  pageTextInReadingOrder,
  semanticBlocksFromMarkdown,
} from './verify-pdf.js';
import { renderMarkdownDocument } from './render-markdown-document.js';
import { createDocumentStylesheet } from './stylesheet.js';
import { PDF_RENDER_OPTIONS, validatePdfBytes } from './render-pdf.js';

export const AUTHORED_DOCUMENT_RENDERER_VERSION = 1;

export interface AuthoredDocumentPdfOptions {
  repositoryRoot: string;
  sourcePath: string;
  outputPath: string;
  profile: 'document' | 'reference';
  language: 'en' | 'fr';
}

export interface AuthoredDocumentPdfRecord {
  schemaVersion: 1;
  profile: 'document' | 'reference';
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  stylesheetSha256: string;
  htmlSha256: string;
  renderInputSha256: string;
  pdfSha256: string;
  pdfPath: string;
  bytes: number;
  pages: number;
  semanticSha256: string;
  renderer: {
    name: 'chromium-via-puppeteer';
    rendererVersion: number;
    browserVersion: string;
  };
}

export interface AuthoredDocumentPdfVerification {
  schemaVersion: 1;
  profile: 'document' | 'reference';
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  pdfPath: string;
  pdfSha256: string;
  pages: number;
  semanticSha256: string;
  blocks: {
    expected: number;
    matched: number;
  };
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));
  if (value === '..' || value.startsWith('../')) {
    throw new Error(`Authored document artifact must be inside the repository: ${absolutePath}`);
  }
  return value;
}

function documentBaseHref(repositoryRoot: string, sourcePath: string): string {
  const absoluteSource = resolve(repositoryRoot, ...sourcePath.split('/'));
  return pathToFileURL(dirname(absoluteSource) + sep).href;
}

function documentHtml(
  markdown: string,
  options: AuthoredDocumentPdfOptions,
  stylesheet: string,
): string {
  return renderMarkdownDocument(markdown, {
    language: options.language,
    stylesheet,
    baseHref: documentBaseHref(resolve(options.repositoryRoot), options.sourcePath),
  });
}

export interface AuthoredDocumentRenderIdentity {
  stylesheetSha256: string;
  htmlSha256: string;
}

export function authoredDocumentRenderIdentity(
  markdown: string,
  options: AuthoredDocumentPdfOptions,
): AuthoredDocumentRenderIdentity {
  const stylesheet = createDocumentStylesheet();
  const html = documentHtml(markdown, options, stylesheet.stylesheet);
  return {
    stylesheetSha256: stylesheet.stylesheetSha256,
    htmlSha256: sha256(html),
  };
}

async function checkHorizontalOverflow(page: Page, label: string): Promise<void> {
  const overflowing = await page.evaluate(() =>
    Array.from(document.querySelectorAll('table, .table-wrap, pre, img')).flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      const clipped = element.scrollWidth > element.clientWidth + 1;
      const outsidePage =
        bounds.left < -1 || bounds.right > document.documentElement.clientWidth + 1;
      return clipped || outsidePage ? [element.tagName.toLowerCase()] : [];
    }),
  );
  if (overflowing.length) {
    throw new Error(
      `Authored document has horizontal overflow in ${label}: ${[...new Set(overflowing)].join(', ')}.`,
    );
  }
}

export async function renderAuthoredDocumentPdf(
  markdown: string,
  options: AuthoredDocumentPdfOptions,
): Promise<AuthoredDocumentPdfRecord> {
  const repositoryRoot = resolve(options.repositoryRoot);
  const outputPath = resolve(options.outputPath);
  const pdfPath = repositoryRelativePath(repositoryRoot, outputPath);
  repositoryRelativePath(repositoryRoot, resolve(repositoryRoot, options.sourcePath));

  await mkdir(dirname(outputPath), { recursive: true });
  const stylesheet = createDocumentStylesheet();
  const html = documentHtml(markdown, options, stylesheet.stylesheet);
  const htmlSha256 = sha256(html);
  const semanticBlocks = semanticBlocksFromMarkdown(markdown);
  const browser = await puppeteer.launch({ headless: 'shell' });

  try {
    const browserVersion = await browser.version();
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 794, height: 1123 });
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (/^https?:/iu.test(request.url())) {
          void request.abort();
          return;
        }
        void request.continue();
      });
      await page.emulateMediaType('print');
      await page.setContent(html, { waitUntil: 'load' });
      const imageFailures = await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.src),
      );
      if (imageFailures.length) {
        throw new Error(
          `Authored document has failed image resources: ${imageFailures.join(', ')}`,
        );
      }
      await checkHorizontalOverflow(page, options.sourcePath);
      const bytes = await page.pdf({
        printBackground: PDF_RENDER_OPTIONS.printBackground,
        preferCSSPageSize: PDF_RENDER_OPTIONS.preferCSSPageSize,
        waitForFonts: PDF_RENDER_OPTIONS.waitForFonts,
        tagged: PDF_RENDER_OPTIONS.tagged,
      });
      validatePdfBytes(bytes, outputPath);
      await writeFile(outputPath, bytes);
      const verification = await verifyAuthoredDocumentPdf(markdown, options);

      return {
        schemaVersion: 1,
        profile: options.profile,
        language: options.language,
        sourcePath: options.sourcePath,
        sourceSha256: sha256(markdown),
        stylesheetSha256: stylesheet.stylesheetSha256,
        htmlSha256,
        renderInputSha256: sha256(
          canonicalJson({
            sourceSha256: sha256(markdown),
            stylesheetSha256: stylesheet.stylesheetSha256,
            htmlSha256,
            renderer: {
              name: 'chromium-via-puppeteer',
              rendererVersion: AUTHORED_DOCUMENT_RENDERER_VERSION,
              browserVersion,
            },
            pdfOptions: PDF_RENDER_OPTIONS,
          }),
        ),
        pdfSha256: verification.pdfSha256,
        pdfPath,
        bytes: bytes.byteLength,
        pages: verification.pages,
        semanticSha256: sha256(semanticBlocks.join('\n')),
        renderer: {
          name: 'chromium-via-puppeteer',
          rendererVersion: AUTHORED_DOCUMENT_RENDERER_VERSION,
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

async function extractPdfText(bytes: Uint8Array): Promise<{ pages: number; text: string }> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  try {
    const pages = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, index) => {
        const page = await pdf.getPage(index + 1);
        try {
          const content = await page.getTextContent();
          return pageTextInReadingOrder(content.items);
        } finally {
          page.cleanup();
        }
      }),
    );
    return { pages: pdf.numPages, text: pages.join('\n') };
  } finally {
    await loadingTask.destroy();
  }
}

export async function verifyAuthoredDocumentPdf(
  markdown: string,
  options: AuthoredDocumentPdfOptions,
): Promise<AuthoredDocumentPdfVerification> {
  const repositoryRoot = resolve(options.repositoryRoot);
  const pdfPath = resolve(options.outputPath);
  const relativePdfPath = repositoryRelativePath(repositoryRoot, pdfPath);
  const bytes = await readFile(pdfPath);
  validatePdfBytes(bytes, relativePdfPath);
  const extracted = await extractPdfText(new Uint8Array(bytes));
  const actual = normalizePdfSemanticText(
    extracted.text.replace(/-[^\S\r\n]*\r?\n[^\S\r\n]*(?=\S)/gu, '-'),
  );
  const expectedBlocks = semanticBlocksFromMarkdown(markdown);
  let cursor = 0;
  for (const [index, block] of expectedBlocks.entries()) {
    const position = actual.indexOf(block, cursor);
    if (position < 0) {
      throw new Error(
        `Authored document PDF semantic mismatch: ${relativePdfPath} block=${index + 1}/${expectedBlocks.length}.`,
      );
    }
    cursor = position + block.length;
  }
  return {
    schemaVersion: 1,
    profile: options.profile,
    language: options.language,
    sourcePath: options.sourcePath,
    sourceSha256: sha256(markdown),
    pdfPath: relativePdfPath,
    pdfSha256: sha256(bytes),
    pages: extracted.pages,
    semanticSha256: sha256(expectedBlocks.join('\n')),
    blocks: {
      expected: expectedBlocks.length,
      matched: expectedBlocks.length,
    },
  };
}

export function serializeAuthoredDocumentPdfRecord(record: AuthoredDocumentPdfRecord): string {
  return canonicalJson(record);
}

export function serializeAuthoredDocumentPdfVerification(
  record: AuthoredDocumentPdfVerification,
): string {
  return canonicalJson(record);
}
