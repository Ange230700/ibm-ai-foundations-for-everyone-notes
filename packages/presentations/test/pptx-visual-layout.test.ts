import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { createDeckSpec, createSourceRef } from './pptx-fixture.js';
import type { SlideSpec } from '../src/deck/model.js';

test('visual slide layouts fit crowded content and reject excess capture points and sparse slides', async (t) => {
  const root = process.cwd();
  const textCalls: Array<{ text: string; options: Record<string, number> }> = [];
  const shapeCalls: Array<Record<string, number>> = [];
  const notes: string[] = [];
  let writes = 0;
  const png = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
  png.writeUInt32BE(100, 16);
  png.writeUInt32BE(50, 20);
  const pptxBytes = Buffer.alloc(4096);
  pptxBytes[0] = 0x50;
  pptxBytes[1] = 0x4b;
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      readFile: async (path: string) =>
        path.endsWith('.pptx')
          ? pptxBytes
          : path.endsWith('.svg')
            ? Buffer.from('<svg viewBox="0 0 100 50"/>')
            : png,
    },
  });
  class Pptx {
    version = 'test';
    addSlide() {
      return {
        addImage: () => undefined,
        addShape: (_kind: string, options: Record<string, number>) => shapeCalls.push(options),
        addText: (text: string, options: Record<string, number>) =>
          textCalls.push({ text, options }),
        addNotes: (value: string) => notes.push(value),
      };
    }
    async writeFile() {
      writes++;
    }
  }
  t.mock.module('pptxgenjs', { defaultExport: Pptx });
  const { renderNativePptx } = await import('../src/pptx/render.js?visual-layout');
  const sourceRef = {
    ...createSourceRef({ title: 'Test', heading: 'Test', endLine: 3 }),
    headingPath: [],
  };
  const base = {
    kind: 'overview' as const,
    slideId: 'test',
    title: 'Test',
    sourceRefs: [sourceRef],
    items: ['First'],
  };
  const spec = (slides: SlideSpec[]) =>
    createDeckSpec({
      deckId: 'test',
      title: 'Test',
      purpose: 'Verify layout',
      hashCharacter: 'a',
      sourceRef,
      slides,
    });
  const render = (slides: SlideSpec[]) =>
    renderNativePptx(spec(slides), {
      repositoryRoot: root,
      outputPath: resolve(root, 'test.pptx'),
    });
  await render([
    {
      ...base,
      items: Array(8).fill('Point'),
      visual: { kind: 'mermaid', path: 'teaching/visuals/s99/en/diagram.svg', caption: 'Diagram' },
    },
  ]);
  const crowdedRows = shapeCalls.filter((shape) => shape.w === 0.68);
  assert.equal(crowdedRows.length, 8);
  assert.ok(crowdedRows.every((shape) => shape.h! > 0 && shape.y! + shape.h! <= 6.65 + 1e-8));
  assert.ok(notes[0]!.includes('1-3\n[/Sources]'));
  textCalls.length = 0;
  const dense = Array(4).fill('Dense explanation '.repeat(12));
  await render([
    {
      ...base,
      items: dense,
      visual: {
        kind: 'simulation',
        path: 'teaching/visuals/s99/en/example.png',
        caption: 'Simulation',
      },
    },
  ]);
  assert.ok(textCalls.some((call) => call.text === dense[0] && call.options.fontSize === 14));
  await render([
    {
      ...base,
      kind: 'objectives',
      leadIn: 'Introduction',
      visual: {
        kind: 'mermaid',
        path: 'teaching/visuals/s99/en/example.svg',
        caption: 'Objectives',
      },
    },
  ]);
  const capture = {
    ...base,
    visual: {
      kind: 'capture' as const,
      path: 'teaching/visuals/s99/en/example.png',
      caption: 'Capture',
    },
  };
  textCalls.length = 0;
  await render([{ ...capture, items: Array(5).fill('Point') }]);
  assert.ok(textCalls.some((call) => call.text === '05'));
  const validWrites = writes;
  await assert.rejects(
    render([{ ...capture, items: Array(6).fill('Point') }]),
    /too many capture teaching points/,
  );
  assert.equal(writes, validWrites);
  const sparse: SlideSpec[] = [base, base];
  delete sparse[1];
  await assert.rejects(render(sparse), /Missing native slide at index 1/);
  assert.equal(writes, validWrites);
});
