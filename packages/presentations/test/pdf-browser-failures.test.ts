import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';
import puppeteer, * as puppeteerApi from 'puppeteer';
import { parseCanonicalModule } from '../src/content/extract-markdown.js';
import { DEFAULT_MERMAID_THEME } from '../src/mermaid/config.js';

test('PDF rendering rejects source drift, escaped outputs, broken images and invalid PDF bytes', async (t) => {
  const root = process.cwd();
  const directory = await mkdtemp(join(root, '.artifacts/pdf-failures-'));
  const markdown =
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Final Summary\n\n- Remember.\n';
  const content = parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    repositoryRoot: root,
    sourcePath: resolve(root, 'courses/test.md'),
  });
  let pdf = Buffer.from(`%PDF-${' '.repeat(1100)}%%EOF`);
  let images = [{ complete: true, naturalWidth: 1, src: 'good.png' }];
  let pageCloses = 0;
  let browserCloses = 0;
  const intercepted: string[] = [];
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
          setRequestInterception: async () => undefined,
          on: (
            _event: string,
            listener: (request: {
              url: () => string;
              abort: () => Promise<void>;
              continue: () => Promise<void>;
            }) => void,
          ) => {
            for (const url of [
              'https://example.com/a.png',
              'http://example.com/b.png',
              'data:image/png',
              'file:///image.png',
            ])
              listener({
                url: () => url,
                abort: async () => {
                  intercepted.push(`abort:${url}`);
                },
                continue: async () => {
                  intercepted.push(`continue:${url}`);
                },
              });
          },
          emulateMediaType: async () => undefined,
          setContent: async () => undefined,
          evaluate: (fn: () => unknown) => {
            const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
            Object.defineProperty(globalThis, 'document', {
              configurable: true,
              value: { images },
            });
            try {
              return fn();
            } finally {
              if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
              else Reflect.deleteProperty(globalThis, 'document');
            }
          },
          pdf: async () => pdf,
          close: async () => {
            pageCloses++;
          },
        }),
      }),
    },
  });
  const { renderModulePdf, validatePdfBytes } =
    await import('../src/document/render-pdf.js?browser-failures');
  const options = { repositoryRoot: root, outputPath: join(directory, 'output.pdf') };
  try {
    await assert.rejects(renderModulePdf('changed', content, options), /does not match/);
    for (const path of [resolve(root, '..'), resolve(root, '../outside.pdf')])
      await assert.rejects(
        renderModulePdf(markdown, content, { ...options, outputPath: path }),
        /inside the repository/,
      );
    await assert.rejects(
      renderModulePdf(markdown, content, {
        ...options,
        mermaidAssetRoot: resolve(root, '../mermaid'),
      }),
      /inside the repository/,
    );
    const result = await renderModulePdf(markdown, content, {
      ...options,
      mermaidTheme: DEFAULT_MERMAID_THEME,
    });
    assert.equal(result.renderer.browserVersion, 'test-browser');
    assert.equal(intercepted.filter((value) => value.startsWith('abort:')).length, 2);
    assert.equal(intercepted.filter((value) => value.startsWith('continue:')).length, 2);
    images = [
      { complete: false, naturalWidth: 1, src: 'incomplete.png' },
      { complete: true, naturalWidth: 0, src: 'missing.png' },
    ];
    await assert.rejects(renderModulePdf(markdown, content, options), /Failed PDF image resources/);
    images = [];
    pdf = Buffer.from('invalid');
    await assert.rejects(renderModulePdf(markdown, content, options), /unexpectedly small/);
    assert.equal(browserCloses, 3);
    assert.equal(pageCloses, 3);
    assert.throws(() => validatePdfBytes(Buffer.alloc(1100)), /not a PDF/);
    assert.throws(() => validatePdfBytes(Buffer.from(`%PDF-${' '.repeat(1100)}`)), /EOF marker/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
