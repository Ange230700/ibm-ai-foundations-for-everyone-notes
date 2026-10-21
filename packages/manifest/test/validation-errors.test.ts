import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ManifestSchema } from '../src/schema.js';
import {
  resolveDeliveryVariant,
  resolveTeachingSessionModules,
  resolveTeachingSessionSources,
} from '../src/teaching.js';

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

test('delivery variants require registered language sources and valid canonical provenance', () => {
  invalid(
    (m) => (m.teachingSessions[5].deliveryVariants.document.en.source = 'outside/document.md'),
    /document en source must be/,
  );
  invalid(
    (m) =>
      (m.teachingSessions[5].deliveryVariants.reference.fr.canonicalModuleIds[0] =
        'module_00000000-0000-4000-8000-000000000000'),
    /Unknown canonical module/,
  );
  invalid(
    (m) => delete m.teachingSessions[5].deliveryVariants.narration.en.production,
    /requires production metadata/,
  );

  const manifest = ManifestSchema.parse(source);
  const session = manifest.teachingSessions![5]!;
  const resolved = resolveDeliveryVariant(manifest, session, 'document', 'en');
  assert.equal(
    resolved.sourcePath,
    'teaching/sessions/s06-security-privacy-and-responsibility/deliveries/document/en.md',
  );
  assert.deepEqual(
    resolved.canonicalModules.map((module) => module.moduleId),
    ['module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c'],
  );
  assert.throws(
    () => resolveDeliveryVariant(manifest, manifest.teachingSessions![0]!, 'document', 'en'),
    /has no document variant for en/,
  );
});

test('delivery provenance rejects duplicate or ambiguous canonical modules', () => {
  invalid((m) => {
    const ids = m.teachingSessions[5].deliveryVariants.document.en.canonicalModuleIds;
    ids.push(ids[0]);
  }, /Duplicate canonical module/);
  const manifest = ManifestSchema.parse(source);
  const session = manifest.teachingSessions![5]!;
  assert.throws(
    () => resolveDeliveryVariant({ ...manifest, courses: [] }, session, 'document', 'en'),
    /resolved 0 times/,
  );
  assert.throws(
    () =>
      resolveDeliveryVariant(
        { ...manifest, courses: [...manifest.courses, ...manifest.courses] },
        session,
        'document',
        'en',
      ),
    /resolved 2 times/,
  );
  delete session.deliveryVariants!.reference!.fr;
  assert.equal(ManifestSchema.safeParse(manifest).success, true);
});
