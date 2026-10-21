import assert from 'node:assert/strict';
import test from 'node:test';

import type { Manifest } from '@coursera-notes/manifest';

import { analyzeArtifactImpact, planTasks } from '../src/index.js';

interface CourseSeed {
  id: string;
  ordinal: number;
  slug: string;
  status: 'active' | 'archived';
  modules: Array<readonly [id: string, ordinal: number, slug: string]>;
}

const courseSeeds: CourseSeed[] = [
  {
    id: 'course_active',
    ordinal: 1,
    slug: 'active',
    status: 'active',
    modules: [
      ['module_one', 1, 'one'],
      ['module_two', 2, 'two'],
    ],
  },
  {
    id: 'course_archived',
    ordinal: 2,
    slug: 'archived',
    status: 'archived',
    modules: [['module_archived', 1, 'archived']],
  },
];

const manifest = {
  courses: courseSeeds.map((course) => {
    const coursePrefix = String(course.ordinal).padStart(2, '0');
    const sourceRoot = `courses/${coursePrefix}-${course.slug}`;

    return {
      id: course.id,
      ordinal: course.ordinal,
      slug: course.slug,
      status: course.status,
      modules: course.modules.map(([id, ordinal, slug]) => {
        const modulePrefix = String(ordinal).padStart(2, '0');
        const sourceFile = `${modulePrefix}-${slug}.md`;

        return {
          id,
          ordinal,
          slug,
          source: {
            en: `${sourceRoot}/en/${sourceFile}`,
            fr: `${sourceRoot}/fr/${sourceFile}`,
          },
        };
      }),
    };
  }),
} as unknown as Manifest;

test('artifact impact is empty for a clean working tree', () => {
  const report = analyzeArtifactImpact(manifest, []);

  assert.equal(report.scope, 'none');

  assert.equal(report.targets.length, 0);
});

test('unrelated and archived-course changes have no active artifact impact', () => {
  const report = analyzeArtifactImpact(manifest, [
    'README.md',
    'courses/02-archived/en/01-archived.md',
  ]);
  assert.deepEqual(report, { scope: 'none', targets: [], deliveryTargets: [], reasons: [] });
});

test('artifact impact selects registered delivery variants for source and canonical changes', () => {
  const withDelivery = {
    ...manifest,
    teachingSessions: [
      {
        id: 's06',
        slug: 'security-privacy-and-responsibility',
        canonicalModuleIds: ['module_one'],
        source: {
          en: 'teaching/sessions/s06-security-privacy-and-responsibility/en/session.md',
          fr: 'teaching/sessions/s06-security-privacy-and-responsibility/fr/session.md',
        },
        deliveryVariants: {
          document: {
            en: {
              source:
                'teaching/sessions/s06-security-privacy-and-responsibility/deliveries/document/en.md',
              canonicalModuleIds: ['module_one'],
            },
            fr: {
              source:
                'teaching/sessions/s06-security-privacy-and-responsibility/deliveries/document/fr.md',
              canonicalModuleIds: ['module_one'],
            },
          },
        },
      },
    ],
  } as unknown as Manifest;
  const direct = analyzeArtifactImpact(withDelivery, [
    'teaching/sessions/s06-security-privacy-and-responsibility/deliveries/document/en.md',
  ]);
  assert.deepEqual(
    direct.deliveryTargets.map((target) => [target.sessionId, target.profile, target.language]),
    [['s06', 'document', 'en']],
  );

  const canonical = analyzeArtifactImpact(withDelivery, ['courses/01-active/en/01-one.md']);
  assert.deepEqual(
    canonical.deliveryTargets.map((target) => [target.sessionId, target.profile, target.language]),
    [['s06', 'document', 'en']],
  );

  const englishSessionSource = analyzeArtifactImpact(withDelivery, [
    'teaching/sessions/s06-security-privacy-and-responsibility/en/session.md',
  ]);
  assert.deepEqual(
    englishSessionSource.deliveryTargets.map((target) => target.language),
    ['en'],
  );
});

test('artifact impact selects only the changed canonical module language', () => {
  const report = analyzeArtifactImpact(manifest, ['courses/01-active/en/01-one.md']);

  assert.equal(report.scope, 'targeted');

  assert.deepEqual(
    report.targets.map((target) => [target.moduleId, target.language]),
    [['module_one', 'en']],
  );
});

