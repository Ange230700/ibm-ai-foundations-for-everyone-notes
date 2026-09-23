import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  parseCanonicalModule,
  synthesizeDeckSpec,
  validateDeckResourceCoverage,
} from '../src/index.js';

const denseExplanation =
  'This explanation deliberately carries enough detail to require a wider concept card. It preserves the canonical meaning while exercising deterministic density-aware pagination across native PowerPoint layouts. The additional context verifies that no title, body text, or footer region needs to overlap.';

const denseTableRows = Array.from(
  { length: 8 },
  (_, index) =>
    `| Layer ${index + 1} | ${denseExplanation} Responsibility ${index + 1} remains editable and source-traceable. |`,
).join('\n');

const denseSummary = Array.from(
  { length: 3 },
  (_, index) =>
    `${denseExplanation} Summary paragraph ${index + 1} adds supporting context so the final-summary layout must allocate more than one visual line to this item.`,
).join('\n\n');

const markdown = `# Layout Density Pagination Test

The native deck paginates by visual density without changing canonical content.

## Learning Objectives

- Preserve dense content without overlap.
- Keep native elements editable and source-traceable.

## Dense Concepts

### First Detailed Concept

${denseExplanation}

### Second Detailed Concept

${denseExplanation}

### Third Detailed Concept

${denseExplanation}

### Fourth Detailed Concept

${denseExplanation}

## Dense Comparison

| Layer | Responsibility |
| --- | --- |
${denseTableRows}

## Final Summary

${denseSummary}
`;

function contentFor(language: 'en' | 'fr') {
  const repositoryRoot = process.cwd();

  return parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language,
    repositoryRoot,
    sourcePath: resolve(repositoryRoot, `courses/01-test/${language}/01-test.md`),
  });
}

test('native DeckSpec paginates dense lists, concepts, and tables without content loss', () => {
  const content = contentFor('en');
  const spec = synthesizeDeckSpec(content);
  const conceptSlides = spec.slides.filter((slide) => slide.kind === 'concepts');
  const tableSlides = spec.slides.filter((slide) => slide.kind === 'table');
  const summarySlides = spec.slides.filter((slide) => slide.kind === 'summary');

  assert.ok(conceptSlides.length >= 2);
  assert.ok(conceptSlides.every((slide) => slide.concepts.length <= 2));
  assert.deepEqual(
    conceptSlides.flatMap((slide) => slide.concepts.map((concept) => concept.title)),
    [
      'First Detailed Concept',
      'Second Detailed Concept',
      'Third Detailed Concept',
      'Fourth Detailed Concept',
    ],
  );

  assert.ok(tableSlides.length >= 2);
  assert.equal(
    tableSlides.reduce((total, slide) => total + slide.rows.length, 0),
    8,
  );

  assert.ok(summarySlides.length >= 2);
  assert.deepEqual(
    summarySlides.flatMap((slide) => slide.items),
    content.summary,
  );

  assert.deepEqual(validateDeckResourceCoverage(spec, content), {
    diagrams: 0,
    codeExamples: 0,
    tables: 1,
  });
});
