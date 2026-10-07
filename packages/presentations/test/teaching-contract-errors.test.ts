import assert from 'node:assert/strict';
import test from 'node:test';
import * as parser from 'mdast-util-from-markdown';
import type { Root } from 'mdast';
import {
  parseTeachingSession,
  teachingDeckSpec,
  validateTeachingPair,
} from '../src/teaching/session.js';

const projected = [
  'Subtitle\n\nContext',
  '- First\n- Second',
  'Plain **text** *emphasis* `code` ![Image](image.png)  \nline break.',
];
const markdown = (body = projected) =>
  '# S99 Test\n\n`source.md`\n\n' +
  body
    .map(
      (text, index) =>
        `## Slide ${String(index + 1).padStart(2, '0')} — Title ${index + 1}\n\nIdentifier: S99-${String(index + 1).padStart(2, '0')} Duration: 1 minute\n\n### On-Slide Content\n\n${text}\n\n${index < 2 ? `### Slide Role\n\n${index === 0 ? 'course-title' : 'course-objectives'}\n\n` : ''}### Teaching Notes\n\n**Key takeaway:** Main point.\n\nSay this.\n\n`,
    )
    .join('');
const options = {
  id: 's99',
  canonicalModuleIds: ['module_test'],
  language: 'en' as const,
  sourcePath: 'teaching/source.md',
  slideCount: 3,
  durationMinutes: 3,
  canonicalSources: ['source.md'],
};

test('teaching source parser rejects invalid provenance, metadata, roles, notes and projected content', () => {
  const source = markdown();
  for (const value of [[], ['duplicate', 'duplicate']])
    assert.throws(
      () => parseTeachingSession(source, { ...options, canonicalModuleIds: value }),
      /non-empty and unique/,
    );
  for (const value of ['', source.replace('# S99', '# Wrong'), source.replace('# S99', '## S99')])
    assert.throws(() => parseTeachingSession(value, options), /invalid session heading/);
  assert.throws(
    () => parseTeachingSession(source.replace('`source.md`', ''), options),
    /canonical source missing/,
  );
  for (const value of [
    'Identifier: S99-99 Duration: 1 minute',
    'Identifier: S99-01',
    'Identifier: S99-01 Duration: 0 minute',
  ])
    assert.throws(
      () =>
        parseTeachingSession(
          source.replace('Identifier: S99-01 Duration: 1 minute', value),
          options,
        ),
      /identifier\/duration/,
    );
  assert.throws(
    () => parseTeachingSession(source.replace('— Title 1', '— '), options),
    /Invalid teaching slide heading/,
  );
  assert.throws(
    () => parseTeachingSession(source.replace('On-Slide Content', 'Missing content'), options),
    /Missing teaching section/,
  );
  assert.throws(
    () => parseTeachingSession(source.replace('course-title', 'unsupported'), options),
    /unsupported slide role/,
  );
  assert.throws(
    () => parseTeachingSession(source.replace('course-title', 'course-objectives'), options),
    /identity\/role mismatch/,
  );
  assert.throws(
    () => parseTeachingSession(source.replace('course-objectives', 'course-title'), options),
    /identity\/role mismatch/,
  );
  assert.throws(
    () =>
      parseTeachingSession(
        source
          .replace('## Slide 03', '## Slide 04')
          .replace('Identifier: S99-03', 'Identifier: S99-04'),
        options,
      ),
    /identity\/role mismatch/,
  );
  assert.throws(
    () =>
      parseTeachingSession(
        source.replace(
          '### Teaching Notes\n\n**Key takeaway:** Main point.\n\nSay this.',
          '### Teaching Notes',
        ),
        options,
      ),
    /missing teaching notes/,
  );
  assert.throws(
    () => parseTeachingSession(source, { ...options, slideCount: 4 }),
    /expected 4 slides/,
  );
  assert.throws(
    () => parseTeachingSession(source, { ...options, durationMinutes: 4 }),
    /expected 4 minutes/,
  );
  for (const [body, message] of [
    ['', /1 to 8/],
    ['- ', /1 to 8/],
    [Array.from({ length: 9 }, (_, index) => `- Item ${index}`).join('\n'), /1 to 8/],
    ['```ts\ncode\n```', /unsupported projected code/],
    ['| Header |\n| --- |', /invalid projected table/],
    ['| Header |\n| --- |\n| Value |\n\nAdditional paragraph', /cannot contain additional/],
    [
      '| Header |\n| --- |\n| Value |\n\n| Second |\n| --- |\n| Value |',
      /unsupported projected table/,
    ],
  ] as const)
    assert.throws(
      () => parseTeachingSession(markdown([projected[0]!, projected[1]!, body]), options),
      message,
    );
  const table = parseTeachingSession(
    markdown([projected[0]!, projected[1]!, '| Name | Value |\n| --- | --- |\n| A | B |']),
    options,
  );
  assert.equal(table.slides[2]!.table!.rows[0]![1], 'B');
  const content = parseTeachingSession(source, options);
  const deck = teachingDeckSpec(content);
  assert.equal(deck.slides[2]!.kind, 'overview');
  content.slides[1]!.itemKinds = ['plain', 'plain'];
  const plainObjectives = teachingDeckSpec(content).slides[1]!;
  assert.equal(plainObjectives.kind, 'objectives');
  if (plainObjectives.kind === 'objectives') assert.deepEqual(plainObjectives.itemLabels, ['', '']);
  content.slides[0]!.items = [];
  assert.throws(() => teachingDeckSpec(content), /no subtitle/);
});

