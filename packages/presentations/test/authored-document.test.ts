import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import puppeteer, * as puppeteerApi from 'puppeteer';
import { sha256 } from '@coursera-notes/core';

test('authored document PDF rendering checks resources, layout, text order and cleanup', async (t) => {
  const root = process.cwd();
  const options = {
    repositoryRoot: root,
    sourcePath: 'docs/test.md',
    outputPath: resolve(root, '.artifacts/test.pdf'),
    profile: 'document' as const,
    language: 'en' as const,
  };
  const markdown = '# Title\n\n## Details\n\nKeep evidence.\n\n## Next\n\nCheck permission.';
  const validPdf = Buffer.from(`%PDF-1.7\n${' '.repeat(1100)}\n%%EOF`);
  let bytes = validPdf;
  let extracted = 'Title Details Keep evidence. Next Check permission.';
  let failedImages = false;
  let overflow = false;
  let textFailure = false;
  let pageCloses = 0;
  let browserCloses = 0;
  let destroyed = 0;
  let cleaned = 0;
  let aborted = 0;
  let continued = 0;
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      writeFile: async (_path: string, value: Uint8Array) => {
        bytes = Buffer.from(value);
      },
      readFile: async () => bytes,
    },
  });
  t.mock.module('puppeteer', {
    namedExports: Object.fromEntries(
      Object.entries(puppeteerApi).filter(([name]) => name !== 'default'),
    ),
    defaultExport: {
      ...puppeteer,
      launch: async () => ({
        version: async () => 'test-browser',
        close: async () => {
          browserCloses++;
        },
        newPage: async () => ({
          setViewport: async () => undefined,
          setRequestInterception: async () => undefined,
          on: (
            _event: string,
            handler: (request: {
              url: () => string;
              abort: () => Promise<void>;
              continue: () => Promise<void>;
            }) => void,
          ) => {
            for (const url of [
              'https://example.invalid/image.png',
              'file:///image.png',
              'data:image/png;base64,AA',
            ])
              handler({
                url: () => url,
                abort: async () => {
                  aborted++;
                },
                continue: async () => {
                  continued++;
                },
              });
          },
          emulateMediaType: async () => undefined,
          setContent: async () => undefined,
          evaluate: async (fn: () => unknown) => {
            const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
            Object.defineProperty(globalThis, 'document', {
              configurable: true,
              value: {
                images: failedImages
                  ? [
                      { complete: false, naturalWidth: 10, src: 'incomplete.png' },
                      { complete: true, naturalWidth: 0, src: 'missing.png' },
                      { complete: true, naturalWidth: 10, src: 'ok.png' },
                    ]
                  : [],
                documentElement: { clientWidth: 794 },
                querySelectorAll: () => [
                  {
                    tagName: 'TABLE',
                    scrollWidth: overflow ? 900 : 300,
                    clientWidth: 300,
                    getBoundingClientRect: () => ({ left: 0, right: 300 }),
                  },
                  {
                    tagName: 'PRE',
                    scrollWidth: 300,
                    clientWidth: 300,
                    getBoundingClientRect: () => ({ left: overflow ? -5 : 0, right: 300 }),
                  },
                  {
                    tagName: 'IMG',
                    scrollWidth: 300,
                    clientWidth: 300,
                    getBoundingClientRect: () => ({ left: 0, right: overflow ? 900 : 300 }),
                  },
                ],
              },
            });
            try {
              return fn();
            } finally {
              if (previous) Object.defineProperty(globalThis, 'document', previous);
              else Reflect.deleteProperty(globalThis, 'document');
            }
          },
          pdf: async () => bytes,
          close: async () => {
            pageCloses++;
          },
        }),
      }),
    },
  });
  const pdfBackend = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => {
            if (textFailure) throw new Error('extraction failed');
            return { items: [{ str: extracted, transform: [1, 0, 0, 12, 0, 0] }] };
          },
          cleanup: () => {
            cleaned++;
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
  const api = await import('../src/document/render-authored-document.js');
  const record = await api.renderAuthoredDocumentPdf(markdown, options);
  assert.equal(record.pdfSha256, sha256(validPdf));
  assert.equal(record.renderer.browserVersion, 'test-browser');
  assert.equal(record.pages, 1);
  assert.equal(aborted, 1);
  assert.equal(continued, 2);
  assert.equal(JSON.parse(api.serializeAuthoredDocumentPdfRecord(record)).profile, 'document');
  const verified = await api.verifyAuthoredDocumentPdf(markdown, options);
  assert.equal(
    JSON.parse(api.serializeAuthoredDocumentPdfVerification(verified)).blocks.matched,
    5,
  );
  assert.deepEqual(api.authoredDocumentRenderIdentity(markdown, options), {
    stylesheetSha256: record.stylesheetSha256,
    htmlSha256: record.htmlSha256,
  });
  await assert.rejects(
    api.renderAuthoredDocumentPdf(markdown, {
      ...options,
      outputPath: resolve(root, '../outside.pdf'),
    }),
    /inside the repository/,
  );
  await assert.rejects(
    api.renderAuthoredDocumentPdf(markdown, { ...options, sourcePath: '../outside.md' }),
    /inside the repository/,
  );
  await assert.rejects(
    api.verifyAuthoredDocumentPdf(markdown, {
      ...options,
      outputPath: resolve(root, '../outside.pdf'),
    }),
    /inside the repository/,
  );
  failedImages = true;
  await assert.rejects(api.renderAuthoredDocumentPdf(markdown, options), /failed image resources/);
  failedImages = false;
  overflow = true;
  await assert.rejects(
    api.renderAuthoredDocumentPdf(markdown, options),
    /horizontal overflow.*table, pre, img/,
  );
  overflow = false;
  bytes = Buffer.from('broken');
  await assert.rejects(api.renderAuthoredDocumentPdf(markdown, options), /PDF/);
  bytes = validPdf;
  extracted = 'missing';
  await assert.rejects(api.renderAuthoredDocumentPdf(markdown, options), /semantic mismatch/);
  textFailure = true;
  await assert.rejects(api.verifyAuthoredDocumentPdf(markdown, options), /extraction failed/);
  assert.equal(pageCloses, browserCloses);
  assert.equal(cleaned, destroyed);
  assert.equal(browserCloses, 5);
});
