import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  DEFAULT_NATIVE_PPTX_THEME,
  renderNativePptx,
  validatePptxBytes,
  verifyNativePptx,
  type SlideSpec,
} from '../src/index.js';
import { createDeckSpec, createPptxFixture, createSourceRef } from './pptx-fixture.js';

test('native layouts preserve dense lists, concepts, tables and code and reject content beyond their limits', async () => {
  const fixture = await createPptxFixture({
    name: 'pptx-layout-errors',
    outputFile: 'test.pptx',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><rect width="100" height="200"/></svg>',
  });
  const sourceRef = createSourceRef({ title: 'Test', heading: 'Test', endLine: 3 });
  const base = { slideId: 'slide', title: 'Test', sourceRefs: [sourceRef] };
  const list: SlideSpec = {
    ...base,
    kind: 'objectives',
    items: ['First', 'Second'],
    leadIn: 'Introduction',
  };
  const concepts: SlideSpec = {
    ...base,
    kind: 'concepts',
    concepts: [{ title: 'Concept', explanation: 'Explanation' }],
  };
  const table: SlideSpec = {
    ...base,
    kind: 'table',
    tableId: 'table',
    headers: ['A', 'B'],
    rows: [['A', 'B']],
    explanation: 'Explanation',
  };
  const code: SlideSpec = {
    ...base,
    kind: 'code',
    codeExampleId: 'code',
    language: 'ts',
    code: 'code',
    explanation: 'Explanation',
  };
  const make = (slides: SlideSpec[]) =>
    createDeckSpec({
      deckId: 'test',
      title: 'Test',
      purpose: 'Verify',
      hashCharacter: 'a',
      sourceRef,
      slides,
    });
  const render = (slides: SlideSpec[]) =>
    renderNativePptx(make(slides), {
      repositoryRoot: fixture.repositoryRoot,
      outputPath: fixture.outputPath,
      diagramAssets: [fixture.diagramAsset()],
    });
  try {
    for (const [slide, pattern] of [
      [{ ...list, items: [] }, /no list items/],
      [{ ...list, items: Array(9).fill('item') }, /at most 8/],
      [{ ...concepts, concepts: [] }, /1 to 3 concepts/],
      [
        { ...concepts, concepts: Array(4).fill({ title: 'Title', explanation: 'Explanation' }) },
        /1 to 3 concepts/,
      ],
      [{ ...table, headers: [] }, /no table columns/],
      [{ ...table, headers: Array(7).fill('header') }, /at most 6/],
      [{ ...table, rows: Array(11).fill(['value']) }, /at most 11/],
      [{ ...code, code: Array(29).fill('line').join('\n') }, /at most 28/],
      [{ ...code, code: 'x'.repeat(111) }, /unbreakable code segment/],
    ] as const)
      await assert.rejects(render([slide]), pattern);
    const slides: SlideSpec[] = [
      list,
      { ...list, kind: 'overview', items: Array(7).fill('medium '.repeat(15)) },
      { ...list, kind: 'summary', items: ['word '.repeat(50), 'second'] },
      concepts,
      { ...concepts, concepts: Array(2).fill({ title: 'Title', explanation: 'Explanation' }) },
      {
        ...concepts,
        concepts: Array(3).fill({ title: 'Title', explanation: 'long '.repeat(100) }),
      },
      { ...base, kind: 'diagram', diagramId: 'diagram/test/01', explanation: 'Tall diagram' },
      table,
      {
        ...table,
        headers: Array(5).fill('header'),
        rows: Array(7).fill(Array(5).fill('long '.repeat(10))),
      },
      {
        ...table,
        headers: Array(5).fill('header'),
        rows: Array(9).fill(Array(5).fill('dense '.repeat(20))),
      },
      { ...code, code: Array(15).fill('x'.repeat(80)).join('\n') },
      { ...code, code: Array(22).fill('x'.repeat(95)).join('\n') },
    ].map((slide, index) => ({ ...slide, slideId: `slide-${index}` }));
    await render(slides);
    const verification = await verifyNativePptx(
      make(slides),
      fixture.repositoryRoot,
      fixture.outputPath,
    );
    assert.equal(verification.slideCount, slides.length);
    assert.ok(verification.slides.every((slide) => slide.outOfBoundsObjects === 0));
    for (const path of [
      resolve(fixture.repositoryRoot, '..'),
      resolve(fixture.repositoryRoot, '../outside.pptx'),
    ])
      await assert.rejects(
        renderNativePptx(make([list]), {
          repositoryRoot: fixture.repositoryRoot,
          outputPath: path,
        }),
        /inside the repository/,
      );
    await assert.rejects(
      renderNativePptx(
        { ...make([list]), themeId: 'wrong' },
        { repositoryRoot: fixture.repositoryRoot, outputPath: fixture.outputPath },
      ),
      /does not match renderer theme/,
    );
    await assert.rejects(
      render([{ ...base, kind: 'unsupported' } as unknown as SlideSpec]),
      /does not yet support/,
    );
    assert.throws(() => validatePptxBytes(Buffer.alloc(1), 'test'), /unexpectedly small/);
    for (const value of [Buffer.alloc(4096), Buffer.from([0x50, 0, ...Array(4094).fill(0)])])
      assert.throws(() => validatePptxBytes(value, 'test'), /not an OOXML ZIP/);
  } finally {
    await fixture.cleanup();
  }
});

