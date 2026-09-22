import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  parseCanonicalModule,
  synthesizeDeckSpec,
  validateDeckResourceCoverage,
} from '../src/index.js';

const tableRows = Array.from(
  { length: 12 },
  (_, index) => `| Layer ${index + 1} | Responsibility ${index + 1} |`,
).join('\n');

function contentFor(language: 'en' | 'fr') {
  const objectives = language === 'fr' ? 'Objectifs d’apprentissage' : 'Learning Objectives';
  const summary = language === 'fr' ? 'Synthèse finale' : 'Final Summary';
  const markdown = `# Table Pagination Test

Canonical tables remain complete when a native deck needs continuation slides.

## ${objectives}

- Preserve every canonical table row.
- Keep editable tables readable.

## Comparison

| Layer | Responsibility |
| --- | --- |
${tableRows}

## ${summary}

- Table segments preserve their canonical order.
`;

  const repositoryRoot = process.cwd();

  return parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language,
    repositoryRoot,
    sourcePath: resolve(repositoryRoot, `courses/01-test/${language}/01-test.md`),
  });
}

test('native DeckSpec paginates canonical tables without loss or duplication', () => {
  for (const [language, continuation] of [
    ['en', '(continued)'],
    ['fr', '(suite)'],
  ] as const) {
    const content = contentFor(language);
    const spec = synthesizeDeckSpec(content);
    const tableSlides = spec.slides.filter((slide) => slide.kind === 'table');

    assert.equal(tableSlides.length, 2);
    assert.ok(tableSlides.every((slide) => slide.rows.length > 0 && slide.rows.length <= 10));
    assert.equal(
      tableSlides.reduce((total, slide) => total + slide.rows.length, 0),
      12,
    );
    assert.deepEqual(tableSlides[0]?.headers, tableSlides[1]?.headers);
    assert.ok(tableSlides[1]?.title.endsWith(continuation));

    assert.deepEqual(validateDeckResourceCoverage(spec, content), {
      diagrams: 0,
      codeExamples: 0,
      tables: 1,
    });

    const firstTableSlide = tableSlides[0];

    assert.ok(firstTableSlide);

    assert.throws(
      () =>
        validateDeckResourceCoverage(
          {
            ...spec,
            slides: [
              ...spec.slides,
              { ...firstTableSlide, slideId: `${firstTableSlide.slideId}-duplicate` },
            ],
          },
          content,
        ),
      /do not reproduce canonical rows/u,
    );
  }
});
