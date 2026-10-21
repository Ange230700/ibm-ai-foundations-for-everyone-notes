import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import test from 'node:test';
import * as core from '@coursera-notes/core';
import * as manifestApi from '@coursera-notes/manifest';
import * as pdfApi from '@coursera-notes/presentations';

interface TestRecord {
  target: Record<string, string>;
  maintainedSource: {
    path: string;
    sha256: string;
    contentRelationship: string;
    editorialStatus: string;
  };
  generatedOutput: { path: string; sha256: string };
  renderer: { version: number; rendererVersion: number };
  canonicalSources: unknown[];
  sourceSha256: string;
  stylesheetSha256: string;
  htmlSha256: string;
  workflow: { maximumCharactersPerChunk: number };
  chunks: Array<{ path: string }>;
  pronunciationNotes: string[];
  durationEstimate: { estimatedSeconds: number };
}
let sequence = 0;

test('delivery workflows preserve authored sources and reject stale or corrupted evidence', async (t) => {
  const root = core.repositoryRoot();
  const original = await manifestApi.readManifest();
  let manifest = structuredClone(original);
  const files = new Map<string, string | Buffer>();
  const messages: string[] = [];
  let canonicalChanged = false;
  let sourceChanged = false;
  let ioError = '';
  const pdfBytes = Buffer.from('test PDF');
  const opts = () => ({
    repositoryRoot: root,
    sourcePath: sourcePath(),
    outputPath: outputPath('pdf'),
    profile: 'document' as const,
    language: 'en' as const,
  });
  const session = () => manifest.teachingSessions!.find((s) => s.id === 's06')!;
  const sourcePath = () => session().deliveryVariants!.document!.en!.source;
  const base = (profile = 'document', lang = 'en') =>
    resolve(root, '.artifacts/delivery-variants/s06', profile, lang);
  const outputPath = (format = 'txt', profile = 'document') =>
    resolve(base(profile), `${profile}.${format}`);
  const recordPath = (profile = 'document', format = 'txt') =>
    resolve(base(profile), `${profile}.${format}.artifact.json`);
  const json = (path: string) => JSON.parse(String(files.get(path)));
  const mutate = (path: string, change: (record: TestRecord) => void) => {
    const value = json(path);
    change(value);
    files.set(path, JSON.stringify(value));
  };
  const verification = () => ({ pdfSha256: core.sha256(pdfBytes), pages: 2 });
  t.mock.module('@coursera-notes/core', {
    namedExports: {
      ...core,
      atomicWrite: async (path: string, text: string) => {
        files.set(path, text);
      },
    },
  });
  t.mock.module('@coursera-notes/manifest', {
    namedExports: { ...manifestApi, readManifest: async () => manifest },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      readFile: async (path: string, encoding?: BufferEncoding) => {
        if (ioError && path.includes('.artifact.json')) throw new Error(ioError);
        if (files.has(path)) {
          const value = files.get(path)!;
          return encoding ? String(value) : Buffer.from(value);
        }
        if (path.includes('/.artifacts/'))
          throw Object.assign(new Error('missing'), { code: 'ENOENT' });
        const bytes = await fs.readFile(path);
        if (canonicalChanged && path.includes('/courses/')) return Buffer.from('canonical changed');
        if (sourceChanged && path.includes('/deliveries/'))
          return encoding
            ? String(bytes) + '\nChanged.'
            : Buffer.concat([bytes, Buffer.from('\nChanged.')]);
        return encoding ? bytes.toString(encoding) : bytes;
      },
    },
  });
  t.mock.module('@coursera-notes/presentations', {
    namedExports: {
      ...pdfApi,
      renderAuthoredDocumentPdf: async (
        source: string,
        options: Parameters<typeof pdfApi.renderAuthoredDocumentPdf>[1],
      ) => {
        files.set(options.outputPath, pdfBytes);
        return {
          ...pdfApi.authoredDocumentRenderIdentity(source, options),
          sourceSha256: core.sha256(source),
          renderer: {
            name: 'chromium-via-puppeteer',
            rendererVersion: pdfApi.AUTHORED_DOCUMENT_RENDERER_VERSION,
          },
          pdfPath: core.toPosixPath(relative(root, options.outputPath)),
          pdfSha256: core.sha256(pdfBytes),
          bytes: pdfBytes.length,
        };
      },
      verifyAuthoredDocumentPdf: async () => verification(),
      renderPdfPages: async () => ({ pdfSha256: core.sha256(pdfBytes), pageCount: 2 }),
      createPdfContactSheets: async () => ({ sheets: ['sheet.png'] }),
    },
  });
  t.mock.method(console, 'log', (message: string) => {
    messages.push(message);
  });
  const argv = process.argv;
  const run = async (
    command: string,
    profile = 'document',
    format?: string,
    extra: string[] = [],
  ) => {
    process.argv = [
      'node',
      'delivery-artifact.ts',
      command,
      `--profile=${profile}`,
      ...(format ? [`--format=${format}`] : []),
      ...extra,
    ];
    await import(`../src/delivery-artifact.js?workflow=${sequence++}`);
  };
  const selected = ['--session=s06', '--lang=en'];
  const build = (profile = 'document', format = 'txt', extra = selected) =>
    run('build', profile, format, extra);
  const verify = (profile = 'document', format = 'txt') => run('verify', profile, format, selected);
  try {
    await t.test(
      'plans absent and registered optional variants without language fallback',
      async () => {
        await run('plan');
        assert.equal(messages.filter((m) => m.startsWith('PLAN')).length, 4);
        await run('plan', 'document', 'txt', selected);
        assert.match(messages.at(-1)!, /not-built/);
        await build();
        await verify();
        await run('plan', 'document', 'txt', selected);
        assert.match(messages.at(-1)!, /current-canonical-sources/);
        canonicalChanged = true;
        await run('plan', 'document', 'txt', selected);
        assert.match(messages.at(-1)!, /NEEDS-EDITORIAL-REVIEW/);
        await assert.rejects(build(), /needs editorial review/);
        await assert.rejects(verify(), /needs editorial review/);
        session().deliveryVariants!.document!.en!.editorialStatus = 'reviewed';
        await build();
        await verify();
        canonicalChanged = false;
        manifest = structuredClone(original);
        files.clear();
        delete session().deliveryVariants;
        await run('plan', 'document', 'txt');
        assert.match(messages.at(-1)!, /No registered/);
        await assert.rejects(run('plan', 'document', 'txt', selected), /no document variant/);
        manifest.teachingSessions = [];
        await assert.rejects(run('plan'), /No teaching session matched manifest/);
        await assert.rejects(
          run('plan', 'document', undefined, ['--session=s99']),
          /No teaching session matched s99/,
        );
        delete manifest.teachingSessions;
        await assert.rejects(run('plan'), /No teaching session/);
        manifest = structuredClone(original);
        process.argv = ['node', 'delivery-artifact.ts', 'plan'];
        await assert.rejects(
          import(`../src/delivery-artifact.js?workflow=${sequence++}`),
          /Select an editorial profile/,
        );
        ioError = 'storage failure';
        await assert.rejects(run('plan', 'document', 'txt', selected), /storage failure/);
        await assert.rejects(build(), /storage failure/);
        await assert.rejects(verify(), /storage failure/);
        ioError = '';
        const selectedSession = session();
        const previousId = selectedSession.id;
        selectedSession.id = '../../../../../outside';
        await assert.rejects(run('plan', 'document', 'txt'), /must remain inside/);
        selectedSession.id = previousId;
      },
    );
    await t.test('verifies TXT identity, not just file existence', async () => {
      files.clear();
      await assert.rejects(verify(), /build it first/);
      await build();
      const snapshot = new Map(files);
      const cases: Array<[(r: TestRecord) => void, RegExp]> = [
        [
          (r) => {
            r.maintainedSource.path = 'other';
          },
          /changed since/,
        ],
        [
          (r) => {
            r.maintainedSource.sha256 = 'old';
          },
          /changed since/,
        ],
        [
          (r) => {
            r.canonicalSources = [];
          },
          /needs editorial review/,
        ],
        ...['sessionId', 'language', 'profile', 'format'].map(
          (key) =>
            [
              (r: TestRecord) => {
                r.target[key] = 'other';
              },
              /target mismatch/,
            ] as [(r: TestRecord) => void, RegExp],
        ),
        [
          (r) => {
            r.generatedOutput.path = '../outside';
          },
          /identity mismatch/,
        ],
        [
          (r) => {
            r.maintainedSource.contentRelationship = 'translation';
          },
          /identity mismatch/,
        ],
        [
          (r) => {
            r.maintainedSource.editorialStatus = 'reviewed';
          },
          /identity mismatch/,
        ],
        [
          (r) => {
            r.generatedOutput.sha256 = 'old';
          },
          /Generated TXT changed/,
        ],
        [
          (r) => {
            r.renderer.version = 99;
          },
          /renderer identity mismatch/,
        ],
      ];
      for (const [change, expected] of cases) {
        files.clear();
        for (const [k, v] of snapshot) files.set(k, v);
        mutate(recordPath(), change);
        await assert.rejects(verify(), expected);
      }
      files.clear();
      for (const [k, v] of snapshot) files.set(k, v);
      sourceChanged = true;
      await assert.rejects(verify(), /changed since/);
      sourceChanged = false;
      files.set(outputPath(), 'corrupt');
      await assert.rejects(verify(), /Stale TXT/);
      files.clear();
      await build('reference');
      await verify('reference');
      files.clear();
      await build('document', 'txt', []);
      assert.ok(files.has(resolve(base('document', 'fr'), 'document.txt.artifact.json')));
    });
    await t.test(
      'PDF build, independent verification and visual QA bind renderer identity',
      async () => {
        files.clear();
        await build('document', 'pdf');
        await verify('document', 'pdf');
        const renderPath = resolve(base(), 'document.pdf.render.json');
        const originalRender = files.get(renderPath)!;
        for (const key of ['sourceSha256', 'stylesheetSha256', 'htmlSha256', 'renderer']) {
          files.set(renderPath, originalRender);
          mutate(renderPath, (r) => {
            if (key === 'renderer') r.renderer.rendererVersion = 99;
            else r[key] = 'stale';
          });
          await assert.rejects(verify('document', 'pdf'), /Stale PDF renderer provenance/);
        }
        files.set(renderPath, originalRender);
        await run('visual-qa', 'document', 'pdf', selected);
        assert.match(messages.at(-1)!, /pages=2 sheets=1/);
        assert.ok(files.has(resolve(base(), 'visual-qa/visual-qa.json')));
        assert.equal(pdfApi.authoredDocumentRenderIdentity('text', opts()).htmlSha256.length, 64);
      },
    );
    await t.test(
      'narration writes ordered spoken chunks and detects production corruption',
      async () => {
        files.clear();
        await build('narration');
        await verify('narration');
        const productionPath = resolve(base('narration'), 'production-manifest.json');
        const production = String(files.get(productionPath));
        assert.ok(json(productionPath).chunks.length > 0);
        assert.ok(
          !String(files.get(outputPath('txt', 'narration'))).includes('pronunciationNotes'),
        );
        mutate(productionPath, (r) => {
          r.sourceSha256 = 'stale';
        });
        await assert.rejects(verify('narration'), /Stale narration/);
        files.set(productionPath, production);
        mutate(productionPath, (r) => {
          r.canonicalSources = [];
        });
        await assert.rejects(verify('narration'), /Stale narration/);
        files.clear();
        await build('narration', 'txt', [...selected, '--chunk-limit=1600']);
        await verify('narration');
        const snapshot = new Map(files);
        for (const change of [
          (r: TestRecord) => {
            r.workflow.maximumCharactersPerChunk = 0;
          },
          (r: TestRecord) => {
            r.workflow.maximumCharactersPerChunk = 2401;
          },
          (r: TestRecord) => {
            r.workflow.maximumCharactersPerChunk = 1.5;
          },
          (r: TestRecord) => {
            r.chunks = [];
          },
          (r: TestRecord) => {
            r.pronunciationNotes = ['changed'];
          },
          (r: TestRecord) => {
            r.durationEstimate.estimatedSeconds = 0;
          },
        ]) {
          files.clear();
          for (const [k, v] of snapshot) files.set(k, v);
          mutate(productionPath, change);
          await assert.rejects(verify('narration'), /Invalid narration|Stale narration chunk/);
        }
        files.clear();
        for (const [k, v] of snapshot) files.set(k, v);
        const chunkPath = resolve(root, json(productionPath).chunks[0].path);
        files.set(chunkPath, 'tampered speech');
        await assert.rejects(verify('narration'), /Narration chunk changed/);
        files.delete(chunkPath);
        await assert.rejects(verify('narration'), /missing/);
        files.clear();
        for (const [k, v] of snapshot) files.set(k, v);
        delete session().deliveryVariants!.narration!.en!.production;
        await assert.rejects(verify('narration'), /Invalid narration production/);
        delete session().deliveryVariants!.narration!.en!.production;
        await assert.rejects(build('narration'), /production metadata is missing/);
      },
    );
  } finally {
    process.argv = argv;
  }
});
