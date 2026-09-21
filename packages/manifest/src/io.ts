import { readFile } from 'node:fs/promises';

import { atomicWrite, canonicalJson, fromRoot } from '@coursera-notes/core';

import { ManifestSchema, type Manifest } from './schema.js';

export const MANIFEST_PATH = fromRoot('manifest.json');

export async function readManifest(): Promise<Manifest> {
  const raw = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as unknown;
  return ManifestSchema.parse(raw);
}

export async function writeManifest(manifest: Manifest): Promise<void> {
  const validated = ManifestSchema.parse(manifest);
  await atomicWrite(MANIFEST_PATH, canonicalJson(validated));
}
