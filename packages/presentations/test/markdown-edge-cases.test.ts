import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import * as parser from 'mdast-util-from-markdown';
import type { Root } from 'mdast';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { parseCanonicalModule } from '../src/content/extract-markdown.js';
import { renderMarkdownDocument } from '../src/document/render-markdown-document.js';

test('semantic HTML preserves links, images, tasks, tables and coverless documents', () => {
  const html = renderMarkdownDocument(
    'Paragraph **bold** *italic* ~~deleted~~ `code`  \nnext.\n\n• Literal bullet\n\n> Quote\n\n3. third\n4. fourth\n\n1. first\n\n- [x] done\n- [ ] pending\n\n[Link](https://example.com "Title") ![](image.png)\n\n[Reference][ref] ![Caption][ref]\n\n[ref]: https://example.com "Reference title"\n\n| Left | Right |\n| :--- | ---: |\n| A | B |\n\n---\n\n```mermaid\nA-->B\n```\n\n```\nplain\n```',
    { language: 'fr', stylesheet: '' },
  );
  for (const marker of [
    '<strong>',
    '<em>',
    '<del>',
    '<br>',
    'literal-bullet',
    '<blockquote>',
    '<ol start="3">',
    '☑',
    '☐',
    'Image sans légende',
    'Caption',
    'text-align:left',
    'text-align:right',
    '<hr>',
    'Source du diagramme Mermaid',
  ])
    assert.ok(html.includes(marker), marker);
  assert.match(html, /<title>Document<\/title>/);
  const nestedDefinition = renderMarkdownDocument(
    '> [reference]: https://example.com\n\n[Nested reference][reference]',
    { language: 'en', stylesheet: '' },
  );
  assert.match(nestedDefinition, /<a href="https:\/\/example.com">Nested reference<\/a>/);
  assert.match(
    renderMarkdownDocument('# Title\n\nOnly a cover.', { language: 'en', stylesheet: '' }),
    /Only a cover/,
  );
});

test('canonical extraction preserves nested quotes and lists, blank code, CRLF and inline marks', () => {
  const options = {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en' as const,
    sourcePath: resolve(process.cwd(), 'test.md'),
    repositoryRoot: process.cwd(),
  };
  const markdown =
    '# Test\n\nIgnored introduction.\n\n## Parent\n\n### Learning Objectives\n\nLearn.\n\n2. **First** *point* `code`  \n   continuation\n\n   Second paragraph.\n\n   - Nested point\n\n### Resources\n\n> Quoted **text**.\n>\n> ```mermaid\n> flowchart LR\n> A-->B\n> ```\n>\n> A connects to B.\n\n- Intro\n\n  ```ts\n  const value = 1;\n  ```\n\n  After code.\n\n### Final Summary\n\nRemember.\n\n~~~\n~~~\n';
  const content = parseCanonicalModule(markdown.replaceAll('\n', '\r\n'), options);
  assert.ok(content.objectives.includes('Nested point'));
  assert.ok(content.objectives.includes('Learn.'));
  assert.deepEqual(content.summary, ['Remember.']);
  assert.equal(content.diagrams.length, 1);
  assert.equal(content.codeExamples.length, 2);
  assert.equal(content.codeExamples.at(-1)!.language, 'text');
  assert.equal(content.codeExamples.at(-1)!.code, '');
  for (const outside of [resolve(process.cwd(), '..'), resolve(process.cwd(), '../source.md')])
    assert.throws(
      () => parseCanonicalModule(markdown, { ...options, sourcePath: outside }),
      /inside the repository/,
    );
  for (const bad of [
    '',
    '# One\n# Two',
    '# Test\n\n## Final Summary\n\nRemember.',
    '# Test\n\n## Learning Objectives\n\nLearn.',
  ])
    assert.throws(() => parseCanonicalModule(bad, options), /exactly one H1|must contain Learning/);
  assert.throws(
    () =>
      parseCanonicalModule(
        '# Test\n\n## Learning Objectives\n\n```mermaid\nflowchart LR\nA-->B\n```\n\n## Final Summary\n\nRemember.',
        options,
      ),
    /explanatory paragraph/,
  );
});

