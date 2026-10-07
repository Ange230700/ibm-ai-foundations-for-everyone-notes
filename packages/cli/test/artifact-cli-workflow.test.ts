import assert from 'node:assert/strict';
import test from 'node:test';

import { artifactTargetManifest } from './artifact-fixture.js';

let sequence = 0;

test('artifact CLI validates arguments and dispatches every output mode', async (t) => {
  let manifest = structuredClone(artifactTargetManifest);
  const calls: Array<{ operation: string; key: string; format?: string }> = [];
  t.mock.module('@coursera-notes/manifest', {
    namedExports: { readManifest: async () => manifest },
  });
  const artifact = { pdfSha256: 'pdf-hash', pptxSha256: 'pptx-hash', deckSpecSha256: 'deck-hash' };
  const verification = {
    ...artifact,
    pages: 2,
    slideCount: 3,
    diagrams: 0,
    blocks: { matched: 4, expected: 4 },
  };
  const result = (key: string) => ({
    targetKey: key,
    pdfPath: 'module.pdf',
    pptxPath: 'module.pptx',
    artifactPath: 'module.pdf',
    artifactRecordPath: 'artifact.json',
    verificationPath: 'verification.json',
    artifact,
    verification,
  });
  t.mock.module('../src/artifact-pdf.js', {
    namedExports: {
      executePdfTarget: async (target: { key: string }) => {
        calls.push({ operation: 'pdf', key: target.key });
        return result(target.key);
      },
    },
  });
  t.mock.module('../src/artifact-pptx.js', {
    namedExports: {
      executePptxTarget: async (target: { key: string }) => {
        calls.push({ operation: 'pptx', key: target.key });
        return result(target.key);
      },
    },
  });
  t.mock.module('../src/artifact-verify.js', {
    namedExports: {
      verifyArtifactTarget: async (target: { key: string }, format: string) => {
        calls.push({ operation: 'verify', key: target.key, format });
        return { ...result(target.key), format };
      },
    },
  });
  t.mock.module('../src/artifact-visual-qa.js', {
    namedExports: {
      executeVisualQaTarget: async (target: { key: string }, format: string) => {
        calls.push({ operation: 'visual-qa', key: target.key, format });
        const pageRender = { pageCount: 3, pdfSha256: 'pdf-hash' };
        const contactSheets = { sheets: [{ path: 'sheet.png' }] };
        return {
          ...result(target.key),
          format,
          pageRender,
          contactSheets,
          pageRenderManifestPath: 'pages.json',
          contactSheetManifestPath: 'contact-sheets.json',
          manifestPath: 'visual-qa.json',
          manifest: {
            pptxSha256: 'pptx-hash',
            deckSpecSha256: 'deck-hash',
            pageRender,
            contactSheets,
            converter: { version: 'test-converter' },
          },
        };
      },
    },
  });
  const output: string[] = [];
  t.mock.method(console, 'log', (...args: unknown[]) => output.push(args.join(' ')));
  const originalArgv = process.argv;
  const run = async (args: string[]) => {
    output.length = 0;
    calls.length = 0;
    process.argv = ['node', 'artifact', ...args];
    await import(`../src/artifact.js?workflow=${sequence++}`);
  };
  try {
    await t.test('invalid arguments fail before invoking adapters', async () => {
      for (const [args, error] of [
        [[], /Usage:/],
        [['unknown'], /Usage:/],
        [['plan', '--bogus'], /Unknown artifact option/],
        [['plan', '--lang=de'], /Unsupported language/],
        [['plan', '--format=txt'], /Unsupported artifact format/],
        [['verify'], /requires --format/],
        [['visual-qa'], /requires --format/],
        [['pdf', '--format=pdf'], /does not accept --format/],
        [['pptx', '--format=pptx'], /does not accept --format/],
        ...['course', 'module', 'lang', 'format'].map((name) => [
          ['plan', `--${name}=en`, `--${name}=fr`],
          /Duplicate option/,
        ]),
      ] as Array<[string[], RegExp]>) {
        await assert.rejects(run(args), error);
        assert.equal(calls.length, 0);
      }
      const exit = t.mock.method(process, 'exit', (code?: number | string | null) => {
        throw new Error(`exit:${code}`);
      });
      await assert.rejects(run(['plan', '--help']), /exit:0/);
      assert.match(output[0]!, /Usage:/);
      exit.mock.restore();
    });
    await t.test('plans expose selection, format and source identities', async () => {
      await run(['plan']);
      assert.match(output[0]!, /Artifact plan: 4 target/);
      assert.ok(output.some((line) => line.includes('courses/01-alpha/fr/02-core.md')));
      await run(['plan', '--course=1', '--module=2', '--lang=fr', '--format=pptx', '--json']);
      const plan = JSON.parse(output[0]!);
      assert.equal(plan.format, 'pptx');
      assert.deepEqual(
        plan.targets.map((target: { key: string }) => target.key),
        ['course-01.module-02.fr'],
      );
      await run(['plan', '--lang=en', '--json']);
      assert.equal(JSON.parse(output[0]!).format, null);
    });
    await t.test(
      'generation, independent verification and visual QA preserve text and JSON contracts',
      async () => {
        for (const command of ['pdf', 'pptx', 'verify', 'visual-qa']) {
          for (const format of command === 'verify' || command === 'visual-qa'
            ? ['pdf', 'pptx']
            : [undefined]) {
            for (const json of [false, true]) {
              const args = [command, '--course=1', '--module=1', '--lang=en'];
              if (format) args.push(`--format=${format}`);
              if (json) args.push('--json');
              await run(args);
              assert.deepEqual(calls, [
                {
                  operation: command,
                  key: 'course-01.module-01.en',
                  ...(format ? { format } : {}),
                },
              ]);
              if (json) {
                const payload = JSON.parse(output[0]!);
                assert.equal(payload.command, command);
                assert.equal(payload.results.length, 1);
                assert.equal(payload.results[0].targetKey, 'course-01.module-01.en');
                if (command === 'pdf' || (format === 'pdf' && command === 'verify'))
                  assert.equal(payload.results[0].pdfSha256, 'pdf-hash');
                if (command === 'pptx' || (format === 'pptx' && command === 'verify'))
                  assert.equal(payload.results[0].pptxSha256, 'pptx-hash');
              } else assert.match(output[0]!, command === 'verify' ? /^PASS / : /^WROTE /);
            }
          }
        }
      },
    );
    await t.test('an empty manifest gives explicit zero-target output in every mode', async () => {
      manifest = { ...manifest, courses: [] };
      for (const command of ['pdf', 'pptx', 'verify', 'visual-qa']) {
        for (const json of [false, true]) {
          await run([
            command,
            ...(command === 'verify' || command === 'visual-qa' ? ['--format=pdf'] : []),
            ...(json ? ['--json'] : []),
          ]);
          assert.equal(calls.length, 0);
          if (json) assert.deepEqual(JSON.parse(output[0]!).results, []);
          else assert.match(output[0]!, /0 target/);
        }
      }
    });
  } finally {
    process.argv = originalArgv;
  }
});
