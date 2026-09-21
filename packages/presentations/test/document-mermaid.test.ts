import assert from 'node:assert/strict';
import test from 'node:test';

import { replaceMermaidFences, type RenderedDocumentMermaidDiagram } from '../src/index.js';

const diagram = {
  diagramId: 'diagram-test',
  definition: `flowchart LR
    A --> B`,
  definitionSha256: 'a'.repeat(64),
  explanation: 'Example.',
  source: {
    path: 'example.md',
    headingPath: ['Concept Map'],
    blockId: 'diagram-test',
    startLine: 5,
    endLine: 8,
  },
};

const rendered: RenderedDocumentMermaidDiagram[] = [
  {
    diagram,
    asset: {
      diagramId: 'diagram-test',
      source: diagram.source,
      definitionSha256: diagram.definitionSha256,
      renderHash: 'b'.repeat(64),
      svgSha256: 'c'.repeat(64),
      svgPath: '.artifacts/example.svg',
      pngSha256: 'd'.repeat(64),
      pngPath: '.artifacts/example.png',
    },
    dataUri: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  },
];

test('document Mermaid replacement is deterministic and localized', () => {
  const markdown = `# Test

## Concept Map

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

Explanation.
`;

  const english = replaceMermaidFences(markdown, rendered, 'en');

  const french = replaceMermaidFences(markdown, rendered, 'fr');

  assert.match(english, /!\[Diagram 1\]\(data:image\/svg\+xml;base64,/);

  assert.match(french, /!\[Schéma 1\]\(data:image\/svg\+xml;base64,/);

  assert.doesNotMatch(english, /```mermaid/);
});

test('document Mermaid replacement rejects stale diagram definitions', () => {
  const markdown = `# Test

## Concept Map

\`\`\`mermaid
flowchart LR
    A --> C
\`\`\`
`;

  assert.throws(
    () => replaceMermaidFences(markdown, rendered, 'en'),
    /does not match extracted diagram/,
  );
});
