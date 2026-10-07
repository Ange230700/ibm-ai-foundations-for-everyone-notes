import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import * as canvasApi from '@napi-rs/canvas';
import { sha256 } from '@coursera-notes/core';
import { parseCanonicalModule } from '../src/content/extract-markdown.js';

test('PDF page rendering and contact sheets reject invalid settings and corrupted page evidence', async (t) => {
  const root = process.cwd();
  const bytes = Buffer.from(`%PDF-${' '.repeat(1100)}%%EOF`);
  let png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  let cleanup = 0;
  let destroyed = 0;
  let pageCount = 2;
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      readFile: async (path: string) => (path.endsWith('.pdf') ? bytes : png),
      rm: async () => undefined,
      mkdir: async () => undefined,
      writeFile: async () => undefined,
    },
  });
  t.mock.module('@napi-rs/canvas', {
    namedExports: {
      ...canvasApi,
      createCanvas: (width: number, height: number) => ({
        width,
        height,
        encode: async () => png,
        getContext: () => ({
          fillRect: () => undefined,
          fillText: () => undefined,
          drawImage: () => undefined,
        }),
      }),
      loadImage: async () => ({ width: 10, height: 20 }),
    },
  });
  const pdfBackend = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: pageCount,
        getPage: async () => ({
          getViewport: () => ({ width: 10, height: 20 }),
          render: () => ({ promise: Promise.resolve() }),
          cleanup: () => {
            cleanup++;
          },
        }),
      }),
      destroy: async () => {
        destroyed++;
      },
    }),
  };
  t.mock.module('pdfjs-dist/legacy/build/pdf.mjs', {
    namedExports: pdfBackend,
    defaultExport: { ...pdfBackend, __esModule: true },
  });
  const { renderPdfPages, serializePdfPageRenderManifest } =
    await import('../src/document/render-pdf-pages.js?qa-errors');
  const { createPdfContactSheets, serializePdfContactSheetManifest } =
    await import('../src/document/contact-sheet.js?qa-errors');
  const options = {
    repositoryRoot: root,
    pdfPath: resolve(root, 'test.pdf'),
    outputRoot: resolve(root, 'test-pages'),
  };
  for (const path of [resolve(root, '..'), resolve(root, '../outside')])
    for (const field of ['pdfPath', 'outputRoot'])
      await assert.rejects(renderPdfPages({ ...options, [field]: path }), /inside the repository/);
  for (const dpi of [NaN, Infinity, 0, -1])
    await assert.rejects(renderPdfPages({ ...options, dpi }), /Invalid PDF render DPI/);
  const pages = await renderPdfPages(options);
  assert.equal(pages.pageCount, 2);
  assert.match(serializePdfPageRenderManifest(pages), /page-002/);
  const sheetOptions = {
    repositoryRoot: root,
    outputRoot: resolve(root, 'test-sheets'),
    documentId: 'test',
  };
  for (const path of [resolve(root, '..'), resolve(root, '../outside')])
    await assert.rejects(
      createPdfContactSheets(pages, { ...sheetOptions, outputRoot: path }),
      /inside the repository/,
    );
  for (const field of ['columns', 'pagesPerSheet', 'thumbnailWidth'])
    for (const value of [1.5, 0])
      await assert.rejects(
        createPdfContactSheets(pages, { ...sheetOptions, [field]: value }),
        /Invalid PDF contact-sheet/,
      );
  await assert.rejects(
    createPdfContactSheets({ ...pages, pageCount: 3 }, sheetOptions),
    /Expected 3 rendered/,
  );
  await assert.rejects(
    createPdfContactSheets(
      { ...pages, pages: [{ ...pages.pages[0]!, pageNumber: 2 }, pages.pages[1]!] },
      sheetOptions,
    ),
    /not contiguous/,
  );
  await assert.rejects(
    createPdfContactSheets(
      { ...pages, pages: [{ ...pages.pages[0]!, pngSha256: 'stale' }, pages.pages[1]!] },
      sheetOptions,
    ),
    /checksum mismatch/,
  );
  const sheets = await createPdfContactSheets(pages, {
    ...sheetOptions,
    columns: 1,
    pagesPerSheet: 1,
    thumbnailWidth: 10,
  });
  assert.equal(sheets.sheets.length, 2);
  assert.match(serializePdfContactSheetManifest(sheets), /pages-002-002/);
  png = Buffer.from('broken');
  await assert.rejects(renderPdfPages(options), /not PNG/);
  assert.equal(cleanup, 3);
  assert.equal(destroyed, 2);
  pageCount = 0;
  assert.equal((await renderPdfPages(options)).pages.length, 0);
  assert.equal(
    (await createPdfContactSheets({ ...pages, pages: [], pageCount: 0 }, sheetOptions)).sheets
      .length,
    0,
  );
});

