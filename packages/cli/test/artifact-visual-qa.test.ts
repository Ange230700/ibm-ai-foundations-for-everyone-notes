import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import type { Manifest } from '@coursera-notes/manifest';
import { resolveLibreOfficeExecutable } from '@coursera-notes/presentations';

import { executePdfTarget } from '../src/artifact-pdf.js';
import { executePptxTarget } from '../src/artifact-pptx.js';
import { resolveArtifactTargets } from '../src/artifact-target.js';
import { executeVisualQaTarget } from '../src/artifact-visual-qa.js';

const markdown = `# CLI Visual QA Test

This module validates visual-QA evidence generation.

## Learning Objectives

- Render artifact pages as images.
- Build contact sheets for human inspection.

## Comparison

| Artifact | Visual evidence |
| --- | --- |
| PDF | Page PNGs |
| PPTX | LibreOffice-rendered slide PNGs |

## Final Summary

- Visual QA evidence supports manual inspection.
`;

const manifest = {
  courses: [
    {
      id: 'course_cli_visual_qa_test',
      ordinal: 1,
      slug: 'cli-visual-qa-test',
      status: 'active',
      modules: [
        {
          id: 'module_cli_visual_qa_test',
          ordinal: 1,
          slug: 'cli-visual-qa-test',
          source: {
            en: '.artifacts/cli-visual-qa-test/source/01-cli-visual-qa-test.en.md',
            fr: '.artifacts/cli-visual-qa-test/source/01-cli-visual-qa-test.fr.md',
          },
        },
      ],
    },
  ],
} as unknown as Manifest;

async function prepareFixture() {
  const repositoryRoot = process.cwd();

  const fixtureRoot = resolve(repositoryRoot, '.artifacts', 'cli-visual-qa-test');

  const sourceRoot = resolve(fixtureRoot, 'source');

  const sourcePath = resolve(sourceRoot, '01-cli-visual-qa-test.en.md');

  await rm(fixtureRoot, {
    recursive: true,
    force: true,
  });

  await mkdir(sourceRoot, {
    recursive: true,
  });

  await writeFile(sourcePath, markdown, 'utf8');

  const [target] = resolveArtifactTargets(manifest, {
    course: 'course_cli_visual_qa_test',
    module: 'module_cli_visual_qa_test',
    language: 'en',
  });

  assert.ok(target);

  return {
    repositoryRoot,
    fixtureRoot,
    target,
  };
}

async function cleanup(repositoryRoot: string, fixtureRoot: string): Promise<void> {
  await Promise.all([
    rm(fixtureRoot, {
      recursive: true,
      force: true,
    }),
    rm(resolve(repositoryRoot, '.artifacts', 'document-pdf', 'course_cli_visual_qa_test'), {
      recursive: true,
      force: true,
    }),
    rm(resolve(repositoryRoot, '.artifacts', 'native-pptx', 'course_cli_visual_qa_test'), {
      recursive: true,
      force: true,
    }),
  ]);
}

test(
  'visual-QA adapter renders PDF pages and contact sheets',
  {
    timeout: 60_000,
  },
  async () => {
    const { repositoryRoot, fixtureRoot, target } = await prepareFixture();

    try {
      await executePdfTarget(target, {
        repositoryRoot,
        outputRoot: resolve(
          repositoryRoot,
          '.artifacts',
          'document-pdf',
          target.course.id,
          target.module.id,
          target.language,
        ),
      });

      const result = await executeVisualQaTarget(target, 'pdf', {
        repositoryRoot,
        dpi: 96,
        thumbnailWidth: 220,
        pagesPerSheet: 4,
      });

      assert.equal(result.format, 'pdf');

      assert.equal(result.pageRender.pdfSha256, result.contactSheets.pdfSha256);

      assert.equal(result.pageRender.pages.length, result.pageRender.pageCount);

      assert.ok(result.pageRender.pageCount >= 1);

      assert.ok(result.contactSheets.sheets.length >= 1);

      assert.match(result.pageRenderManifestPath, /visual-qa\/page-render\.json$/);

      assert.match(result.contactSheetManifestPath, /visual-qa\/contact-sheets\.json$/);
    } finally {
      await cleanup(repositoryRoot, fixtureRoot);
    }
  },
);

test(
  'visual-QA adapter renders PPTX evidence when LibreOffice is available',
  {
    timeout: 60_000,
  },
  async (context) => {
    let libreOffice;

    try {
      libreOffice = await resolveLibreOfficeExecutable();
    } catch {
      context.skip('LibreOffice is not available in this environment.');

      return;
    }

    const { repositoryRoot, fixtureRoot, target } = await prepareFixture();

    try {
      await executePptxTarget(target, {
        repositoryRoot,
        outputRoot: resolve(
          repositoryRoot,
          '.artifacts',
          'native-pptx',
          target.course.id,
          target.module.id,
          target.language,
        ),
      });

      const result = await executeVisualQaTarget(target, 'pptx', {
        repositoryRoot,
        libreOfficePath: libreOffice.executable,
        dpi: 96,
        thumbnailWidth: 220,
        pagesPerSheet: 4,
      });

      assert.equal(result.format, 'pptx');

      assert.equal(
        result.manifest.pageRender.pageCount,
        result.manifest.structuralVerification.slideCount,
      );

      assert.equal(result.manifest.contactSheets.pages, result.manifest.pageRender.pageCount);

      assert.equal(result.manifest.pptxSha256, result.manifest.structuralVerification.pptxSha256);

      assert.ok(result.manifest.contactSheets.sheets.length >= 1);

      assert.match(result.manifestPath, /visual-qa\/manifest\.json$/);
    } finally {
      await cleanup(repositoryRoot, fixtureRoot);
    }
  },
);
