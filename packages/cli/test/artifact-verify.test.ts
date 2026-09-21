import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { executePdfTarget } from '../src/artifact-pdf.js';
import { executePptxTarget } from '../src/artifact-pptx.js';
import { verifyArtifactTarget } from '../src/artifact-verify.js';
import { createArtifactFixture } from './artifact-fixture.js';

const markdown = `# CLI Verification Test

This module validates verification-only artifact execution.

## Learning Objectives

- Verify an existing PDF artifact.
- Verify an existing native PowerPoint artifact.

## Comparison

| Artifact | Verification |
| --- | --- |
| PDF | Semantic |
| PPTX | Structural |

## Final Summary

- Verification must operate independently of generation.
`;

test(
  'verification adapter independently verifies existing PDF and PPTX artifacts',
  {
    timeout: 60_000,
  },
  async () => {
    const fixture = await createArtifactFixture({
      name: 'cli-verify-test',
      sourceFile: '01-cli-verify-test.en.md',
      markdown,
    });
    const { repositoryRoot, target } = fixture;

    try {
      const pdfOutputRoot = resolve(
        repositoryRoot,
        '.artifacts',
        'document-pdf',
        target.course.id,
        target.module.id,
        target.language,
      );

      const pptxOutputRoot = resolve(
        repositoryRoot,
        '.artifacts',
        'native-pptx',
        target.course.id,
        target.module.id,
        target.language,
      );

      const generatedPdf = await executePdfTarget(target, {
        repositoryRoot,
        outputRoot: pdfOutputRoot,
      });

      const generatedPptx = await executePptxTarget(target, {
        repositoryRoot,
        outputRoot: pptxOutputRoot,
      });

      const pdf = await verifyArtifactTarget(target, 'pdf', {
        repositoryRoot,
      });

      const pptx = await verifyArtifactTarget(target, 'pptx', {
        repositoryRoot,
      });

      assert.equal(pdf.format, 'pdf');

      assert.equal(pdf.verification.pdfSha256, generatedPdf.artifact.pdfSha256);

      assert.equal(pdf.verification.sourceSha256, generatedPdf.artifact.sourceSha256);

      assert.equal(pdf.verification.moduleContentSha256, generatedPdf.artifact.moduleContentSha256);

      assert.equal(pdf.verification.blocks.matched, pdf.verification.blocks.expected);

      assert.equal(pptx.format, 'pptx');

      assert.equal(pptx.verification.pptxSha256, generatedPptx.artifact.pptxSha256);

      assert.equal(pptx.verification.deckSpecSha256, generatedPptx.artifact.deckSpecSha256);

      assert.equal(pptx.verification.sourceSha256, generatedPptx.artifact.sourceSha256);

      assert.equal(
        pptx.verification.moduleContentSha256,
        generatedPptx.artifact.moduleContentSha256,
      );

      assert.equal(pptx.verification.slideCount, generatedPptx.artifact.slides);
    } finally {
      await fixture.cleanup();

      await rm(resolve(repositoryRoot, '.artifacts', 'document-pdf', fixture.courseId), {
        recursive: true,
        force: true,
      });

      await rm(resolve(repositoryRoot, '.artifacts', 'native-pptx', fixture.courseId), {
        recursive: true,
        force: true,
      });
    }
  },
);