test('semantic renderers fail explicitly when upstream ASTs contain unsupported or unresolved nodes', async (t) => {
  let tree: Root = { type: 'root', children: [] };
  t.mock.module('mdast-util-from-markdown', {
    namedExports: { ...parser, fromMarkdown: () => tree },
  });
  const { renderMarkdownDocument: render } =
    await import('../src/document/render-markdown-document.js?ast-contract');
  const options = { language: 'en' as const, stylesheet: '' };
  for (const node of [
    { type: 'linkReference', identifier: 'missing', children: [] },
    { type: 'imageReference', identifier: 'missing', alt: null },
    { type: 'unknown' },
  ]) {
    tree = { type: 'root', children: [node] } as Root;
    assert.throws(() => render('', options), /Unresolved reference|Unsupported document/);
  }
  tree = {
    type: 'root',
    children: [
      { type: 'table', children: [] },
      { type: 'tableRow', children: [] },
      { type: 'definition', identifier: 'duplicate', url: 'first' },
      { type: 'definition', identifier: 'duplicate', url: 'second' },
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'imageReference', identifier: 'duplicate', alt: null }],
      },
    ],
  } as Root;
  assert.match(render('', options), /Uncaptioned image/);
  tree = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          { type: 'image', url: 'image.png', alt: 'Title image' },
          { type: 'inlineCode', value: 'Code' },
          { type: 'break' },
        ],
      },
    ],
  } as Root;
  assert.match(render('', options), /Title imageCode/);
  const { parseCanonicalModule: parse } =
    await import('../src/content/extract-markdown.js?ast-contract');
  const extractOptions = {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en' as const,
    sourcePath: resolve(process.cwd(), 'test.md'),
    repositoryRoot: process.cwd(),
  };
  tree = { type: 'root', children: [{ type: 'heading', depth: 1, children: [] }] } as Root;
  assert.throws(() => parse('', extractOptions), /must contain Learning/);
  tree.children[0]!.position = undefined;
  const position = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 2, column: 1, offset: 0 },
  };
  tree = {
    type: 'root',
    children: [
      { type: 'heading', depth: 1, children: [], position },
      { type: 'heading', depth: 2, children: [] },
    ],
  } as Root;
  assert.throws(() => parse('', extractOptions), /no source position/);
  tree = {
    type: 'root',
    children: [
      { type: 'heading', depth: 1, children: [], position },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Learning Objectives' }],
        position,
      },
      {
        type: 'code',
        value: 'code',
        position: { start: { line: 1, column: 1 }, end: { line: 2, column: 1 } },
      },
    ],
  } as Root;
  assert.throws(() => parse('', extractOptions), /no source offsets/);
  const source =
    '# Test\n\n## Learning Objectives\n\n- Learn.\n\n## Code\n\n```ts\ncode\n```\n\n## Final Summary\n\n- Remember.\n';
  for (const end of [0, 7, 40]) {
    tree = parser.fromMarkdown(source);
    const code = tree.children.find((node) => node.type === 'code')!;
    code.position!.start.offset = 0;
    code.position!.end.offset = end;
    assert.equal(parse(source, extractOptions).codeExamples[0]!.code, 'code');
  }
  tree = parser.fromMarkdown(source);
  const list = tree.children.find((node) => node.type === 'list')!;
  if (list.type === 'list') {
    delete list.ordered;
    delete list.start;
  }
  assert.equal(parse(source, extractOptions).objectives[0], 'Learn.');
  const tableSource = source.replace(
    '## Code',
    '## Comparison\n\n| Header |\n| --- |\n| Value |\n\n## Code',
  );
  tree = parser.fromMarkdown(tableSource, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const table = tree.children.find((node) => node.type === 'table')!;
  if (table.type === 'table') delete table.align;
  const comparison = parse(tableSource, extractOptions).sections.find(
    (section) => section.title === 'Comparison',
  )!;
  const tableBlock = comparison.blocks[0]!;
  assert.equal(tableBlock.kind, 'table');
  if (tableBlock.kind === 'table') assert.deepEqual(tableBlock.align, []);
  tree = {
    type: 'root',
    children: [
      { type: 'linkReference', identifier: 'ref', children: [{ type: 'text', value: 'Visit' }] },
      { type: 'definition', identifier: 'ref', url: 'https://example.com' },
    ],
  } as Root;
  assert.match(render('', options), /<a href="https:\/\/example.com">Visit<\/a>/);
  tree = parser.fromMarkdown(source);
  const heading = tree.children.find((node) => node.type === 'heading')!;
  if (heading.type === 'heading')
    heading.children = [{ type: 'image', url: 'image.png', alt: 'Title' }];
  assert.equal(parse(source, extractOptions).title, '');
  const { semanticBlocksFromMarkdown } = await import('../src/document/verify-pdf.js?ast-contract');
  tree = { type: 'root', children: [{ type: 'unknown' }] } as unknown as Root;
  assert.deepEqual(semanticBlocksFromMarkdown(''), []);
  tree = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'image', url: 'image.png', alt: null },
          { type: 'imageReference', identifier: 'image', alt: 'Reference' },
          { type: 'inlineCode', value: 'code' },
          { type: 'break' },
          { type: 'thematicBreak' },
        ],
      },
    ],
  } as Root;
  assert.deepEqual(semanticBlocksFromMarkdown(''), ['Referencecode']);
});
