import assert from 'node:assert/strict';
import * as childProcess from 'node:child_process';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import test from 'node:test';

import * as core from '@coursera-notes/core';
import * as manifestApi from '@coursera-notes/manifest';
import * as presentationApi from '@coursera-notes/presentations';
import type { TeachingSessionContent } from '@coursera-notes/presentations';

let sequence = 0;

test('teaching CLI builds, independently verifies and animates only current artifacts', async (t) => {
  const root = core.repositoryRoot();
  const originalManifest = await manifestApi.readManifest();
  let manifest = structuredClone(originalManifest);
  const contents = new Map<string, TeachingSessionContent>();
  const writes = new Map<string, string>();
  const output: string[] = [];
  const sourceReads = new Map<string, number>();
  let corruptedField = '';
  let checksumMismatch = '';
  let sourceRace = false;
  let animationExit: number | null = 0;
  let animationError = false;
  let animationStdout: string | undefined = 'ANIMATION_OUTPUT_FILE=session-animated.pptx\n';
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const originalArgv = process.argv;

  const expectedPptx = async (spec: ReturnType<typeof presentationApi.teachingDeckSpec>) => ({
    pptxSha256: 'pptx-hash',
    sourceSha256: spec.sourceSha256,
    moduleContentSha256: spec.moduleContentSha256,
    deckSpecSha256: presentationApi.deckSpecSha256(spec),
    visualAssets: await Promise.all(
      spec.slides
        .filter((slide) => slide.visual)
        .map(async (slide) => ({
          slideId: slide.slideId,
          path: slide.visual!.path,
          sha256: core.sha256(await fs.readFile(resolve(root, slide.visual!.path))),
        })),
    ),
    slides: spec.slides.length,
    slideCount: spec.slides.length,
  });
  const expectedPdf = async (content: TeachingSessionContent) => ({
    pdfSha256: 'pdf-hash',
    sourceSha256: content.sourceSha256,
    contentSha256: content.contentSha256,
    brandLogoSha256: core.sha256(
      await fs.readFile(resolve(root, 'packages/presentations/assets/brand/kraak/kraak-logo.png')),
    ),
    htmlSha256: core.sha256('projected html'),
  });
  t.mock.module('@coursera-notes/core', {
    namedExports: {
      ...core,
      atomicWrite: async (path: string, value: string) => {
        writes.set(path, value);
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
        if (path.endsWith('pdf-artifact.json') || path.endsWith('pptx-artifact.json')) {
          const match = path.replaceAll('\\', '/').match(/teaching-sessions\/(s\d{2})\/(en|fr)/)!;
          const content = contents.get(`${match[1]}/${match[2]}`)!;
          const record: Record<string, unknown> = path.endsWith('pdf-artifact.json')
            ? await expectedPdf(content)
            : await expectedPptx(presentationApi.teachingDeckSpec(content));
          if (corruptedField)
            record[corruptedField] = corruptedField === 'visualAssets' ? [] : 'stale';
          return JSON.stringify(record);
        }
        const reads = (sourceReads.get(path) ?? 0) + 1;
        sourceReads.set(path, reads);
        if (sourceRace && path.replaceAll('\\', '/').endsWith('/en/session.md') && reads > 1)
          return 'changed source';
        return fs.readFile(path, encoding);
      },
    },
  });
  t.mock.module('@coursera-notes/presentations', {
    namedExports: {
      ...presentationApi,
      parseTeachingSession: (...args: Parameters<typeof presentationApi.parseTeachingSession>) => {
        const content = presentationApi.parseTeachingSession(...args);
        contents.set(`${content.id}/${content.language}`, content);
        return content;
      },
      renderNativePptx: async (spec: ReturnType<typeof presentationApi.teachingDeckSpec>) => ({
        ...(await expectedPptx(spec)),
        ...(checksumMismatch === 'pptx'
          ? { pptxSha256: 'mismatch' }
          : checksumMismatch === 'deck'
            ? { deckSpecSha256: 'mismatch' }
            : {}),
      }),
      verifyNativePptx: async (spec: ReturnType<typeof presentationApi.teachingDeckSpec>) =>
        expectedPptx(spec),
      renderTeachingPdf: async (content: TeachingSessionContent) => ({
        ...(await expectedPdf(content)),
        ...(checksumMismatch === 'pdf' ? { pdfSha256: 'mismatch' } : {}),
      }),
      verifyTeachingPdf: async (content: TeachingSessionContent) => ({
        ...(await expectedPdf(content)),
        pages: content.slides.length,
      }),
      renderTeachingPdfHtml: () => 'projected html',
      resolveTeachingPdfVisuals: async () => new Map(),
      renderPdfPages: async () => ({
        pdfSha256: checksumMismatch === 'visual' ? 'mismatch' : 'pdf-hash',
        pageCount: 30,
      }),
      createPdfContactSheets: async () => ({ sheets: [{ path: 'sheet.png' }] }),
      renderNativePptxVisualQa: async () => ({ pageRender: { pageCount: 30 } }),
    },
  });
  const spawnCalls: Array<{ executable: string; args: string[] }> = [];
  t.mock.module('node:child_process', {
    namedExports: {
      ...childProcess,
      spawn: (executable: string, args: string[]) => {
        spawnCalls.push({ executable, args });
        const child = Object.assign(new EventEmitter(), {
          stdout: animationStdout === undefined ? undefined : new PassThrough(),
        });
        queueMicrotask(() => {
          if (animationError) child.emit('error', new Error('PowerShell spawn failed'));
          else {
            if (child.stdout) child.stdout.write(animationStdout);
            child.emit('close', animationExit);
          }
        });
        return child;
      },
    },
  });
  t.mock.method(console, 'log', (...args: unknown[]) => output.push(args.join(' ')));
  const reset = () => {
    manifest = structuredClone(originalManifest);
    corruptedField = '';
    checksumMismatch = '';
    sourceRace = false;
    animationExit = 0;
    animationError = false;
    animationStdout = 'ANIMATION_OUTPUT_FILE=session-animated.pptx\n';
    writes.clear();
    output.length = 0;
    sourceReads.clear();
    spawnCalls.length = 0;
  };
  const run = async (args: string[]) => {
    process.argv = ['node', 'teaching-artifact', ...args];
    await import(`../src/teaching-artifact.js?workflow=${sequence++}`);
  };
  try {
    await t.test(
      'build and verify support both projected formats and bilingual defaults',
      async () => {
        for (const command of ['build', 'verify']) {
          reset();
          await run([command, '--session=s01']);
          assert.equal(output.filter((line) => /^(WROTE|VERIFIED)/.test(line)).length, 4);
          if (command === 'build') assert.equal(writes.size, 8);
        }
      },
    );
    await t.test(
      'each stale provenance field is rejected before accepting an artifact',
      async () => {
        for (const [format, fields] of [
          ['pdf', ['pdfSha256', 'sourceSha256', 'contentSha256', 'brandLogoSha256', 'htmlSha256']],
          [
            'pptx',
            ['pptxSha256', 'sourceSha256', 'moduleContentSha256', 'deckSpecSha256', 'visualAssets'],
          ],
        ] as const) {
          for (const field of fields) {
            reset();
            corruptedField = field;
            await assert.rejects(
              run(['verify', '--session=s01', '--lang=en', `--format=${format}`]),
              /Stale teaching/,
            );
            assert.equal(writes.size, 0);
          }
        }
        for (const mismatch of ['pdf', 'pptx', 'deck']) {
          reset();
          checksumMismatch = mismatch;
          await assert.rejects(
            run([
              'build',
              '--session=s01',
              '--lang=en',
              `--format=${mismatch === 'pdf' ? 'pdf' : 'pptx'}`,
            ]),
            /checksum mismatch/,
          );
          assert.equal(writes.size, 0);
        }
        reset();
        sourceRace = true;
        await assert.rejects(run(['build', '--session=s01', '--lang=en']), /changed during build/);
      },
    );
    await t.test(
      'visual QA writes evidence for each format and detects a changed PDF',
      async () => {
        reset();
        await run(['visual-qa', '--session=s01', '--lang=en']);
        assert.equal(writes.size, 3);
        assert.equal(output.length, 2);
        assert.ok([...writes.keys()].some((path) => path.endsWith('contact-sheets.json')));
        reset();
        checksumMismatch = 'visual';
        await assert.rejects(
          run(['visual-qa', '--session=s01', '--lang=en', '--format=pdf']),
          /visual-QA checksum mismatch/,
        );
      },
    );
    await t.test('session discovery and source namespaces fail explicitly', async () => {
      reset();
      delete manifest.teachingSessions;
      await assert.rejects(run(['plan']), /No teaching session matched manifest/);
      reset();
      manifest.teachingSessions![0]!.source.en = 'wrong-source.en.md';
      await assert.rejects(run(['plan', '--session=s01']), /source must be/);
    });
    await t.test(
      'native animation checks platform and current input before invoking PowerPoint',
      async () => {
        reset();
        Object.defineProperty(process, 'platform', { value: 'linux' });
        await assert.rejects(run(['animate', '--lang=en']), /desktop PowerPoint on Windows/);
        Object.defineProperty(process, 'platform', { value: 'win32' });
        for (const field of [
          'pptxSha256',
          'sourceSha256',
          'moduleContentSha256',
          'deckSpecSha256',
          'visualAssets',
        ]) {
          reset();
          corruptedField = field;
          await assert.rejects(run(['animate', '--session=s01', '--lang=en']), /Stale S01 PPTX/);
          assert.equal(spawnCalls.length, 0);
        }
        for (const session of ['s01', 's02', 's03']) {
          reset();
          await run(['animate', `--session=${session}`, '--lang=en', '--format=pptx']);
          assert.equal(spawnCalls[0]!.executable, 'powershell.exe');
          assert.ok(
            spawnCalls[0]!.args.includes(resolve(root, `scripts/teaching-animate-${session}.ps1`)),
          );
          const record = JSON.parse(
            [...writes.entries()].find(([path]) => path.endsWith('pptx-animation.json'))![1],
          );
          assert.equal(record.sessionId, session);
          assert.equal(record.outputFile, 'session-animated.pptx');
          assert.equal(record.animatedSlideIds.length, record.slideCount);
          assert.match(output[0]!, new RegExp(`ANIMATED ${session}/en`));
        }
        reset();
        animationError = true;
        await assert.rejects(run(['animate', '--lang=en']), /PowerShell spawn failed/);
        reset();
        animationExit = 1;
        await assert.rejects(run(['animate', '--lang=en']), /animation failed.*1/);
        reset();
        animationExit = null;
        await assert.rejects(run(['animate', '--lang=en']), /animation failed.*null/);
        reset();
        animationStdout = '';
        await assert.rejects(run(['animate', '--session=s03', '--lang=en']), /did not report/);
        reset();
        animationStdout = undefined;
        await run(['animate', '--session=s01', '--lang=en']);
        assert.equal(
          JSON.parse(
            [...writes.entries()].find(([path]) => path.endsWith('pptx-animation.json'))![1],
          ).outputFile,
          'session-animated.pptx',
        );
      },
    );
  } finally {
    process.argv = originalArgv;
    Object.defineProperty(process, 'platform', platform);
  }
});
