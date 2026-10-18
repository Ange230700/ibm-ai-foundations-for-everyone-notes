import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeMermaidSvgForOffice } from '../src/index.js';

test('Mermaid SVG normalization produces Office-safe deterministic output', () => {
  const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <g class="node">
    <rect width="100" height="50"/>
    <g class="label">Example</g>
  </g>
</svg>`;

  const first = normalizeMermaidSvgForOffice(input, 'diagram-test');

  const second = normalizeMermaidSvgForOffice(input, 'diagram-test');

  assert.equal(first, second);

  assert.match(first, /font-family=/);

  assert.match(first, /viewBox="-12 -12 124 74"/);

  assert.doesNotMatch(first, /<foreignObject\b/i);
});

test('edge-label backgrounds override Mermaid transparency without changing label text', () => {
  const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
    <style>.edgeLabel rect { opacity: 0.5; }</style>
    <g class="edgeLabel" transform="translate(50, 25)"><text>Verified</text></g>
  </svg>`;
  const output = normalizeMermaidSvgForOffice(input, 'opaque-label');

  assert.match(output, /<rect[^>]*style="opacity: 1; fill-opacity: 1;"/);
  assert.match(output, />Verified<\/text>/);
  assert.match(output, /transform="translate\(50, 25\)"/);
});
