import assert from 'node:assert/strict';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs/promises';
import test from 'node:test';

import { canonicalJson, padOrdinal } from '@coursera-notes/core';
import * as manifestApi from '@coursera-notes/manifest';

import { analyzeArtifactImpact } from '../src/artifact-impact.js';

test('validation tasks report stale, missing and unreadable inputs without hiding the cause', async (t) => {
  const original = await manifestApi.readManifest();
  let manifest = structuredClone(original);
  let failure: unknown;
  let missing = false;
  let drift = false;
  let directories: string[] = [];
  t.mock.module('@coursera-notes/manifest', {
    namedExports: {
      ...manifestApi,
      readManifest: async () => {
        if (failure !== undefined) throw failure;
        return manifest;
      },
    },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      access: async () => {
        if (missing) throw new Error('file missing');
      },
      readdir: async () => [
        ...directories.map((name) => ({ name, isDirectory: () => true })),
        { name: 'README.md', isDirectory: () => false },
      ],
      readFile: async (path: string, encoding?: BufferEncoding) => {
        if (missing) throw new Error('file missing');
        if (path.endsWith('manifest.schema.json'))
          return drift ? '{}' : canonicalJson(manifestApi.manifestJsonSchema());
        if (path.endsWith('manifest.json')) return drift ? '{}' : canonicalJson(manifest);
        return fs.readFile(path, encoding);
      },
    },
  });
  const { TASKS } = await import('../src/tasks.js?failures');
  const run = (id: string, changedFiles: string[] = [], full = false) =>
    TASKS.find((task) => task.id === id)!.execute({ changedFiles, full });
  const reset = () => {
    manifest = structuredClone(original);
    failure = undefined;
    missing = false;
    drift = false;
    directories = manifest.courses
      .filter((course) => course.status !== 'archived')
      .map((course) => `${padOrdinal(course.ordinal)}-${course.slug}`)
      .reverse();
  };
  reset();
  for (const id of [
    'manifest.schema.sync',
    'manifest.validate',
    'manifest.format',
    'teaching.sessions',
    'courses.structure',
    'design-system.validate',
    'repository.structure',
  ])
    assert.equal((await run(id)).ok, true, id);
  drift = true;
  for (const id of ['manifest.schema.sync', 'manifest.format'])
    assert.equal((await run(id)).ok, false, id);
  missing = true;
  for (const id of [
    'manifest.schema.sync',
    'courses.structure',
    'design-system.validate',
    'repository.structure',
  ])
    assert.equal((await run(id)).ok, false, id);
  reset();
  directories = ['unexpected'];
  manifest.courses[0]!.modules[0]!.source.en = 'elsewhere/bad.md';
  const structure = await run('courses.structure');
  for (const message of [
    /Missing course directory/,
    /Unexpected active course directory/,
    /filename drift/,
    /outside canonical/,
  ])
    assert.ok(structure.messages.some((line) => message.test(line)));
  reset();
  delete manifest.teachingSessions;
  assert.match((await run('teaching.sessions')).messages[0]!, /0 bilingual/);
  reset();
  manifest.teachingSessions![0]!.source.en = 'invalid.md';
  assert.equal((await run('teaching.sessions')).ok, false);
  for (const error of [new Error('read failure'), 'plain failure']) {
    failure = error;
    for (const id of [
      'manifest.validate',
      'manifest.format',
      'teaching.sessions',
      'artifacts.impact',
    ]) {
      const result = await run(id);
      assert.equal(result.ok, false);
      assert.deepEqual(result.messages, [error instanceof Error ? error.message : error]);
    }
  }
  reset();
  manifest.courses = [];
  assert.match((await run('artifacts.impact', [], true)).messages[0]!, /0 active/);
  assert.match((await run('artifacts.impact')).messages[0]!, /no derivative/);
  reset();
  assert.match((await run('artifacts.impact', ['manifest.json'])).messages[1]!, /\+\d+ more/);
  manifest.courses = manifest.courses.slice(0, 1);
  manifest.courses[0]!.modules = manifest.courses[0]!.modules.slice(0, 1);
  assert.doesNotMatch((await run('artifacts.impact', ['manifest.json'])).messages[1]!, /more/);
});

test('artifact impact handles course-wide dependencies, absent targets and every engine boundary', async () => {
  const manifest = await manifestApi.readManifest();
  const paths = [
    'manifest.json',
    'pnpm-lock.yaml',
    ...['core', 'manifest', 'presentations', 'cli'].map((name) => `packages/${name}/package.json`),
    ...['core', 'manifest', 'presentations'].map((name) => `packages/${name}/src/index.ts`),
    ...[
      'artifact',
      'artifact-target',
      'artifact-pdf',
      'artifact-pptx',
      'artifact-verify',
      'artifact-visual-qa',
    ].map((name) => `packages/cli/src/${name}.ts`),
  ];
  for (const path of paths)
    assert.equal(analyzeArtifactImpact(manifest, [path]).scope, 'all', path);
  const course = manifest.courses[0]!;
  const root = `courses/${padOrdinal(course.ordinal)}-${course.slug}`;
  const report = analyzeArtifactImpact(manifest, [
    `${root}/shared.svg`,
    `${root}\\shared.svg`,
    'courses/unknown/file.md',
    'docs/readme.md',
  ]);
  assert.equal(report.targets.length, course.modules.length * 2);
  assert.equal(report.reasons.length, 1);
  for (const [files, full] of [
    [[], true],
    [['manifest.json'], false],
  ] as const)
    assert.equal(analyzeArtifactImpact({ ...manifest, courses: [] }, files, full).scope, 'none');
});

test('planner reads sorted Git paths on both platforms and rejects unknown dependencies', async (t) => {
  let output = ' M z.md\nR  old.md -> a.md\n?? b.md\n';
  let fail = false;
  const commands: string[] = [];
  t.mock.module('node:child_process', {
    namedExports: {
      ...childProcess,
      execFileSync: (command: string) => {
        commands.push(command);
        if (fail) throw new Error('no git');
        return output;
      },
    },
  });
  const { changedFiles, planTasks } = await import('../src/planner.js?git-failures');
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  try {
    for (const value of ['linux', 'win32']) {
      Object.defineProperty(process, 'platform', { value });
      assert.deepEqual(changedFiles(), ['a.md', 'b.md', 'z.md']);
    }
  } finally {
    Object.defineProperty(process, 'platform', platform);
  }
  assert.match(commands[0]!, /\/usr\/bin\/git/);
  assert.match(commands[1]!, /Program Files/);
  output = '';
  assert.deepEqual(changedFiles(), []);
  fail = true;
  assert.deepEqual(changedFiles(), []);
  const { TASKS } = await import('../src/tasks.js');
  const task = TASKS[0]!;
  const dependencies = task.dependencies;
  try {
    task.dependencies = ['missing-task'];
    assert.throws(() => planTasks([], true), /Unknown task: missing-task/);
  } finally {
    task.dependencies = dependencies;
  }
});
