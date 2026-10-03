import assert from 'node:assert/strict';
import test from 'node:test';

import { ManifestSchema, readManifest, teachingSessionSourcePath } from '@coursera-notes/manifest';

test('teaching source paths derive from session id and slug', async () => {
  const manifest = await readManifest();

  for (const session of manifest.teachingSessions ?? []) {
    assert.equal(
      session.source.en,
      teachingSessionSourcePath(session, 'en'),
      `${session.id} EN source`,
    );
    assert.equal(
      session.source.fr,
      teachingSessionSourcePath(session, 'fr'),
      `${session.id} FR source`,
    );
  }
});

test('future teaching sessions use the same namespace convention', () => {
  assert.equal(
    teachingSessionSourcePath(
      {
        id: 's04',
        slug: 'working-with-documents-and-information',
      },
      'en',
    ),
    'teaching/sessions/s04-working-with-documents-and-information/en/session.md',
  );
});

test('manifest rejects a teaching source outside its derived session namespace', async () => {
  const manifest = structuredClone(await readManifest());
  const session = manifest.teachingSessions?.[0];

  assert.ok(session);

  session.source.en = 'teaching/sessions/s99-wrong-session/en/session.md';

  const result = ManifestSchema.safeParse(manifest);

  assert.equal(result.success, false);

  if (!result.success) {
    assert.match(
      result.error.issues.map((issue) => issue.message).join('\n'),
      /Teaching session s01 en source must be teaching\/sessions\/s01-understanding-ai\/en\/session\.md/u,
    );
  }
});
