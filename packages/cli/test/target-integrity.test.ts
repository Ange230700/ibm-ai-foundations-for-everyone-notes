import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '@coursera-notes/core';
import { readManifest } from '@coursera-notes/manifest';
import { prepareArtifactExecution } from '../src/artifact-execution.js';
import { resolveArtifactTargets } from '../src/artifact-target.js';
import {
  createS01AnimationPlan,
  createS02AnimationPlan,
  createS03AnimationPlan,
} from '../src/teaching-animation-plan.js';
import type { TeachingSessionContent } from '@coursera-notes/presentations';

test('artifact selectors reject ambiguous identities and execution rejects escaped input paths', async () => {
  const manifest = await readManifest();
  const course = manifest.courses[0]!;
  const module = course.modules[0]!;
  assert.throws(
    () => resolveArtifactTargets({ ...manifest, courses: [course, course] }, { course: course.id }),
    /Ambiguous course/,
  );
  assert.throws(
    () =>
      resolveArtifactTargets(
        { ...manifest, courses: [{ ...course, modules: [module, module] }] },
        { course: course.id, module: module.id },
      ),
    /Ambiguous module/,
  );
  const target = resolveArtifactTargets(manifest, {
    course: course.id,
    module: module.id,
    language: 'en',
  })[0]!;
  const root = repositoryRoot();
  const layout = { directory: 'test', filename: 'test.pdf', label: 'PDF' };
  for (const sourcePath of ['..', '../outside.md'])
    await assert.rejects(
      prepareArtifactExecution({ ...target, sourcePath }, {}, layout),
      /inside the repository/,
    );
  for (const outputRoot of [resolve(root, '..'), resolve(root, '../outside')])
    await assert.rejects(
      prepareArtifactExecution(target, { outputRoot }, layout),
      /inside the repository/,
    );
});

test('animation plans reject wrong sessions, timing, order, covers, tables and list layouts', () => {
  const make = (id: string, count: number): TeachingSessionContent => ({
    id,
    canonicalModuleIds: ['module_test'],
    language: 'en',
    title: 'Test',
    sourcePath: 'source.md',
    sourceSha256: 'source',
    contentSha256: 'content',
    durationMinutes: 60,
    slides: Array.from({ length: count }, (_, index) => ({
      id: `${id.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
      title: 'Test',
      durationMinutes: 2,
      items: ['First', 'Second'],
      itemKinds: ['plain', 'ordered'],
      notes: 'Note',
      startLine: 1,
      endLine: 2,
      ...(index === 0 ? { role: 'course-title' as const } : {}),
      ...(id === 's01' && index === 17
        ? { table: { headers: ['Header'], rows: [['Value']] }, items: [] }
        : {}),
    })),
  });
  for (const [id, count, run] of [
    ['s01', 30, createS01AnimationPlan],
    ['s02', 26, createS02AnimationPlan],
    ['s03', 25, createS03AnimationPlan],
  ] as const) {
    const content = make(id, count);
    run(content);
    for (const value of [
      { ...content, id: 'wrong' },
      { ...content, slides: [] },
      { ...content, durationMinutes: 59 },
    ])
      assert.throws(() => run(value), /animation requires/);
    const reject = (mutate: (value: TeachingSessionContent) => void, message: RegExp) => {
      const value = structuredClone(content);
      mutate(value);
      assert.throws(() => run(value), message);
    };
    reject((value) => {
      value.slides[1]!.id = 'wrong';
    }, /missing or out of order/);
    reject((value) => {
      delete value.slides[0]!.role;
    }, /cover has an unexpected/);
    reject((value) => {
      value.slides[0]!.table = { headers: [], rows: [] };
    }, /cover has an unexpected/);
    reject((value) => {
      value.slides[0]!.items = ['only one'];
    }, /cover has an unexpected/);
    reject((value) => {
      value.slides[1]!.table = { headers: [], rows: [] };
    }, /unexpected list/);
    reject((value) => {
      value.slides[1]!.items = ['only one'];
    }, /unexpected list/);
    reject((value) => {
      value.slides[1]!.itemKinds = [];
    }, /unexpected list/);
    if (id === 's01') {
      reject((value) => {
        delete value.slides[17]!.table;
      }, /table slide/);
      reject((value) => {
        value.slides[17]!.items = ['extra'];
      }, /table slide/);
    }
  }
});
