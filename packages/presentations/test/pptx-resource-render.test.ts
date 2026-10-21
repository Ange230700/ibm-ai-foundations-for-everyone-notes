import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';

import { renderNativePptx, type DeckSpec } from '../src/index.js';
import {
  createDeckSpec,
  createPptxFixture,
  createResourceSlides,
  createSourceRef,
  TEST_SVG,
} from './pptx-fixture.js';

const sourceRef = createSourceRef({
  title: 'Resource Renderer Test',
  heading: 'Native resources',
  endLine: 20,
});

const spec = createDeckSpec({
  deckId: 'course_test-module_test-en-resources',
  title: 'Resource Renderer Test',
  purpose: 'Exercise native diagram, table, and code rendering',
  hashCharacter: 'b',
  sourceRef,
  slides: createResourceSlides({
    sourceRef,
    diagramTitle: 'Native diagram rendering',
    diagramExplanation: 'The normalized SVG is embedded as a native Office image.',
    tableTitle: 'Native table rendering',
    tableHeaders: ['Layer', 'Responsibility'],
    tableRows: [
      ['Markdown', 'Canonical content'],
      ['DeckSpec', 'Presentation semantics'],
      ['PPTX', 'Native derivative artifact'],
    ],
    tableExplanation: 'The comparison remains editable as a PowerPoint table.',
    codeTitle: 'Native code rendering',
    code: [
      'const input = "DeckSpec";',
      'const output = render(input);',
      '',
      'console.log(output);',
    ].join('\n'),
    codeExplanation: 'Canonical code remains editable text inside the presentation.',
  }),
});

test(
  'native PPTX renderer emits diagram, table, and code resources',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createPptxFixture({
      name: 'pptx-resource-render-test',
      outputFile: 'resources.pptx',
      svg: TEST_SVG,
    });
    const { repositoryRoot, outputPath } = fixture;

    try {
      const artifact = await renderNativePptx(spec, {
        repositoryRoot,
        outputPath,
        diagramAssets: [fixture.diagramAsset()],
      });

      assert.equal(artifact.slides, 3);

      assert.equal(artifact.renderer.rendererVersion, 7);

      assert.match(artifact.pptxSha256, /^[a-f0-9]{64}$/);

      assert.match(artifact.renderInputSha256, /^[a-f0-9]{64}$/);

      assert.ok(artifact.bytes > 4096);
    } finally {
      await fixture.cleanup();
    }
  },
);

test('native PPTX renderer rejects stale diagram assets', async () => {
  const fixture = await createPptxFixture({
    name: 'pptx-resource-stale-test',
    outputFile: 'resources.pptx',
    svg: TEST_SVG,
  });
  const { repositoryRoot, outputPath } = fixture;

  try {
    await assert.rejects(
      () =>
        renderNativePptx(spec, {
          repositoryRoot,
          outputPath,
          diagramAssets: [fixture.diagramAsset('0'.repeat(64))],
        }),
      /checksum mismatch/,
    );
  } finally {
    await fixture.cleanup();
  }
});

test('S05 workflow canvas reserves three quarters of the table for responses only on its intended slide', async () => {
  const fixture = await createPptxFixture({
    name: 'workflow-canvas',
    outputFile: 'canvas.pptx',
    svg: TEST_SVG,
  });
  try {
    for (const [sessionId, slideId, headers, canvas] of [
      ['s05', 'S05-05', ['Field', 'Response'], true],
      ['s04', 'S05-05', ['Field', 'Response'], false],
      ['s05', 'S05-06', ['Field', 'Response'], false],
      ['s05', 'S05-05', ['Field', 'Response', 'Owner'], false],
    ] as const) {
      const current: DeckSpec = {
        ...spec,
        scope: { kind: 'teaching-session', sessionId, canonicalModuleIds: ['module_test'] },
        slides: [
          {
            kind: 'table',
            slideId,
            title: 'Workflow canvas',
            sourceRefs: [sourceRef],
            tableId: 'canvas',
            headers: [...headers],
            rows: [headers.map(() => 'Editable value')],
            explanation: 'Complete the response fields.',
          },
        ],
      };
      await renderNativePptx(current, {
        repositoryRoot: fixture.repositoryRoot,
        outputPath: fixture.outputPath,
      });
      const zip = await JSZip.loadAsync(await readFile(fixture.outputPath));
      const xml = await zip.file('ppt/slides/slide1.xml')!.async('string');
      const widths = [...xml.matchAll(/<a:gridCol w="(\d+)"/gu)].map((match) => Number(match[1]));
      assert.equal(widths.length, headers.length);
      if (canvas) {
        assert.equal(widths[1], widths[0]! * 3);
        assert.match(xml, /sz="1800"/);
      } else {
        assert.ok(widths.every((width) => width === widths[0]));
      }
      assert.match(xml, /Editable value/);
    }
  } finally {
    await fixture.cleanup();
  }
});
