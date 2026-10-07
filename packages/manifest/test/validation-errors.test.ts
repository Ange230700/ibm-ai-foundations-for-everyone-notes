import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ManifestSchema } from '../src/schema.js';
import { resolveTeachingSessionModules, resolveTeachingSessionSources } from '../src/teaching.js';

const source = JSON.parse(
  await readFile(new URL('../../../manifest.json', import.meta.url), 'utf8'),
);

function invalid(change: (manifest: typeof source) => void, message: RegExp) {
  const manifest = structuredClone(source);
  change(manifest);
  const result = ManifestSchema.safeParse(manifest);
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error.message, message);
}

test('manifest validation rejects duplicate courses, modules and teaching sessions', () => {
  invalid((m) => m.courses.push(structuredClone(m.courses[0])), /Duplicate course ordinal/);
  invalid(
    (m) => m.courses[0].modules.push(structuredClone(m.courses[0].modules[0])),
    /Duplicate module slug/,
  );
  invalid(
    (m) => m.courses[1].modules.push(structuredClone(m.courses[0].modules[0])),
    /Duplicate module id across manifest/,
  );
  invalid(
    (m) => m.teachingSessions.push(structuredClone(m.teachingSessions[0])),
    /Duplicate session s01/,
  );
  invalid(
    (m) => (m.teachingSessions[1].slug = m.teachingSessions[0].slug),
    /Duplicate session slug/,
  );
  invalid(
    (m) =>
      m.teachingSessions[0].canonicalModuleIds.push(m.teachingSessions[0].canonicalModuleIds[0]),
    /Duplicate canonical module/,
  );
  invalid(
    (m) =>
      (m.teachingSessions[0].canonicalModuleIds[0] = 'module_00000000-0000-4000-8000-000000000000'),
    /Unknown canonical module/,
  );
  invalid((m) => (m.teachingSessions[0].source.fr = 'outside.fr.md'), /source must be/);
});

test('configured metadata requires an identity and both MIT license fields', () => {
  invalid((m) => (m.program.id = null), /requires a program id/);
  invalid((m) => (m.program.license.holder = null), /requires MIT holder and initial year/);
  invalid((m) => (m.program.license.initialYear = null), /requires MIT holder and initial year/);
  const template = structuredClone(source);
  template.repository.status = 'template';
  template.program.id = null;
  template.program.license.holder = null;
  template.program.license.initialYear = null;
  delete template.teachingSessions;
  assert.equal(ManifestSchema.safeParse(template).success, true);
});

test('teaching source resolution requires one canonical module per referenced identity', () => {
  const manifest = ManifestSchema.parse(source);
  const session = manifest.teachingSessions![0]!;
  const resolved = resolveTeachingSessionSources(manifest, session);
  assert.equal(resolved.en.length, session.canonicalModuleIds.length);
  assert.deepEqual(resolved.canonicalModuleIds, session.canonicalModuleIds);
  assert.throws(
    () => resolveTeachingSessionModules({ ...manifest, courses: [] }, session),
    /resolved 0 times/,
  );
  assert.throws(
    () =>
      resolveTeachingSessionModules(
        { ...manifest, courses: [...manifest.courses, ...manifest.courses] },
        session,
      ),
    /resolved 2 times/,
  );
});