test('artifact impact conservatively selects a course language for local dependency changes', () => {
  const report = analyzeArtifactImpact(manifest, ['courses/01-active/fr/diagram.png']);

  assert.deepEqual(
    report.targets.map((target) => [target.moduleId, target.language]),
    [
      ['module_one', 'fr'],
      ['module_two', 'fr'],
    ],
  );
});

test('artifact engine changes affect all active targets but exclude archived courses', () => {
  const report = analyzeArtifactImpact(manifest, ['packages/presentations/src/pptx/render.ts']);

  assert.equal(report.scope, 'all');

  assert.equal(report.targets.length, 4);

  assert.ok(report.targets.every((target) => target.courseId === 'course_active'));
});

test('full validation places every active artifact target in scope', () => {
  const report = analyzeArtifactImpact(manifest, [], true);

  assert.equal(report.scope, 'all');

  assert.equal(report.targets.length, 4);
});

test('planner selects artifact impact for canonical course changes', () => {
  const plan = planTasks(['courses/01-active/en/01-one.md']);

  const ids = plan.map(({ task }) => task.id);

  assert.ok(ids.includes('artifacts.impact'));

  assert.ok(ids.indexOf('manifest.validate') < ids.indexOf('artifacts.impact'));
});

test('artifact-engine changes do not pull unrelated manifest-dependent validation tasks', () => {
  const plan = planTasks(['packages/presentations/src/pptx/render.ts']);

  const ids = plan.map(({ task }) => task.id);

  assert.ok(ids.includes('artifacts.impact'));

  assert.ok(!ids.includes('manifest.validate'));

  assert.ok(!ids.includes('manifest.format'));

  assert.ok(!ids.includes('courses.structure'));

  assert.ok(!ids.includes('design-system.validate'));
});

test('unrelated CLI validation changes do not select artifact impact', () => {
  const plan = planTasks(['packages/cli/src/check.ts']);

  const ids = plan.map(({ task }) => task.id);

  assert.ok(!ids.includes('artifacts.impact'));
});

test('artifact impact reasons have a stable sorted order regardless of input order', () => {
  const files = ['courses/01-active/fr/02-two.md', 'courses/01-active/en/01-one.md'];
  const forward = analyzeArtifactImpact(manifest, files);
  const reverse = analyzeArtifactImpact(manifest, [...files].reverse());
  assert.equal(forward.reasons.length, 2);
  assert.deepEqual(forward, reverse);
  assert.deepEqual(forward.reasons, [...forward.reasons].sort());
});

test('multiple artifact engine changes produce sorted reasons without duplicate targets', () => {
  const files = ['packages/presentations/src/pptx/render.ts', 'manifest.json', 'pnpm-lock.yaml'];
  const forward = analyzeArtifactImpact(manifest, files);
  const reverse = analyzeArtifactImpact(manifest, [...files].reverse());
  assert.equal(forward.scope, 'all');
  assert.equal(forward.targets.length, 4);
  assert.deepEqual(forward, reverse);
  assert.deepEqual(
    forward.reasons,
    [...files].sort().map((file) => `artifact engine input changed: ${file}`),
  );
});

test('planner selects every task for an unchanged working tree', () => {
  const automatic = planTasks([]);
  const full = planTasks([], true);
  assert.deepEqual(
    automatic.map((entry) => entry.task.id),
    full.map((entry) => entry.task.id),
  );
  assert.ok(automatic.every((entry) => entry.reasons.includes('no working-tree changes detected')));
});

test('session-wide assets invalidate both languages of registered deliveries', () => {
  const target = structuredClone(manifest);
  const session: NonNullable<Manifest['teachingSessions']>[number] = {
    id: 's01',
    slug: 'test',
    title: { en: 'Test', fr: 'Test' },
    canonicalModuleIds: ['module_one'],
    durationMinutes: 1,
    slideCount: 1,
    source: {
      en: 'teaching/sessions/s01-test/en/session.md',
      fr: 'teaching/sessions/s01-test/fr/session.md',
    },
  };
  target.teachingSessions = [session];
  session.deliveryVariants = {
    reference: {
      en: {
        source: 'teaching/sessions/s01-test/deliveries/reference/en.md',
        canonicalModuleIds: session.canonicalModuleIds,
        editorialStatus: 'draft',
        contentRelationship: 'adaptation',
      },
    },
  };
  const report = analyzeArtifactImpact(target, ['teaching/sessions/s01-test/shared.css']);
  assert.equal(report.deliveryTargets.length, 1);
});
