import assert from 'node:assert/strict';
import test from 'node:test';

import { renderMarkdownDocument } from '../src/index.js';

const stylesheet = `
body {
  font-family: sans-serif;
}
`;

test('document renderer emits semantic HTML structure', () => {
  const markdown = `# Example Module

Introductory text.

## Learning Objectives

- Explain the concept.
- Apply the concept.

## Comparison

| Item | Value |
| --- | --- |
| A | B |

## Final Summary

Complete.
`;

  const html = renderMarkdownDocument(markdown, {
    language: 'en',
    stylesheet,
    baseHref: 'file:///repository/',
  });

  assert.match(html, /<!doctype html>/);

  assert.match(html, /<html lang="en">/);

  assert.match(html, /<title>Example Module<\/title>/);

  assert.match(html, /<base href="file:\/\/\/repository\/">/);

  assert.match(html, /class="document-cover"/);

  assert.match(html, /class="document-content"/);

  assert.match(html, /class="table-wrap"/);

  assert.match(html, /<thead>/);

  assert.match(html, /<tbody>/);
});

test('document renderer localizes French labels', () => {
  const markdown = `# Module de test

## Exemple

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

\`\`\`ts
const value = 1;
\`\`\`

![](diagram.png)
`;

  const html = renderMarkdownDocument(markdown, {
    language: 'fr',
    stylesheet,
  });

  assert.match(html, /Source du diagramme Mermaid/);

  assert.match(html, /Code - ts/);

  assert.match(html, /Image sans légende/);
});

test('document renderer generates stable unique heading ids', () => {
  const markdown = `# Module

## Example

Text.

## Example

More text.
`;

  const html = renderMarkdownDocument(markdown, {
    language: 'en',
    stylesheet,
  });

  assert.match(html, /id="example"/);

  assert.match(html, /id="example-2"/);
});

test('document renderer escapes Markdown content', () => {
  const markdown = `# Example

## Content

Use \`<script>alert("x")</script>\`.
`;

  const html = renderMarkdownDocument(markdown, {
    language: 'en',
    stylesheet,
  });

  assert.doesNotMatch(html, /<script>alert/);

  assert.match(html, /&lt;script&gt;/);
});

test('document renderer rejects raw HTML', () => {
  const markdown = `# Example

## Content

<div>Raw HTML</div>
`;

  assert.throws(
    () =>
      renderMarkdownDocument(markdown, {
        language: 'en',
        stylesheet,
      }),
    /Raw HTML is not supported/,
  );
});
