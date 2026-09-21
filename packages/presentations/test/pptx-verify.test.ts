import assert from 'node:assert/strict';
import test from 'node:test';

import { renderNativePptx, verifyNativePptx } from '../src/index.js';
import {
  createDeckSpec,
  createPptxFixture,
  createResourceSlides,
  createSourceRef,
  TEST_SVG,
} from './pptx-fixture.js';

const sourceRef = createSourceRef({
  title: 'PPTX Verification',
  heading: 'PPTX verification',
  endLine: 30,
});

const spec = createDeckSpec({
  deckId: 'course_test-module_test-en-verify',
  title: 'PPTX Verification',
  purpose: 'Verify the emitted native PowerPoint structure',
  hashCharacter: 'c',
  sourceRef,
  slides: [
    {
      kind: 'title',
      slideId: 'title',
      title: 'PPTX Verification',
      subtitle: 'Structural verification',
      sourceRefs: [sourceRef],
    },
    ...createResourceSlides({
      sourceRef,
      diagramTitle: 'Verified diagram',
      diagramExplanation: 'The diagram image must survive the OOXML round trip.',
      tableTitle: 'Verified native table',
      tableHeaders: ['Layer', 'Role'],
      tableRows: [
        ['DeckSpec', 'Semantics'],
        ['PPTX', 'Derivative artifact'],
      ],
      tableExplanation: 'The table remains a native PowerPoint table.',
      codeTitle: 'Verified code',
      code: 'const verified = true;',
      codeExplanation: 'Canonical code remains editable slide text.',
    }),
    {
      kind: 'summary',
      slideId: 'summary',
      title: 'Verification complete',
      items: [
        'Slide order is intact.',
        'Canonical text remains present.',
        'Source notes remain attached.',
      ],
      sourceRefs: [sourceRef],
    },
  ],
});

test(
  'native PPTX OOXML verification confirms structure and canonical content',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createPptxFixture({
      name: 'pptx-verify-test',
      outputFile: 'verified.pptx',
      svg: TEST_SVG,
    });
    const { repositoryRoot, outputPath } = fixture;

    try {
      await renderNativePptx(spec, {
        repositoryRoot,
        outputPath,
        diagramAssets: [fixture.diagramAsset()],
      });

      const verification = await verifyNativePptx(spec, repositoryRoot, outputPath);

      assert.equal(verification.slideCount, spec.slides.length);

      assert.equal(verification.courseId, spec.courseId);

      assert.equal(verification.moduleId, spec.moduleId);

      assert.equal(verification.language, spec.language);

      assert.equal(verification.sourcePath, spec.sourcePath);

      assert.equal(verification.sourceSha256, spec.sourceSha256);

      assert.equal(verification.moduleContentSha256, spec.moduleContentSha256);

      assert.equal(verification.slides.length, 5);

      assert.ok(verification.slides.every((slide) => slide.sourceNotesPresent));

      assert.ok(verification.slides.every((slide) => slide.outOfBoundsObjects === 0));

      const diagram = verification.slides.find((slide) => slide.kind === 'diagram');

      assert.ok(diagram);

      assert.ok(diagram.pictures >= 1);

      const table = verification.slides.find((slide) => slide.kind === 'table');

      assert.ok(table);

      assert.equal(table.tables, 1);
    } finally {
      await fixture.cleanup();
    }
  },
);
