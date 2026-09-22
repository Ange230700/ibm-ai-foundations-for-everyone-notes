import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  deckSpecSha256,
  descendantBlocks,
  descendantSections,
  parseCanonicalModule,
  synthesizeDeckSpec,
  validateDeckResourceCoverage,
} from '../src/index.js';

const markdown = `# Native Synthesis Test

A module used to test automatic native-deck synthesis.

## Learning Objectives

- Explain native deck synthesis.
- Preserve canonical resources.
- Describe deterministic slide identities.
- Keep language structures aligned.
- Split long objective lists safely.
- Preserve objective order.
- Keep source references.
- Respect native layout limits.
- Validate every generated slide.
- Produce native PowerPoint output.

## Core Concepts

### Canonical Source

Markdown remains the authoritative source.

| Layer | Responsibility |
| --- | --- |
| Markdown | Canonical content |
| DeckSpec | Native presentation contract |

### Deterministic Output

The same content should produce the same deck specification.

\`\`\`ts
const stable = true;
\`\`\`

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[DeckSpec]
    B --> C[PPTX]
\`\`\`

The diagram connects the source to the future presentation artifact.

## Final Summary

- Deck synthesis remains source-traceable.
- Canonical resources appear exactly once.
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

test('native DeckSpec synthesis is deterministic', () => {
  const content = contentFor('en');

  const first = synthesizeDeckSpec(content);

  const second = synthesizeDeckSpec(content);

  assert.deepEqual(first, second);

  assert.equal(deckSpecSha256(first), deckSpecSha256(second));
});

test('native DeckSpec synthesis represents every resource exactly once', () => {
  const content = contentFor('en');

  const spec = synthesizeDeckSpec(content);

  const coverage = validateDeckResourceCoverage(spec, content);

  const expectedTables = descendantSections(content.sections)
    .flatMap((section) => descendantBlocks(section.blocks))
    .filter((block) => block.kind === 'table').length;

  assert.deepEqual(coverage, {
    diagrams: content.diagrams.length,
    codeExamples: content.codeExamples.length,
    tables: expectedTables,
  });

  assert.equal(spec.slides.filter((slide) => slide.kind === 'diagram').length, 1);

  assert.equal(spec.slides.filter((slide) => slide.kind === 'code').length, 1);

  assert.equal(spec.slides.filter((slide) => slide.kind === 'table').length, 1);
});

test('native DeckSpec synthesis keeps EN and FR structural slide identity aligned', () => {
  const english = synthesizeDeckSpec(contentFor('en'));

  const french = synthesizeDeckSpec(contentFor('fr'));

  assert.deepEqual(
    english.slides.map((slide) => ({
      slideId: slide.slideId,
      kind: slide.kind,
    })),
    french.slides.map((slide) => ({
      slideId: slide.slideId,
      kind: slide.kind,
    })),
  );

  const englishObjectives = english.slides.find((slide) => slide.kind === 'objectives');

  const frenchObjectives = french.slides.find((slide) => slide.kind === 'objectives');

  assert.equal(englishObjectives?.title, 'Learning objectives');

  assert.equal(frenchObjectives?.title, 'Objectifs d’apprentissage');

  const englishObjectiveSlides = english.slides.filter((slide) => slide.kind === 'objectives');
  const frenchObjectiveSlides = french.slides.filter((slide) => slide.kind === 'objectives');

  assert.deepEqual(
    englishObjectiveSlides.map((slide) => slide.items.length),
    [5, 5],
  );
  assert.deepEqual(
    frenchObjectiveSlides.map((slide) => slide.items.length),
    [5, 5],
  );
  assert.deepEqual(
    englishObjectiveSlides.map((slide) => slide.slideId),
    ['objectives', 'objectives-02'],
  );
  assert.equal(englishObjectiveSlides[1]?.title, 'Learning objectives (continued)');
  assert.equal(frenchObjectiveSlides[1]?.title, 'Objectifs d’apprentissage (suite)');

  assert.notEqual(english.audience, french.audience);

  assert.notEqual(english.purpose, french.purpose);
});

test('resource coverage rejects duplicate canonical resources', () => {
  const content = contentFor('en');

  const spec = synthesizeDeckSpec(content);

  const diagram = spec.slides.find((slide) => slide.kind === 'diagram');

  assert.ok(diagram);

  const invalid = {
    ...spec,
    slides: [
      ...spec.slides,
      {
        ...diagram,
        slideId: 'duplicate-diagram',
      },
    ],
  };

  assert.throws(() => validateDeckResourceCoverage(invalid, content), /exactly one diagram slide/);
});
