import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  deckSourceRef,
  descendantBlocks,
  descendantSections,
  parseCanonicalModule,
  synthesizeDeckSpec,
  validateDeckResourceCoverage,
  validateDeckSpec,
} from '../src/index.js';

function fixture() {
  const content = parseCanonicalModule(
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Core Concepts\n\n### Concept\n\nExplanation.\n\n| Name | Value |\n| --- | --- |\n| A | B |\n\n```ts\nconst a = 1;\n```\n\n```mermaid\nflowchart LR\n A-->B\n```\n\nA connects to B.\n\n## Final Summary\n\n- Remember.\n',
    {
      courseId: 'course_test',
      moduleId: 'module_test',
      language: 'en',
      repositoryRoot: process.cwd(),
      sourcePath: resolve(process.cwd(), 'courses/test.md'),
    },
  );
  return { content, spec: synthesizeDeckSpec(content) };
}

test('deck validation rejects malformed metadata, slide content and source references', () => {
  const { content, spec } = fixture();
  const reject = (mutate: (value: Record<string, unknown>) => void, expected: RegExp) => {
    const value = structuredClone(spec) as unknown as Record<string, unknown>;
    mutate(value);
    assert.throws(() => validateDeckSpec(value, content), expected);
  };
  for (const value of [null, [], 1])
    assert.throws(() => validateDeckSpec(value, content), /must be an object/);
  reject((value) => {
    value.extra = true;
  }, /unknown properties/);
  for (const scope of [null, [], 1])
    reject((value) => {
      value.scope = scope;
    }, /scope must be an object/);
  reject((value) => {
    (value.scope as Record<string, unknown>).extra = true;
  }, /unknown properties/);
  for (const key of [
    'schemaVersion',
    'status',
    'language',
    'sourcePath',
    'sourceSha256',
    'moduleContentSha256',
  ])
    reject((value) => {
      value[key] = 'wrong';
    }, /metadata/);
  for (const key of ['kind', 'courseId', 'moduleId'])
    reject((value) => {
      (value.scope as Record<string, unknown>)[key] = 'wrong';
    }, /metadata/);
  for (const key of ['deckId', 'title', 'audience', 'purpose', 'themeId'])
    for (const bad of [1, ' '])
      reject((value) => {
        value[key] = bad;
      }, /top-level fields/);
  for (const bad of [null, []])
    reject((value) => {
      value.slides = bad;
    }, /top-level fields/);
  const slideReject = (
    kind: string,
    mutate: (slide: Record<string, unknown>) => void,
    expected: RegExp,
  ) =>
    reject((value) => {
      const slides = value.slides as Array<Record<string, unknown>>;
      mutate(slides.find((slide) => slide.kind === kind)!);
    }, expected);
  for (const bad of [1, 'unsupported'])
    slideReject(
      'title',
      (slide) => {
        slide.kind = bad;
      },
      /kind is not supported/,
    );
  slideReject(
    'title',
    (slide) => {
      slide.extra = true;
    },
    /unknown properties/,
  );
  for (const key of ['slideId', 'title'])
    for (const bad of [1, ' '])
      slideReject(
        'title',
        (slide) => {
          slide[key] = bad;
        },
        /non-empty slideId/,
      );
  for (const bad of [null, []])
    slideReject(
      'title',
      (slide) => {
        slide.sourceRefs = bad;
      },
      /at least one source/,
    );
  for (const bad of [null, [], [1]])
    slideReject(
      'objectives',
      (slide) => {
        slide.itemLabels = bad;
      },
      /itemLabels/,
    );
  slideReject(
    'objectives',
    (slide) => {
      slide.itemLabels = ['1'];
      slide.items = null;
    },
    /itemLabels/,
  );
  for (const bad of [1, ' '])
    slideReject(
      'title',
      (slide) => {
        slide.teachingNotes = bad;
      },
      /teachingNotes/,
    );
  for (const bad of [1.5, 0])
    slideReject(
      'title',
      (slide) => {
        slide.durationMinutes = bad;
      },
      /durationMinutes/,
    );
  const visual = { kind: 'capture', path: 'teaching/visuals/s01/en/test.png', caption: 'Test' };
  for (const [key, bad] of [
    ['kind', 'other'],
    ['path', 1],
    ['path', '../test.png'],
    ['caption', 1],
    ['caption', ' '],
  ] as const)
    slideReject(
      'title',
      (slide) => {
        slide.visual = { ...visual, [key]: bad };
      },
      /approved teaching asset/,
    );
  for (const key of ['path', 'heading', 'headingPath', 'blockIds', 'startLine', 'endLine'])
    slideReject(
      'title',
      (slide) => {
        (slide.sourceRefs as Array<Record<string, unknown>>)[0]![key] = null;
      },
      /source-reference fields/,
    );
  for (const [key, bad] of [
    ['headingPath', [1]],
    ['blockIds', []],
    ['blockIds', [1]],
    ['startLine', 0],
    ['endLine', 0],
    ['blockIds', ['unknown']],
  ] as const)
    slideReject(
      'title',
      (slide) => {
        (slide.sourceRefs as Array<Record<string, unknown>>)[0]![key] = bad;
      },
      /source-reference|line bounds|unknown block/,
    );
  slideReject(
    'title',
    (slide) => {
      slide.subtitle = 1;
    },
    /subtitle/,
  );
  for (const kind of ['objectives', 'summary'])
    for (const bad of [null, [1], [' ']])
      slideReject(
        kind,
        (slide) => {
          slide.items = bad;
        },
        /non-empty strings/,
      );
  slideReject(
    'objectives',
    (slide) => {
      slide.leadIn = 1;
    },
    /leadIn/,
  );
  for (const bad of [
    null,
    [],
    [null],
    [1],
    [[]],
    [{ title: 'T', explanation: 'E', extra: true }],
    [{ title: 1, explanation: 'E' }],
    [{ title: ' ', explanation: 'E' }],
    [{ title: 'T', explanation: 1 }],
    [{ title: 'T', explanation: ' ' }],
  ])
    slideReject(
      'concepts',
      (slide) => {
        slide.concepts = bad;
      },
      /concepts/,
    );
  for (const [key, bad, expected] of [
    ['diagramId', 1, /diagramId/],
    ['diagramId', 'missing', /unknown diagram/],
    ['explanation', 1, /explanation/],
  ] as const)
    slideReject(
      'diagram',
      (slide) => {
        slide[key] = bad;
      },
      expected,
    );
  for (const [key, bad, expected] of [
    ['tableId', 1, /tableId/],
    ['tableId', 'missing', /unknown table/],
    ['headers', null, /invalid table/],
    ['headers', [1], /invalid table/],
    ['rows', null, /invalid table/],
    ['rows', [1], /invalid table/],
    ['rows', [[1]], /invalid table/],
    ['explanation', 1, /invalid table/],
    ['headers', ['changed'], /canonical table/],
    ['rows', [['changed']], /canonical table/],
  ] as const)
    slideReject(
      'table',
      (slide) => {
        slide[key] = bad;
      },
      expected,
    );
  for (const [key, bad, expected] of [
    ['codeExampleId', 1, /codeExampleId/],
    ['codeExampleId', 'missing', /unknown code/],
    ['language', 'changed', /canonical code/],
    ['explanation', 1, /explanation/],
  ] as const)
    slideReject(
      'code',
      (slide) => {
        slide[key] = bad;
      },
      expected,
    );
  const title = spec.slides[0]!;
  validateDeckSpec(
    {
      ...spec,
      slides: [{ ...title, items: ['Detail'], teachingNotes: 'Note', durationMinutes: 1, visual }],
    },
    content,
  );
  assert.equal(deckSourceRef({ ...content.titleSource, headingPath: [] }).heading, '');
});

