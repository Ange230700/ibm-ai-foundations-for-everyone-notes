import { readFile } from 'node:fs/promises';

import { atomicWrite, canonicalJson, fromRoot } from '@coursera-notes/core';

import { manifestJsonSchema } from './schema.js';

const target = fromRoot('manifest.schema.json');
const expected = canonicalJson(manifestJsonSchema());
const check = process.argv.includes('--check');

if (check) {
  const actual = await readFile(target, 'utf8').catch(() => '');
  if (actual !== expected) {
    throw new Error('manifest.schema.json is stale. Run pnpm manifest:schema.');
  }
  console.log('PASS manifest.schema');
} else {
  await atomicWrite(target, expected);
  console.log('WROTE manifest.schema.json');
}
