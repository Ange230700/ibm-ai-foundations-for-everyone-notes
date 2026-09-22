import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { parseCanonicalModule, synthesizeDeckSpec } from '../src/index.js';

const summaryItems = Array.from({ length: 10 }, (_, index) => `- Summary point ${index + 1}.`).join(
  '\n',
);

function contentFor(language: 'en' | 'fr') {
  const objectives = language === 'fr' ? 'Objectifs d’apprentissage' : 'Learning Objectives';
  const summary = language === 'fr' ? 'Synthèse finale' : 'Final Summary';
  const markdown = `# Summary Pagination Test

The native deck keeps every summary item readable and source-traceable.

## ${objectives}

- Explain balanced summary pagination.

## Core Concept

Canonical content remains authoritative.

## ${summary}

${summaryItems}
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

test('native DeckSpec paginates summaries with localized continuation titles', () => {
  for (const [language, continuedTitle] of [
    ['en', 'Final summary (continued)'],
    ['fr', 'Résumé final (suite)'],
  ] as const) {
    const content = contentFor(language);
    const spec = synthesizeDeckSpec(content);
    const summarySlides = spec.slides.filter((slide) => slide.kind === 'summary');

    assert.deepEqual(
      summarySlides.map((slide) => slide.slideId),
      ['summary', 'summary-02'],
    );
    assert.deepEqual(
      summarySlides.map((slide) => slide.items.length),
      [5, 5],
    );
    assert.equal(summarySlides[1]?.title, continuedTitle);
    assert.deepEqual(
      summarySlides.flatMap((slide) => slide.items),
      content.summary,
    );
  }
});