test('resource coverage detects missing resources, unexpected resources and altered table segments', () => {
  const { content, spec } = fixture();
  for (const kind of ['diagram', 'code', 'table'])
    assert.throws(
      () =>
        validateDeckResourceCoverage(
          { ...spec, slides: spec.slides.filter((slide) => slide.kind !== kind) },
          content,
        ),
      /requires/,
    );
  for (const kind of ['diagram', 'code', 'table'] as const) {
    const slide = spec.slides.find((slide) => slide.kind === kind)!;
    const key = kind === 'diagram' ? 'diagramId' : kind === 'code' ? 'codeExampleId' : 'tableId';
    assert.throws(
      () =>
        validateDeckResourceCoverage(
          { ...spec, slides: [...spec.slides, { ...slide, [key]: 'unknown' }] },
          content,
        ),
      /unexpected/,
    );
  }
  for (const field of ['headers', 'rows'])
    assert.throws(
      () =>
        validateDeckResourceCoverage(
          {
            ...spec,
            slides: spec.slides.map((slide) =>
              slide.kind === 'table'
                ? { ...slide, [field]: field === 'headers' ? ['changed'] : [] }
                : slide,
            ),
          },
          content,
        ),
      /canonical headers|canonical rows/,
    );
  const table = descendantSections(content.sections)
    .flatMap((section) => descendantBlocks(section.blocks))
    .find((block) => block.kind === 'table')!;
  const tableSlide = spec.slides.find((slide) => slide.kind === 'table')!;
  table.rows = [];
  const emptySpec = {
    ...spec,
    slides: spec.slides.map((slide) =>
      slide === tableSlide ? { ...tableSlide, headers: [], rows: [] } : slide,
    ),
  };
  validateDeckSpec(emptySpec, content);
  validateDeckResourceCoverage(emptySpec, content);
  const blocks = descendantBlocks([
    { kind: 'blockquote', blocks: [], id: 'q', source: content.titleSource },
  ]);
  assert.equal(blocks[0]!.kind, 'blockquote');
});
