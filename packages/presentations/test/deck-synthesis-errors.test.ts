import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  descendantBlocks,
  descendantSections,
  parseCanonicalModule,
  synthesizeDeckSpec,
} from '../src/index.js';

test('deck synthesis maps empty objectives and summaries and diagnoses missing canonical resources', () => {
  const options = {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en' as const,
    sourcePath: resolve(process.cwd(), 'test.md'),
    repositoryRoot: process.cwd(),
  };
  const markdown =
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Core Concepts\n\n### First\n\n- List explanation.\n\n### Empty\n\n### Parent\n\n#### Child\n\nChild explanation.\n\n### Code\n\n```ts\ncode\n```\n\n### Diagram\n\n```mermaid\nflowchart LR\nA-->B\n```\n\nDiagram explanation.\n\n## Final Summary\n\n- Remember.\n';
  const content = parseCanonicalModule(markdown, options);
  const spec = synthesizeDeckSpec(content);
  assert.ok(
    spec.slides.some(
      (slide) =>
        slide.kind === 'concepts' &&
        slide.concepts.some((concept) => concept.explanation.includes('Review the role of Empty')),
    ),
  );
  for (const field of ['objectives', 'summary'] as const)
    assert.throws(
      () => synthesizeDeckSpec({ ...content, [field]: ['missing'] }),
      /could not map canonical/,
    );
  const empty = parseCanonicalModule(
    '# Test\n\n## Learning Objectives\n\n## Final Summary\n',
    options,
  );
  assert.equal(synthesizeDeckSpec(empty).slides.length, 1);
  const headerOnly = parseCanonicalModule(
    '# Test\n\n## Learning Objectives\n\n## Table\n\n| Header |\n| --- |\n\n## Final Summary\n',
    options,
  );
  assert.ok(
    synthesizeDeckSpec(headerOnly).slides.some(
      (slide) => slide.kind === 'table' && slide.rows.length === 0,
    ),
  );
  assert.throws(() => synthesizeDeckSpec({ ...content, diagrams: [] }), /Missing diagram/);
  assert.throws(() => synthesizeDeckSpec({ ...content, codeExamples: [] }), /Missing code example/);
  const code = content.codeExamples[0]!;
  code.source.headingPath = [];
  const codeBlock = descendantSections(content.sections)
    .flatMap((section) => descendantBlocks(section.blocks))
    .find((block) => block.kind === 'code')!;
  codeBlock.source.headingPath = [];
  assert.ok(synthesizeDeckSpec(content).slides.some((slide) => slide.title === 'Code example'));
  const dense = parseCanonicalModule(
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Core Concepts\n\n### ' +
      'Title '.repeat(15) +
      '\n\n' +
      'Explanation '.repeat(20) +
      '\n\n### ' +
      'Long title '.repeat(15) +
      '\n\n' +
      'Dense '.repeat(100) +
      '\n\n## Final Summary\n\n- Remember.\n',
    options,
  );
  assert.equal(
    synthesizeDeckSpec(dense).slides.filter((slide) => slide.kind === 'concepts').length,
    2,
  );
});

test('deck synthesis preserves empty nested items and deduplicates repeated source references', () => {
  const options = {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en' as const,
    sourcePath: resolve(process.cwd(), 'test.md'),
    repositoryRoot: process.cwd(),
  };
  const markdown =
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Core Concepts\n\n### Nested\n\n-\n  - Child item.\n\n### Text\n\nExplain.\n\n## Final Summary\n\n- Remember.\n';
  const content = parseCanonicalModule(markdown, options);
  const section = content.sections.find((section) => section.title === 'Core Concepts')!;
  const child = section.children[1]!;
  child.blocks[0]!.source = child.source;
  const deck = synthesizeDeckSpec(content);
  const concepts = deck.slides.find((slide) => slide.kind === 'concepts')!;
  assert.equal(concepts.kind, 'concepts');
  if (concepts.kind === 'concepts') assert.equal(concepts.concepts[0]!.explanation, 'Child item.');
  const identities = concepts.sourceRefs.map((ref) => JSON.stringify(ref));
  assert.equal(new Set(identities).size, identities.length);
});

test('deck synthesis paginates dense overview text with localized continuation titles', () => {
  for (const language of ['en', 'fr'] as const) {
    const content = parseCanonicalModule(
      '# Test\n\n## Learning Objectives\n\nLearn.\n\n## Overview\n\n' +
        Array.from({ length: 6 }, (_, index) => `${index} ${'Detailed overview '.repeat(40)}`).join(
          '\n\n',
        ) +
        '\n\n## Final Summary\n\nRemember.\n',
      {
        courseId: 'course_test',
        moduleId: 'module_test',
        language,
        sourcePath: resolve(process.cwd(), 'test.md'),
        repositoryRoot: process.cwd(),
      },
    );
    const slides = synthesizeDeckSpec(content).slides.filter((slide) => slide.kind === 'overview');
    assert.ok(slides.length > 1);
    assert.match(slides[1]!.title, language === 'fr' ? /\(suite\)/ : /\(continued\)/);
  }
});