test('bilingual teaching validation checks each structural identity and table dimension', () => {
  const en = parseTeachingSession(markdown(), options);
  const fr = { ...structuredClone(en), language: 'fr' as const };
  validateTeachingPair(en, fr);
  for (const [key, value] of [
    ['language', 'en'],
    ['id', 'other'],
    ['canonicalModuleIds', []],
    ['canonicalModuleIds', ['other']],
    ['slides', []],
    ['durationMinutes', 4],
  ] as const)
    assert.throws(() => validateTeachingPair(en, { ...fr, [key]: value }), /do not align/);
  assert.throws(() => validateTeachingPair({ ...en, language: 'fr' }, fr), /do not align/);
  for (const [key, value] of [
    ['id', 'wrong'],
    ['durationMinutes', 4],
    ['role', undefined],
    ['items', []],
    ['itemKinds', ['ordered']],
  ] as const) {
    const valueFr = structuredClone(fr);
    Object.assign(valueFr.slides[0]!, { [key]: value });
    assert.throws(() => validateTeachingPair(en, valueFr), /diverge/);
  }
  const table = { headers: ['Name'], rows: [['Value']] };
  en.slides[2]!.table = table;
  for (const other of [
    undefined,
    { headers: ['Name', 'Extra'], rows: [['Value']] },
    { headers: ['Name'], rows: [] },
  ]) {
    fr.slides[2]!.table = other;
    assert.throws(() => validateTeachingPair(en, fr), /diverge/);
  }
  fr.slides[2]!.table = table;
  validateTeachingPair(en, fr);
  delete fr.slides[0];
  assert.throws(() => validateTeachingPair(en, fr), /diverge/);
});

test('teaching parser validates upstream source positions and table row consistency', async (t) => {
  const source = markdown();
  let tree: Root = parser.fromMarkdown(source);
  t.mock.module('mdast-util-from-markdown', {
    namedExports: { ...parser, fromMarkdown: () => tree },
  });
  const { parseTeachingSession: parse } = await import('../src/teaching/session.js?ast-errors');
  const note = tree.children.find(
    (node) => node.type === 'paragraph' && node.children[0]?.type === 'strong',
  )!;
  delete note.position;
  assert.throws(() => parse(source, options), /missing teaching notes/);
  tree = parser.fromMarkdown(source);
  const first = tree.children.find(
    (node) => node.type === 'paragraph' && node.children[0]?.type === 'strong',
  )!;
  first.position = { start: { line: 0, column: 1 }, end: { line: 0, column: 1 } };
  assert.throws(() => parse(source, options), /empty teaching notes/);
  tree = parser.fromMarkdown(source);
  const slideHeading = tree.children.find((node) => node.type === 'heading' && node.depth === 2)!;
  delete slideHeading.position;
  tree.children.splice(
    tree.children.findIndex((node) => node === slideHeading),
    0,
    { type: 'thematicBreak' },
  );
  const lastHeading = {
    type: 'heading',
    depth: 3,
    children: [{ type: 'text', value: 'Additional metadata' }],
  } as const;
  tree.children.push(lastHeading as unknown as Root['children'][number]);
  const image = tree.children.find(
    (node) => node.type === 'paragraph' && node.children.some((child) => child.type === 'image'),
  );
  if (image?.type === 'paragraph') {
    const node = image.children.find((child) => child.type === 'image')!;
    if (node.type === 'image') delete node.alt;
  }
  const changed = parse(source, options);
  assert.equal(changed.slides[0]!.startLine, 0);
  assert.equal(changed.slides.at(-1)!.endLine, 0);
  tree = parser.fromMarkdown(source);
  const headingIndex = tree.children.findIndex(
    (node) => node.type === 'heading' && node.depth === 2,
  );
  tree.children.splice(headingIndex + 1, 0, { type: 'thematicBreak' });
  assert.throws(() => parse(source, options), /identifier\/duration/);
});
