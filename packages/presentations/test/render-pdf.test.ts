import assert from 'node:assert/strict';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { sha256 } from '@coursera-notes/core';

import { parseCanonicalModule, renderModulePdf, validatePdfBytes } from '../src/index.js';

const markdown = `# PDF Test Module

This is a generated PDF test.

## Learning Objectives

- Explain the PDF pipeline.

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[PDF]
\`\`\`

The diagram describes the pipeline.

## Final Summary

- Markdown can become a validated PDF artifact.
`;

test(
  'PDF renderer produces a validated artifact with provenance',
  {
    timeout: 60_000,
  },
  async () => {
    const repositoryRoot = process.cwd();

    const outputRoot = resolve(repositoryRoot, '.artifacts', 'pdf-render-test');

    const outputPath = resolve(outputRoot, 'module.en.pdf');

    const mermaidAssetRoot = resolve(outputRoot, 'mermaid');

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
      const record = await renderModulePdf(markdown, content, {
        repositoryRoot,
        outputPath,
        mermaidAssetRoot,
      });

      const bytes = await readFile(outputPath);

      validatePdfBytes(bytes, record.pdfPath);

      assert.equal(record.schemaVersion, 1);

      assert.equal(record.courseId, 'course_test');

      assert.equal(record.moduleId, 'module_test');

      assert.equal(record.language, 'en');

      assert.equal(record.sourcePath, content.sourcePath);

      assert.equal(record.sourceSha256, content.sourceSha256);

      assert.equal(record.moduleContentSha256, content.moduleContentSha256);

      assert.equal(record.diagrams, 1);

      assert.ok(record.bytes > 1024);

      assert.equal(record.pdfSha256, sha256(bytes));

      assert.match(record.stylesheetSha256, /^[a-f0-9]{64}$/);

      assert.match(record.htmlSha256, /^[a-f0-9]{64}$/);

      assert.match(record.mermaidManifestSha256, /^[a-f0-9]{64}$/);

      assert.match(record.renderInputSha256, /^[a-f0-9]{64}$/);

      assert.match(record.pdfSha256, /^[a-f0-9]{64}$/);

      assert.match(record.renderer.browserVersion, /(?:Chrome|HeadlessChrome)\//);

      assert.equal(record.renderer.name, 'chromium-via-puppeteer');

      assert.match(record.pdfPath, /^\.artifacts\/pdf-render-test\/module\.en\.pdf$/);
    } finally {
      await rm(outputRoot, {
        recursive: true,
        force: true,
      });
    }
  },
);
