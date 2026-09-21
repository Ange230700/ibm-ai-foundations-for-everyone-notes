import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveArtifactTargets } from '../src/artifact-target.js';
import { artifactTargetManifest as manifest } from './artifact-fixture.js';

test('artifact targets default to active courses and both languages', () => {
  const targets = resolveArtifactTargets(manifest);

  assert.deepEqual(
    targets.map((target) => target.key),
    [
      'course-01.module-01.en',
      'course-01.module-01.fr',
      'course-01.module-02.en',
      'course-01.module-02.fr',
    ],
  );
});

test('artifact target selectors resolve course and module ordinals', () => {
  const targets = resolveArtifactTargets(manifest, {
    course: '1',
    module: '2',
    language: 'fr',
  });

  assert.equal(targets.length, 1);

  assert.equal(targets[0]?.module.id, 'module_core');

  assert.equal(targets[0]?.sourcePath, 'courses/01-alpha/fr/02-core.md');
});

test('artifact target selectors resolve semantic ids', () => {
  const targets = resolveArtifactTargets(manifest, {
    course: 'course_alpha',
    module: 'module_intro',
    language: 'en',
  });

  assert.equal(targets[0]?.key, 'course-01.module-01.en');
});

test('an explicitly selected archived course remains addressable', () => {
  const targets = resolveArtifactTargets(manifest, {
    course: 'course_archive',
    language: 'en',
  });

  assert.equal(targets.length, 1);

  assert.equal(targets[0]?.course.id, 'course_archive');
});

test('module selection requires one course', () => {
  assert.throws(
    () =>
      resolveArtifactTargets(manifest, {
        module: 'module_intro',
      }),
    /--module requires exactly one --course selector/,
  );
});

test('unknown selectors fail explicitly', () => {
  assert.throws(
    () =>
      resolveArtifactTargets(manifest, {
        course: 'missing',
      }),
    /Unknown course: missing/,
  );

  assert.throws(
    () =>
      resolveArtifactTargets(manifest, {
        course: '1',
        module: 'missing',
      }),
    /Unknown module missing/,
  );
});