test('native rendering validates branding files, teaching visuals and the runtime export', async (t) => {
  const root = process.cwd();
  const sourceRef = createSourceRef({ title: 'Test', heading: 'Test', endLine: 3 });
  const base = {
    kind: 'overview' as const,
    slideId: 'slide',
    title: 'Test',
    sourceRefs: [sourceRef],
    items: ['First', 'Second'],
  };
  const spec = createDeckSpec({
    deckId: 'test',
    title: 'Test',
    purpose: 'Verify',
    hashCharacter: 'a',
    sourceRef,
    slides: [base],
  });
  let failure: unknown;
  let bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  let visualBytes = Buffer.from('invalid SVG');
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      readFile: async (path: string) => {
        if (path.includes('teaching/visuals')) return visualBytes;
        if (failure !== undefined) throw failure;
        return bytes;
      },
    },
  });
  const { renderNativePptx: render } = await import('../src/pptx/render.js?asset-errors');
  const options = { repositoryRoot: root, outputPath: resolve(root, '.artifacts/test.pptx') };
  for (const error of [
    null,
    'read failed',
    {},
    { code: 'EACCES' },
    Object.assign(new Error('missing'), { code: 'ENOENT' }),
  ]) {
    failure = error;
    await assert.rejects(
      render(spec, options),
      error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
        ? /asset was not found/
        : () => true,
    );
  }
  failure = undefined;
  for (const value of [
    Buffer.alloc(1),
    Buffer.alloc(8),
    Buffer.from([137, 0, 78, 71, 0, 0, 0, 0]),
    Buffer.from([137, 80, 0, 71, 0, 0, 0, 0]),
    Buffer.from([137, 80, 78, 0, 0, 0, 0, 0]),
  ]) {
    bytes = value;
    await assert.rejects(render(spec, options), /valid PNG asset/);
  }
  bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  await assert.rejects(
    render(spec, {
      ...options,
      theme: {
        ...DEFAULT_NATIVE_PPTX_THEME,
        brand: { ...DEFAULT_NATIVE_PPTX_THEME.brand, logoPath: '../outside.png' },
      },
    }),
    /inside the repository/,
  );
  const visual = {
    kind: 'mermaid' as const,
    path: 'teaching/visuals/s99/en/example.svg',
    caption: 'Example',
  };
  const visualSpec = { ...spec, slides: [{ ...base, visual }] };
  await assert.rejects(
    render(
      { ...visualSpec, slides: [{ ...base, visual: { ...visual, path: '../outside.svg' } }] },
      options,
    ),
    /Unsafe teaching visual/,
  );
  await assert.rejects(render(visualSpec, options), /Invalid teaching SVG/);
  await assert.rejects(
    render(
      {
        ...visualSpec,
        slides: [
          {
            ...base,
            visual: { ...visual, kind: 'capture', path: 'teaching/visuals/s99/en/example.png' },
          },
        ],
      },
      options,
    ),
    /Invalid teaching PNG/,
  );
  for (const svg of ['<svg viewBox="0 0 0 1"/>', '<svg viewBox="0 0 1 0"/>']) {
    visualBytes = Buffer.from(svg);
    await assert.rejects(render(visualSpec, options), /Invalid visual dimensions/);
  }
  t.mock.module('pptxgenjs', { defaultExport: { default: { default: {} } } });
  visualBytes = Buffer.from('<svg/>');
  await assert.rejects(render(visualSpec, options), /constructible runtime export/);
});
