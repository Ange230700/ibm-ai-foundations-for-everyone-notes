import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import * as core from '@coursera-notes/core';
import * as presentations from '@coursera-notes/presentations';
import { resolveArtifactTargets } from '../src/artifact-target.js';
import { artifactTargetManifest } from './artifact-fixture.js';

test('artifact adapters reject checksum, provenance, source-race and containment failures', async (t) => {
  const root = process.cwd();
  const target = resolveArtifactTargets(artifactTargetManifest, {
    course: '1',
    module: '1',
    language: 'en',
  })[0]!;
  const writes: string[] = [];
  let change: Record<string, unknown> = {};
  let sourceChanged = false;
  let missingDigest = false;
  const content = { sourceSha256: 'source', moduleContentSha256: 'content' };
  const artifact = {
    pdfSha256: 'pdf',
    pptxSha256: 'pptx',
    deckSpecSha256: 'deck',
    ...content,
    slides: 3,
  };
  t.mock.module('@coursera-notes/core', {
    namedExports: {
      ...core,
      atomicWrite: async (path: string) => {
        writes.push(path);
      },
    },
  });
  t.mock.module('node:fs/promises', {
    namedExports: { ...fs, readFile: async () => (sourceChanged ? 'changed' : 'markdown') },
  });
  t.mock.module('@coursera-notes/presentations', {
    namedExports: {
      ...presentations,
      extractCanonicalModule: async () =>
        sourceChanged ? { ...content, sourceSha256: 'changed' } : content,
      renderModulePdf: async () => artifact,
      verifyModulePdf: async () => ({ ...artifact, ...change }),
      renderNativePptx: async () => artifact,
      verifyNativePptx: async () => ({ ...artifact, slideCount: 3, ...change }),
      renderModuleMermaidAssets: async () => ({
        assets: [{ diagramId: 'diagram', svgPath: 'diagram.svg', svgSha256: 'svg' }],
      }),
      synthesizeDeckSpec: () => ({ slides: [] }),
    },
  });
  t.mock.module('../src/artifact-execution.js', {
    namedExports: {
      prepareArtifactExecution: async () => ({
        repositoryRoot: root,
        sourcePath: resolve(root, 'source.md'),
        artifactPath: resolve(root, 'output', 'artifact'),
        artifactRecordPath: resolve(root, 'output', 'artifact.json'),
        verificationPath: resolve(root, 'output', 'verification.json'),
        mermaidAssetRoot: resolve(root, 'output', 'mermaid'),
        markdown: 'markdown',
        content: missingDigest ? {} : content,
      }),
      repositoryRelativeArtifactPath: (base: string, path: string) => path.slice(base.length + 1),
    },
  });
  const { executePdfTarget } = await import('../src/artifact-pdf.js');
  const { executePptxTarget } = await import('../src/artifact-pptx.js');
  const reset = () => {
    change = {};
    sourceChanged = false;
    missingDigest = false;
    writes.length = 0;
  };
  await t.test(
    'PDF records are written only after independent hashes and provenance agree',
    async () => {
      for (const [field, message] of [
        ['pdfSha256', /checksum/],
        ['sourceSha256', /provenance/],
        ['moduleContentSha256', /provenance/],
      ] as const) {
        reset();
        change = { [field]: 'stale' };
        await assert.rejects(executePdfTarget(target), message);
        assert.deepEqual(writes, []);
      }
      reset();
      assert.equal((await executePdfTarget(target)).targetKey, target.key);
      assert.equal(writes.length, 2);
    },
  );
  await t.test(
    'PPTX records require source identity, deck identity, slide count and stable source bytes',
    async () => {
      for (const [field, message] of [
        ['pptxSha256', /checksum/],
        ['deckSpecSha256', /DeckSpec checksum/],
        ['sourceSha256', /provenance/],
        ['moduleContentSha256', /provenance/],
        ['slideCount', /slide count/],
      ] as const) {
        reset();
        change = { [field]: 'stale' };
        await assert.rejects(executePptxTarget(target), message);
        assert.deepEqual(writes, []);
      }
      reset();
      missingDigest = true;
      await assert.rejects(executePptxTarget(target), /digest is missing/);
      reset();
      sourceChanged = true;
      await assert.rejects(executePptxTarget(target), /Markdown changed/);
      reset();
      assert.equal((await executePptxTarget(target)).targetKey, target.key);
      assert.equal(writes.length, 2);
    },
  );
});

