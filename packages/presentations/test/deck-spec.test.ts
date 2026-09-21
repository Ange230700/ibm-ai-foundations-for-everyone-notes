import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  deckSourceRef,
  deckSpecSha256,
  descendantBlocks,
  descendantSections,
  parseCanonicalModule,
  serializeDeckSpec,
  validateDeckSpec,
  type DeckSpec,
} from '../src/index.js';

const markdown = `# Native Deck Test

A compact module used to validate the generic deck contract.

## Learning Objectives

- Explain deterministic deck specifications.
- Preserve source traceability.

## Core Concepts

### Example Concept

The concept turns canonical Markdown into a native slide specification.

| Layer | Role |
| --- | --- |
| Markdown | Canonical source |
| DeckSpec | Presentation contract |

\`\`\`ts
const value = 1;
\`\`\`

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[DeckSpec]
\`\`\`

The diagram connects canonical content to its presentation contract.

## Final Summary

- Native decks remain traceable to canonical Markdown.
`;

function fixture() {
  const repositoryRoot = process.cwd();

  const content = parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    repositoryRoot,
    sourcePath: resolve(repositoryRoot, 'courses/01-test/en/01-test.md'),
  });

  const sections = descendantSections(content.sections);

  const learningObjectives = sections.find((section) => section.title === 'Learning Objectives');

  const finalSummary = sections.find((section) => section.title === 'Final Summary');

  assert.ok(learningObjectives);

  assert.ok(finalSummary);

  const blocks = sections.flatMap((section) => descendantBlocks(section.blocks));

  const table = blocks.find((block) => block.kind === 'table');

  assert.ok(table);

  const diagram = content.diagrams[0];

  const code = content.codeExamples[0];

  assert.ok(diagram);
  assert.ok(code);

  const [headers = [], ...rows] = table.rows;

  const spec: DeckSpec = {
    schemaVersion: 1,
    status: 'accepted',
    deckId: 'course_test-module_test-en',
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    title: content.title,
    audience: 'Learners reviewing the module',
    purpose: 'Present canonical module content as native slides',
    themeId: 'default-native-v1',
    sourcePath: content.sourcePath,
    sourceSha256: content.sourceSha256,
    moduleContentSha256: content.moduleContentSha256,
    slides: [
      {
        kind: 'title',
        slideId: 'title',
        title: content.title,
        subtitle: 'Course test - Module test',
        sourceRefs: [deckSourceRef(content.titleSource)],
      },
      {
        kind: 'objectives',
        slideId: 'objectives',
        title: 'Learning objectives',
        items: content.objectives,
        sourceRefs: [deckSourceRef(learningObjectives.source)],
      },
      {
        kind: 'table',
        slideId: 'comparison',
        title: 'The content layers',
        tableId: table.id,
        headers,
        rows,
        explanation: 'The table distinguishes canonical source from presentation structure.',
        sourceRefs: [deckSourceRef(table.source)],
      },
      {
        kind: 'code',
        slideId: 'code-example',
        title: 'Canonical code remains unchanged',
        codeExampleId: code.codeExampleId,
        language: code.language,
        code: code.code,
        explanation: 'The example is copied exactly from canonical Markdown.',
        sourceRefs: [deckSourceRef(code.source)],
      },
      {
        kind: 'diagram',
        slideId: 'concept-map',
        title: 'Markdown becomes a deck specification',
        diagramId: diagram.diagramId,
        explanation: diagram.explanation,
        sourceRefs: [deckSourceRef(diagram.source)],
      },
      {
        kind: 'summary',
        slideId: 'summary',
        title: 'Final summary',
        items: content.summary,
        sourceRefs: [deckSourceRef(finalSummary.source)],
      },
    ],
  };

  return {
    content,
    spec,
  };
}

test('generic DeckSpec validates against canonical ModuleContent', () => {
  const { content, spec } = fixture();

  const validated = validateDeckSpec(spec, content);

  assert.deepEqual(validated, spec);
});

test('DeckSpec serialization and identity are deterministic', () => {
  const { content, spec } = fixture();

  const validated = validateDeckSpec(spec, content);

  assert.equal(serializeDeckSpec(validated), serializeDeckSpec(validated));

  assert.equal(deckSpecSha256(validated), deckSpecSha256(validated));

  assert.match(deckSpecSha256(validated), /^[a-f0-9]{64}$/);
});

test('DeckSpec rejects duplicate slide IDs', () => {
  const { content, spec } = fixture();

  const invalid = {
    ...spec,
    slides: spec.slides.map((slide, index) =>
      index === 1
        ? {
            ...slide,
            slideId: spec.slides[0]?.slideId ?? 'title',
          }
        : slide,
    ),
  };

  assert.throws(() => validateDeckSpec(invalid, content), /slide IDs must be unique/);
});

test('DeckSpec rejects code that differs from canonical Markdown', () => {
  const { content, spec } = fixture();

  const invalid = {
    ...spec,
    slides: spec.slides.map((slide) =>
      slide.kind === 'code'
        ? {
            ...slide,
            code: 'const value = 2;',
          }
        : slide,
    ),
  };

  assert.throws(() => validateDeckSpec(invalid, content), /silently changes canonical code/);
});

test('DeckSpec rejects stale canonical source identity', () => {
  const { content, spec } = fixture();

  assert.throws(
    () =>
      validateDeckSpec(
        {
          ...spec,
          sourceSha256: '0'.repeat(64),
        },
        content,
      ),
    /metadata does not match the extracted canonical module/,
  );
});
