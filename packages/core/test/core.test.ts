import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  atomicWrite,
  canonicalJson,
  fromRoot,
  occurrenceId,
  padOrdinal,
  prefixedId,
  repositoryRoot,
  sha256,
  slugify,
  toPosixPath,
} from '../src/index.js';

test('canonical JSON sorts nested objects without changing array order or scalar values', () => {
  assert.equal(
    canonicalJson({ z: [{ b: 2, a: 1 }, null, true], a: 'first' }),
    '{\n  "a": "first",\n  "z": [\n    {\n      "a": 1,\n      "b": 2\n    },\n    null,\n    true\n  ]\n}\n',
  );
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(sha256(Buffer.from('abc')), sha256('abc'));
});

test('identifiers normalize accents, punctuation, empty titles and heading occurrences', () => {
  for (const [input, expected] of [
    ['École des arts', 'ecole-des-arts'],
    ['-Alpha-', 'alpha'],
    ['Alpha!', 'alpha'],
    ['!Alpha', 'alpha'],
    ['Alpha', 'alpha'],
    ['💫', 'untitled'],
    ['', 'untitled'],
  ])
    assert.equal(slugify(input!), expected);
  for (const prefix of ['program', 'course', 'module'] as const)
    assert.match(prefixedId(prefix), new RegExp(`^${prefix}_[0-9a-f-]{36}$`));
  assert.equal(padOrdinal(3), '03');
  assert.equal(occurrenceId('diagram', ['École', 'Examples'], 3), 'diagram/ecole/examples/03');
  assert.equal(toPosixPath(String.raw`courses\en\notes.md`), 'courses/en/notes.md');
});

test('repository root overrides and atomic writes support nested text and binary files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'notes-core-'));
  const original = process.env.COURSERA_NOTES_REPOSITORY_ROOT;
  try {
    delete process.env.COURSERA_NOTES_REPOSITORY_ROOT;
    assert.equal(repositoryRoot(), fileURLToPath(new URL('../../../', import.meta.url)));
    process.env.COURSERA_NOTES_REPOSITORY_ROOT = root;
    assert.equal(repositoryRoot(), root);
    assert.equal(fromRoot('nested', 'file.txt'), join(root, 'nested', 'file.txt'));
    const path = fromRoot('nested', 'file.txt');
    await atomicWrite(path, 'first\n');
    await atomicWrite(path, Buffer.from('replacement\n'));
    assert.equal(await readFile(path, 'utf8'), 'replacement\n');
    await assert.rejects(readFile(`${path}.tmp`), { code: 'ENOENT' });
  } finally {
    if (original === undefined) delete process.env.COURSERA_NOTES_REPOSITORY_ROOT;
    else process.env.COURSERA_NOTES_REPOSITORY_ROOT = original;
    await rm(root, { recursive: true, force: true });
  }
});
