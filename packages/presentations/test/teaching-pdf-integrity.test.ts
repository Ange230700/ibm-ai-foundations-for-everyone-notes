import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import puppeteer, * as puppeteerApi from 'puppeteer';
import { sha256 } from '@coursera-notes/core';

import * as sessionApi from '../src/teaching/session.js';
import type { TeachingSessionContent } from '../src/teaching/session.js';

test('teaching PDF rendering validates current sources and assets and closes failed browser jobs', async (t) => {
  const root = process.cwd();
  const source = 'source';
  const content: TeachingSessionContent = {
    id: 's99',
    canonicalModuleIds: ['module_test'],
    language: 'en',
    title: 'Test',
    sourcePath: 'teaching/source.md',
    sourceSha256: sha256(source),
    contentSha256: sha256('content'),
    durationMinutes: 2,
    slides: [
      {
        id: 'slide-1',
        title: 'Title',
        role: 'course-title',
        items: ['First', 'Second', 'Third'],
        itemKinds: ['plain', 'bullet', 'ordered'],
        notes: 'Presenter only',
        durationMinutes: 1,
        startLine: 1,
        endLine: 2,
      },
      {
        id: 'slide-2',
        title: 'Table',
        items: [],
        itemKinds: [],
        table: { headers: ['Name', 'Value'], rows: [['A', 'B']] },
        notes: 'Presenter only',
        durationMinutes: 1,
        startLine: 3,
        endLine: 4,
      },
    ],
  };
  let visual = { kind: 'mermaid', path: 'teaching/visuals/s99/en/example.svg', caption: 'Diagram' };
  let asset: Buffer = Buffer.from('<svg/>');
  let sourceValue = source;
  const pdf = Buffer.from(`%PDF-${' '.repeat(1100)}%%EOF`);
  let rendered = pdf;
  let closeCount = 0;
  let pages = 2;
  let missingText = false;
  let destroyed = 0;
  const spec = () => ({
    slides: content.slides.map((slide, index) =>
      index === 0 ? { slideId: slide.id, visual } : { slideId: slide.id },
    ),
  });
  t.mock.module('../src/teaching/session.js', {
    namedExports: { ...sessionApi, teachingDeckSpec: spec },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      readFile: async (path: string) =>
        path.endsWith('source.md')
          ? sourceValue
          : path.endsWith('example.svg') || path.endsWith('example.png')
            ? asset
            : path.endsWith('.pdf')
              ? rendered
              : Buffer.from('logo'),
    },
  });
  t.mock.module('puppeteer', {
    namedExports: Object.fromEntries(
      Object.entries(puppeteerApi).filter(([name]) => name !== 'default'),
    ),
    defaultExport: {
      ...puppeteer,
      launch: async () => ({
        newPage: async () => ({ setContent: async () => undefined, pdf: async () => undefined }),
        version: async () => 'test-browser',
        close: async () => {
          closeCount++;
        },
      }),
    },
  });
  const pdfBackend = {
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: pages,
        getPage: async (number: number) => ({
          getTextContent: async () => {
            const slide = content.slides[number - 1]!;
            return {
              items: [
                { type: 'markedContent' },
                {
                  str: missingText
                    ? 'missing'
                    : [
                        slide.id,
                        slide.title,
                        ...slide.items,
                        ...(slide.table?.headers ?? []),
                        ...(slide.table?.rows.flat() ?? []),
                        number === 1 ? visual.caption : '',
                      ].join(' '),
                },
              ],
            };
          },
        }),
      }),
      destroy: async () => {
        destroyed++;
      },
    }),
  };
  const pdfMock = t.mock.module('pdfjs-dist/legacy/build/pdf.mjs', {
    namedExports: pdfBackend,
    defaultExport: { ...pdfBackend, __esModule: true },
  });
  const {
    renderTeachingPdf,
    resolveTeachingPdfVisuals,
    verifyTeachingPdf,
    serializeTeachingPdfRecord,
    renderTeachingPdfHtml,
  } = await import('../src/teaching/pdf.js?integrity');
  const output = resolve(root, '.artifacts/test.pdf');
  const visuals = await resolveTeachingPdfVisuals(content, root);
  assert.match(visuals.get('slide-1')!.dataUrl, /^data:image\/svg\+xml/);
  const record = await renderTeachingPdf(content, root, output);
  assert.equal(record.pdfSha256, sha256(pdf));
  assert.match(serializeTeachingPdfRecord(record), /test-browser/);
  sourceValue = 'changed';
  await assert.rejects(renderTeachingPdf(content, root, output), /source changed/);
  sourceValue = source;
  for (const outside of [resolve(root, '..'), resolve(root, '../escape.pdf')])
    await assert.rejects(renderTeachingPdf(content, root, outside), /inside repository/);
  rendered = Buffer.from('broken');
  await assert.rejects(renderTeachingPdf(content, root, output), /unexpectedly small/);
  assert.equal(closeCount, 2);
  rendered = pdf;
  visual = { ...visual, path: '../outside.svg' };
  await assert.rejects(resolveTeachingPdfVisuals(content, root), /Unsafe/);
  visual = { ...visual, path: 'teaching/visuals/s99/en/example.svg' };
  asset = Buffer.from('not SVG');
  await assert.rejects(resolveTeachingPdfVisuals(content, root), /Invalid teaching PDF SVG/);
  visual = { ...visual, kind: 'simulation', path: 'teaching/visuals/s99/en/example.png' };
  await assert.rejects(resolveTeachingPdfVisuals(content, root), /Invalid teaching PDF PNG/);
  asset = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.match(
    (await resolveTeachingPdfVisuals(content, root)).get('slide-1')!.dataUrl,
    /^data:image\/png/,
  );
  const html = renderTeachingPdfHtml(
    content,
    'data:logo',
    new Map([
      [
        'slide-1',
        {
          ...visual,
          slideId: 'slide-1',
          kind: 'simulation',
          dataUrl: 'data:image/png',
          sha256: sha256(asset),
        },
      ],
    ]),
  );
  assert.match(html, /split-visual/);
  assert.match(html, /brand-logo/);
  assert.doesNotMatch(html, /Presenter only/);
  assert.equal((await verifyTeachingPdf(content, output)).pages, 2);
  pages = 1;
  await assert.rejects(verifyTeachingPdf(content, output), /expected 2/);
  pages = 2;
  missingText = true;
  await assert.rejects(verifyTeachingPdf(content, output), /missing projected text/);
  missingText = false;
  const first = content.slides[0]!;
  delete content.slides[0];
  await assert.rejects(verifyTeachingPdf(content, output), /Missing teaching slide/);
  content.slides[0] = first;
  assert.equal(destroyed, 4);
  pdfMock.restore();
  t.mock.module('pdfjs-dist/legacy/build/pdf.mjs', { namedExports: pdfBackend });
  const esm = await import('../src/teaching/pdf.js?esm-integrity');
  assert.equal((await esm.verifyTeachingPdf(content, output)).pages, 2);
  assert.equal(destroyed, 5);
});
