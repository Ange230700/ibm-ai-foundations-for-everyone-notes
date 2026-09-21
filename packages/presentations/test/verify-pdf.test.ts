import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  parseCanonicalModule,
  renderModulePdf,
  semanticBlocksFromMarkdown,
  stripMermaidFences,
  verifyModulePdf,
} from '../src/index.js';

const markdown = `# PDF Verification Test

This introductory paragraph must survive the PDF pipeline.

## Learning Objectives

- Explain semantic PDF verification.
- Confirm source content remains in order.

## Comparison

| Input | Output |
| --- | --- |
| Markdown | PDF |

## Code Example

\`\`\`ts
const value = 1;
\`\`\`

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[PDF]
\`\`\`

The diagram itself is verified separately from text.

## Final Summary

- PDF text should preserve the canonical source semantics.
`;

test(
  'PDF semantic verifier confirms source blocks in reading order',
  {
    timeout: 60_000,
  },
  async () => {
    const repositoryRoot = process.cwd();

    const outputRoot = resolve(repositoryRoot, '.artifacts', 'pdf-verify-test');

    const outputPath = resolve(outputRoot, 'module.en.pdf');

    await mkdir(resolve(repositoryRoot, '.artifacts'), {
      recursive: true,
    });

    await rm(outputRoot, {
      recursive: true,
      force: true,
    });

    const content = parseCanonicalModule(markdown, {
      courseId: 'course_test',
      moduleId: 'module_test',
      language: 'en',
      repositoryRoot,
      sourcePath: resolve(repositoryRoot, 'courses/01-test/en/01-test.md'),
    });

    try {
      const artifact = await renderModulePdf(markdown, content, {
        repositoryRoot,
        outputPath,
        mermaidAssetRoot: resolve(outputRoot, 'mermaid'),
      });

      const verification = await verifyModulePdf(markdown, content, {
        repositoryRoot,
        pdfPath: outputPath,
      });

      assert.equal(verification.courseId, content.courseId);

      assert.equal(verification.moduleId, content.moduleId);

      assert.equal(verification.language, 'en');

      assert.equal(verification.sourcePath, content.sourcePath);

      assert.equal(verification.sourceSha256, content.sourceSha256);

      assert.equal(verification.moduleContentSha256, content.moduleContentSha256);

      assert.equal(verification.pdfSha256, artifact.pdfSha256);

      assert.ok(verification.pages >= 2);

      assert.equal(verification.diagrams, 1);

      assert.equal(verification.blocks.matched, verification.blocks.expected);

      assert.ok(verification.blocks.expected > 5);

      assert.match(verification.semanticSha256, /^[a-f0-9]{64}$/);

      assert.equal(verification.pdfPath, '.artifacts/pdf-verify-test/module.en.pdf');

      const stripped = stripMermaidFences(markdown);

      const blocks = semanticBlocksFromMarkdown(stripped.markdown);

      assert.ok(blocks.includes('This introductory paragraph must survive the PDF pipeline.'));

      assert.ok(blocks.includes('Markdown PDF'));

      assert.ok(blocks.includes('const value = 1;'));
    } finally {
      await rm(outputRoot, {
        recursive: true,
        force: true,
      });
    }
  },
);
