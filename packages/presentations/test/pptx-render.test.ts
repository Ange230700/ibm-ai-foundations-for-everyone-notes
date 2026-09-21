import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  DEFAULT_NATIVE_PPTX_THEME,
  deckSpecSha256,
  nativePptxThemeSha256,
  renderNativePptx,
} from '../src/index.js';
import { createDeckSpec, createPptxFixture, createSourceRef } from './pptx-fixture.js';

const sourceRef = createSourceRef({
  title: 'Native Renderer Test',
  heading: 'Renderer test',
  endLine: 10,
});

const spec = createDeckSpec({
  deckId: 'course_test-module_test-en',
  title: 'Native Renderer Test',
  purpose: 'Exercise the generic core native PPTX renderer',
  hashCharacter: 'a',
  sourceRef,
  slides: [
    {
      kind: 'title',
      slideId: 'title',
      title: 'Native Renderer Test',
      subtitle: 'Course test · Module test',
      sourceRefs: [sourceRef],
    },
    {
      kind: 'objectives',
      slideId: 'objectives',
      title: 'Learning objectives',
      items: [
        'Generate a native PowerPoint artifact.',
        'Retain source traceability.',
        'Record rendering provenance.',
      ],
      sourceRefs: [sourceRef],
    },
    {
      kind: 'overview',
      slideId: 'overview',
      title: 'The rendering pipeline',
      items: [
        'DeckSpec defines slide semantics.',
        'Theme tokens define presentation styling.',
        'PptxGenJS emits native OOXML.',
      ],
      sourceRefs: [sourceRef],
    },
    {
      kind: 'concepts',
      slideId: 'concepts',
      title: 'Three responsibilities remain separate',
      concepts: [
        {
          title: 'Content',
          explanation: 'Canonical Markdown and ModuleContent retain source meaning.',
        },
        {
          title: 'Specification',
          explanation: 'DeckSpec defines presentation structure without renderer details.',
        },
        {
          title: 'Rendering',
          explanation: 'PptxGenJS turns the accepted specification into native slides.',
        },
      ],
      sourceRefs: [sourceRef],
    },
    {
      kind: 'summary',
      slideId: 'summary',
      title: 'Native rendering foundation',
      items: [
        'The PPTX is a derivative artifact.',
        'Its stable identity comes from canonical render inputs.',
      ],
      sourceRefs: [sourceRef],
    },
  ],
});

test('native PPTX theme identity is deterministic', () => {
  const first = nativePptxThemeSha256(DEFAULT_NATIVE_PPTX_THEME);

  const second = nativePptxThemeSha256(DEFAULT_NATIVE_PPTX_THEME);

  assert.equal(first, second);

  assert.match(first, /^[a-f0-9]{64}$/);

  const changed = {
    ...DEFAULT_NATIVE_PPTX_THEME,
    colors: {
      ...DEFAULT_NATIVE_PPTX_THEME.colors,
      accent: '000000',
    },
  };

  assert.notEqual(first, nativePptxThemeSha256(changed));
});

test(
  'core native PPTX renderer produces a validated artifact with provenance',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createPptxFixture({
      name: 'pptx-render-test',
      outputFile: 'module.en.pptx',
    });
    const { repositoryRoot, outputPath } = fixture;

    try {
      const artifact = await renderNativePptx(spec, {
        repositoryRoot,
        outputPath,
      });

      assert.equal(artifact.deckId, spec.deckId);

      assert.equal(artifact.language, 'en');

      assert.equal(artifact.courseId, spec.courseId);

      assert.equal(artifact.moduleId, spec.moduleId);

      assert.equal(artifact.sourcePath, spec.sourcePath);

      assert.equal(artifact.sourceSha256, spec.sourceSha256);

      assert.equal(artifact.moduleContentSha256, spec.moduleContentSha256);

      assert.equal(artifact.slides, spec.slides.length);

      assert.equal(artifact.deckSpecSha256, deckSpecSha256(spec));

      assert.equal(artifact.themeSha256, nativePptxThemeSha256(DEFAULT_NATIVE_PPTX_THEME));

      assert.equal(artifact.themeId, DEFAULT_NATIVE_PPTX_THEME.id);

      assert.equal(artifact.renderer.name, 'pptxgenjs');

      assert.equal(artifact.renderer.version, '4.0.1');

      assert.equal(artifact.renderer.rendererVersion, 2);

      assert.match(artifact.renderInputSha256, /^[a-f0-9]{64}$/);

      assert.match(artifact.pptxSha256, /^[a-f0-9]{64}$/);

      assert.equal(artifact.pptxPath, '.artifacts/pptx-render-test/module.en.pptx');

      assert.ok(artifact.bytes > 4096);

      const bytes = await readFile(outputPath);

      assert.equal(bytes[0], 0x50);

      assert.equal(bytes[1], 0x4b);
    } finally {
      await fixture.cleanup();
    }
  },
);
