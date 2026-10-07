import assert from 'node:assert/strict';
import test from 'node:test';
import * as parser from 'mdast-util-from-markdown';
import type { Root } from 'mdast';

test('TXT rendering validates upstream references and tolerates sparse table metadata', async (t) => {
  let tree: Root = { type: 'root', children: [] };
  t.mock.module('mdast-util-from-markdown', {
    namedExports: { ...parser, fromMarkdown: () => tree },
  });
  const { renderMarkdownText } = await import('../src/render-markdown-text.js?ast-contract');
  for (const type of ['linkReference', 'imageReference']) {
    tree = { type: 'root', children: [{ type, identifier: 'missing', children: [] }] } as Root;
    assert.throws(() => renderMarkdownText(''), /Unresolved reference/);
  }
  tree = { type: 'root', children: [{ type: 'table', children: [] }] };
  assert.equal(renderMarkdownText(''), '\n');
  tree = {
    type: 'root',
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [{ type: 'tableCell', children: [{ type: 'text', value: '' }] }],
          },
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'long '.repeat(30) }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'extra' }] },
            ],
          },
        ],
      },
    ],
  };
  assert.match(renderMarkdownText('', { language: 'fr' }), /Colonne 1/);
  tree = {
    type: 'root',
    children: [
      { type: 'definition', identifier: 'ref', url: 'image.png' },
      { type: 'definition', identifier: 'ref', url: 'ignored.png' },
      { type: 'imageReference', identifier: 'ref', alt: null },
    ],
  } as Root;
  assert.match(renderMarkdownText(''), /Uncaptioned image.*image.png/);
  tree = {
    type: 'root',
    children: [
      {
        type: 'list',
        ordered: true,
        start: null,
        children: [
          {
            type: 'listItem',
            children: [{ type: 'paragraph', children: [{ type: 'text', value: 'item' }] }],
          },
        ],
      },
      { type: 'heading', depth: 7, children: [{ type: 'text', value: 'Future heading' }] },
    ],
  } as unknown as Root;
  assert.match(renderMarkdownText(''), /1\. item/);
  tree = {
    type: 'root',
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [{ type: 'tableCell', children: [{ type: 'text', value: 'A' }] }],
          },
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'B' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'Extra' }] },
            ],
          },
        ],
      },
    ],
  };
  assert.match(renderMarkdownText(''), /B {2}Extra/);
  tree = {
    type: 'root',
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'A' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'B' }] },
            ],
          },
          {
            type: 'tableRow',
            children: [{ type: 'tableCell', children: [{ type: 'text', value: 'Value' }] }],
          },
        ],
      },
    ],
  };
  assert.match(renderMarkdownText(''), /Value/);
});
