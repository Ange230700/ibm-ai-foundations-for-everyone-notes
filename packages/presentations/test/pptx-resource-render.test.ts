import assert from 'node:assert/strict';
import test from 'node:test';

import { renderNativePptx } from '../src/index.js';
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

      assert.equal(artifact.renderer.rendererVersion, 2);

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