test('verification and visual-QA adapters contain paths and validate evidence hashes', async (t) => {
  const root = process.cwd();
  const target = resolveArtifactTargets(artifactTargetManifest, {
    course: '1',
    module: '1',
    language: 'en',
  })[0]!;
  let mismatch = false;
  const pageCalls: Array<Record<string, unknown>> = [];
  const pptxCalls: Array<Record<string, unknown>> = [];
  t.mock.module('@coursera-notes/core', {
    namedExports: { ...core, atomicWrite: async () => undefined },
  });
  t.mock.module('node:fs/promises', { namedExports: { ...fs, readFile: async () => 'markdown' } });
  t.mock.module('@coursera-notes/presentations', {
    namedExports: {
      ...presentations,
      extractCanonicalModule: async () => ({}),
      synthesizeDeckSpec: () => ({}),
      verifyModulePdf: async () => ({ pdfSha256: 'pdf' }),
      verifyNativePptx: async () => ({ pptxSha256: 'pptx' }),
      renderPdfPages: async (options: Record<string, unknown>) => {
        pageCalls.push(options);
        return { pdfSha256: 'pdf' };
      },
      createPdfContactSheets: async () => ({ pdfSha256: mismatch ? 'stale' : 'pdf' }),
      renderNativePptxVisualQa: async (_spec: unknown, options: Record<string, unknown>) => {
        pptxCalls.push(options);
        return {};
      },
    },
  });
  const { verifyArtifactTarget } = await import('../src/artifact-verify.js?integrity');
  const { executeVisualQaTarget } = await import('../src/artifact-visual-qa.js?integrity');
  for (const format of ['pdf', 'pptx'] as const) {
    assert.equal((await verifyArtifactTarget(target, format)).format, format);
    assert.equal((await executeVisualQaTarget(target, format)).format, format);
    await assert.rejects(
      verifyArtifactTarget({ ...target, sourcePath: '../escape.md' }, format, {
        repositoryRoot: root,
      }),
      /remain inside/,
    );
    await assert.rejects(
      verifyArtifactTarget({ ...target, sourcePath: '..' }, format, { repositoryRoot: root }),
      /remain inside/,
    );
    const escaped = { ...target, course: { ...target.course, id: '../../../../escape' } };
    await assert.rejects(
      verifyArtifactTarget(escaped, format, { repositoryRoot: root }),
      /remain inside/,
    );
    await assert.rejects(
      executeVisualQaTarget(escaped, format, { repositoryRoot: root }),
      /remain inside/,
    );
  }
  await assert.rejects(
    executeVisualQaTarget({ ...target, sourcePath: '../escape.md' }, 'pptx', {
      repositoryRoot: root,
    }),
    /remain inside/,
  );
  await assert.rejects(
    executeVisualQaTarget({ ...target, sourcePath: '..' }, 'pptx', { repositoryRoot: root }),
    /remain inside/,
  );
  assert.equal(pageCalls[0]!.dpi, 200);
  assert.equal(pptxCalls[0]!.columns, 2);
  await executeVisualQaTarget(target, 'pptx', {
    repositoryRoot: root,
    dpi: 150,
    columns: 3,
    pagesPerSheet: 12,
    thumbnailWidth: 400,
    libreOfficePath: 'custom-soffice',
  });
  assert.equal(pptxCalls.at(-1)!.libreOfficePath, 'custom-soffice');
  mismatch = true;
  await assert.rejects(
    executeVisualQaTarget(target, 'pdf', { repositoryRoot: root }),
    /checksum mismatch/,
  );
});
