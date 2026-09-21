import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { sha256 } from '@coursera-notes/core';
import { executePdfTarget } from '../src/artifact-pdf.js';
import { createArtifactFixture } from './artifact-fixture.js';

const markdown = `# CLI PDF Test

This module validates CLI PDF orchestration.

## Learning Objectives

- Generate a PDF from canonical Markdown.
- Verify the generated PDF semantically.

## Comparison

| Input | Output |
| --- | --- |
| Markdown | PDF |

## Code Example

\`\`\`ts
const artifact = "pdf";
\`\`\`

## Final Summary

- CLI-generated PDFs retain canonical source semantics.
`;

test(
  'PDF artifact adapter renders and verifies a resolved target',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createArtifactFixture({
      name: 'cli-pdf-test',
      sourceFile: '01-cli-test.en.md',
      markdown,
    });
    const { repositoryRoot, outputRoot, target } = fixture;

    try {
      const result = await executePdfTarget(target, {
        repositoryRoot,
        outputRoot,
      });

      assert.equal(result.targetKey, 'course-01.module-01.en');

      assert.equal(result.artifact.pdfSha256, result.verification.pdfSha256);

      assert.equal(result.artifact.sourceSha256, result.verification.sourceSha256);

      assert.equal(result.artifact.moduleContentSha256, result.verification.moduleContentSha256);

      assert.equal(result.verification.blocks.matched, result.verification.blocks.expected);

      assert.ok(result.verification.blocks.expected > 5);

      assert.equal(result.verification.diagrams, 0);

      assert.match(result.pdfPath, /^\.artifacts\/cli-pdf-test\/output\/module\.pdf$/);

      const artifactRecord = await readFile(
        resolve(repositoryRoot, result.artifactRecordPath),
        'utf8',
      );

      const verificationRecord = await readFile(
        resolve(repositoryRoot, result.verificationPath),
        'utf8',
      );

      assert.ok(artifactRecord.includes(result.artifact.pdfSha256));

      assert.ok(verificationRecord.includes(result.verification.semanticSha256));

      const pdf = await readFile(resolve(repositoryRoot, result.pdfPath));

      assert.equal(sha256(pdf), result.artifact.pdfSha256);
    } finally {
      await fixture.cleanup();
    }
  },
);
