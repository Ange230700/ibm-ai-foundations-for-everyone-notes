import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { sha256 } from '@coursera-notes/core';
import { executePptxTarget } from '../src/artifact-pptx.js';
import { createArtifactFixture } from './artifact-fixture.js';

const markdown = `# CLI PPTX Test

This module validates native PowerPoint CLI orchestration.

## Learning Objectives

- Generate a native PowerPoint artifact.
- Preserve canonical resources.
- Verify emitted OOXML structure.

## Pipeline

Canonical Markdown becomes a structured native presentation.

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[DeckSpec]
    B --> C[PPTX]
\`\`\`

The diagram represents the native presentation pipeline.

## Comparison

| Layer | Role |
| --- | --- |
| Markdown | Canonical source |
| PPTX | Native derivative |

The table remains editable PowerPoint content.

## Code Example

\`\`\`ts
const artifact = "pptx";
\`\`\`

The code remains editable slide text.

## Final Summary

- Native PowerPoint generation retains canonical meaning.
- Structural verification checks the generated OOXML.
`;

test(
  'PPTX artifact adapter renders and verifies a resolved target',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createArtifactFixture({
      name: 'cli-pptx-test',
      sourceFile: '01-cli-pptx-test.en.md',
      markdown,
    });
    const { repositoryRoot, outputRoot, target } = fixture;

    try {
      const result = await executePptxTarget(target, {
        repositoryRoot,
        outputRoot,
      });

      assert.equal(result.targetKey, 'course-01.module-01.en');

      assert.equal(result.artifact.pptxSha256, result.verification.pptxSha256);

      assert.equal(result.artifact.deckSpecSha256, result.verification.deckSpecSha256);

      assert.equal(result.artifact.sourceSha256, result.verification.sourceSha256);

      assert.equal(result.artifact.moduleContentSha256, result.verification.moduleContentSha256);

      assert.equal(result.artifact.slides, result.verification.slideCount);

      assert.ok(result.verification.slideCount > 4);

      assert.ok(result.verification.slides.every((slide) => slide.sourceNotesPresent));

      assert.ok(result.verification.slides.every((slide) => slide.outOfBoundsObjects === 0));

      const diagram = result.verification.slides.find((slide) => slide.kind === 'diagram');

      assert.ok(diagram);

      assert.ok(diagram.pictures >= 1);

      const table = result.verification.slides.find((slide) => slide.kind === 'table');

      assert.ok(table);

      assert.equal(table.tables, 1);

      const code = result.verification.slides.find((slide) => slide.kind === 'code');

      assert.ok(code);

      assert.match(result.pptxPath, /^\.artifacts\/cli-pptx-test\/output\/module\.pptx$/);

      const artifactRecord = await readFile(
        resolve(repositoryRoot, result.artifactRecordPath),
        'utf8',
      );

      const verificationRecord = await readFile(
        resolve(repositoryRoot, result.verificationPath),
        'utf8',
      );

      assert.ok(artifactRecord.includes(result.artifact.pptxSha256));

      assert.ok(verificationRecord.includes(result.verification.pptxSha256));

      const pptx = await readFile(resolve(repositoryRoot, result.pptxPath));

      assert.equal(sha256(pptx), result.artifact.pptxSha256);

      assert.equal(pptx[0], 0x50);

      assert.equal(pptx[1], 0x4b);
    } finally {
      await fixture.cleanup();
    }
  },
);