test('semantic PDF verification diagnoses changed sources, diagram drift and absent text', async (t) => {
  const root = process.cwd();
  const markdown =
    '# Test\n\n## Learning Objectives\n\nA long objective that continues after its initial matching anchor.\n\n## Final Summary\n\nRemember.\n';
  const content = parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    sourcePath: resolve(root, 'test.md'),
    repositoryRoot: root,
  });
  const bytes = Buffer.from(`%PDF-${' '.repeat(1100)}%%EOF`);
  let text =
    'Test Learning Objectives A long objective that continues after its initial matching anchor. Final Summary Remember.';
  let destroys = 0;
  t.mock.module('node:fs/promises', { namedExports: { ...fs, readFile: async () => bytes } });
  const pdfBackend = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({
            items: [{ str: text, transform: [1, 0, 0, 1, 0, 0], height: 1, width: 10 }],
          }),
          cleanup: () => undefined,
        }),
      }),
      destroy: async () => {
        destroys++;
      },
    }),
  };
  t.mock.module('pdfjs-dist/legacy/build/pdf.mjs', {
    namedExports: pdfBackend,
    defaultExport: { ...pdfBackend, __esModule: true },
  });
  const { verifyModulePdf, semanticBlocksFromMarkdown, serializePdfSemanticVerification } =
    await import('../src/document/verify-pdf.js?errors');
  const options = { repositoryRoot: root, pdfPath: resolve(root, 'test.pdf') };
  assert.match(
    serializePdfSemanticVerification(await verifyModulePdf(markdown, content, options)),
    /semanticSha256/,
  );
  await assert.rejects(verifyModulePdf('changed', content, options), /does not match/);
  for (const path of [resolve(root, '..'), resolve(root, '../outside.pdf')])
    await assert.rejects(
      verifyModulePdf(markdown, content, { ...options, pdfPath: path }),
      /inside the repository/,
    );
  await assert.rejects(
    verifyModulePdf(markdown, { ...content, diagrams: [content.diagrams[0]!] }, options),
    /Expected 1 Mermaid/,
  );
  for (const actual of [
    'missing everything',
    'Test Learning Objectives A long objective that con DIFFERENT',
  ]) {
    text = actual;
    await assert.rejects(verifyModulePdf(markdown, content, options), /Semantic PDF mismatch/);
  }
  assert.equal(destroys, 3);
  assert.throws(() => semanticBlocksFromMarkdown('<div>raw</div>'), /Raw HTML/);
  assert.deepEqual(
    semanticBlocksFromMarkdown(
      '> Text\n\n- Item\n\n| A | B |\n| --- | --- |\n| C | D |\n\n![alt](image.png)  \n[ref][id]\n\n[id]: https://example.com\n\n---\n\n```mermaid\nA-->B\n```\n\n```\ncode\n```',
    ),
    ['Text', 'Item', 'A B', 'C D', 'alt ref', 'code'],
  );
  assert.equal(sha256(bytes).length, 64);
});
