import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import test from 'node:test';
import * as manifestApi from '@coursera-notes/manifest';
import * as textApi from '../src/render-markdown-text.js';

test('text exports validate course selection and generated text before writing files', async (t) => {
  const original = await manifestApi.readManifest();
  let manifest = structuredClone(original);
  let invalid = false;
  let writes = 0;
  const argv = process.argv;
  t.mock.module('@coursera-notes/manifest', {
    namedExports: { ...manifestApi, readManifest: async () => manifest },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      readFile: async () => '# Content',
      writeFile: async () => {
        writes++;
      },
    },
  });
  t.mock.module('../src/render-markdown-text.js', {
    namedExports: { ...textApi, renderMarkdownText: () => (invalid ? '' : 'Text\n') },
  });
  t.mock.method(console, 'log', () => undefined);
  let sequence = 0;
  const run = async (args: string[]) => {
    process.argv = ['node', 'export-txt', ...args];
    await import(`../src/export-txt.js?errors=${sequence++}`);
  };
  try {
    await assert.rejects(run(['--course=missing']), /Unknown course/);
    invalid = true;
    await assert.rejects(run(['--course=1']), /TXT must be non-empty/);
    assert.equal(writes, 0);
    invalid = false;
    await run(['--course=1']);
    await run([`--course=${manifest.courses[0]!.id}`]);
    assert.equal(writes, 4);
    manifest = {
      ...original,
      courses: original.courses.slice(0, 1).map((course) => ({ ...course, status: 'archived' })),
    };
    await run([]);
    assert.equal(writes, 4);
  } finally {
    process.argv = argv;
  }
});
