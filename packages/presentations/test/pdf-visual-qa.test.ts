import assert from 'node:assert/strict';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  createPdfContactSheets,
  parseCanonicalModule,
  renderModulePdf,
  renderPdfPages,
} from '../src/index.js';

const markdown = `# Visual QA Test

This PDF is rendered to images for visual inspection.

## Learning Objectives

- Render PDF pages.
- Build contact sheets.

## Concept Map

\`\`\`mermaid
flowchart LR
    A[PDF] --> B[PNG]
    B --> C[Contact sheet]
\`\`\`

The pipeline supports visual QA.

## Final Summary

- Generated PDF pages can be visually inspected.
`;

test(
  'PDF visual QA renders contiguous PNG pages and contact sheets',
  {
    timeout: 60_000,
  },
  async () => {
    const repositoryRoot = process.cwd();

    const outputRoot = resolve(repositoryRoot, '.artifacts', 'pdf-visual-qa-test');

    const pdfPath = resolve(outputRoot, 'module.en.pdf');

    const pageRoot = resolve(outputRoot, 'pages');

    const contactRoot = resolve(outputRoot, 'contact-sheets');

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
      const pdf = await renderModulePdf(markdown, content, {
        repositoryRoot,
        outputPath: pdfPath,
        mermaidAssetRoot: resolve(outputRoot, 'mermaid'),
      });

      const pages = await renderPdfPages({
        repositoryRoot,
        pdfPath,
        outputRoot: pageRoot,
        dpi: 96,
      });

      assert.equal(pages.pdfSha256, pdf.pdfSha256);

      assert.ok(pages.pageCount >= 2);

      assert.equal(pages.pages.length, pages.pageCount);

      for (let index = 0; index < pages.pages.length; index += 1) {
        const page = pages.pages[index];

        assert.ok(page);

        assert.equal(page.pageNumber, index + 1);

        assert.ok(page.width > 0);

        assert.ok(page.height > 0);

        assert.ok(page.bytes > 1000);

        assert.match(page.pngSha256, /^[a-f0-9]{64}$/);

        const bytes = await readFile(resolve(repositoryRoot, page.pngPath));

        assert.ok(bytes.byteLength > 1000);
      }

      const contact = await createPdfContactSheets(pages, {
        repositoryRoot,
        outputRoot: contactRoot,
        documentId: 'module-test-en',
        thumbnailWidth: 220,
        pagesPerSheet: 4,
      });

      assert.equal(contact.pdfSha256, pdf.pdfSha256);

      assert.equal(contact.pages, pages.pageCount);

      assert.ok(contact.sheets.length >= 1);

      for (const sheet of contact.sheets) {
        assert.ok(sheet.bytes > 1000);

        assert.ok(sheet.width > 0);

        assert.ok(sheet.height > 0);

        assert.match(sheet.pngSha256, /^[a-f0-9]{64}$/);
      }
    } finally {
      await rm(outputRoot, {
        recursive: true,
        force: true,
      });
    }
  },
);
