import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import test from 'node:test';

import * as core from '@coursera-notes/core';
import * as manifestApi from '@coursera-notes/manifest';

let sequence = 0;

test('prompts use trimmed answers and defaults, and close after failures', async (t) => {
  const questions: string[] = [];
  const answers = ['  answer  ', '', '', ''];
  let closes = 0;
  t.mock.module('node:readline/promises', {
    namedExports: {
      ...readline,
      createInterface: () => ({
        question: async (question: string) => {
          questions.push(question);
          return answers.shift();
        },
        close: () => {
          closes++;
        },
      }),
    },
  });
  const { withPrompts } = await import('../src/prompts.js');
  assert.deepEqual(
    await withPrompts(async (ask) => [
      await ask('First'),
      await ask('Second', 'default'),
      await ask('Third'),
      await ask('Fourth', ''),
    ]),
    ['answer', 'default', '', ''],
  );
  assert.deepEqual(questions, ['First: ', 'Second [default]: ', 'Third: ', 'Fourth: ']);
  await assert.rejects(
    withPrompts(async () => {
      throw new Error('interrupted');
    }),
    /interrupted/,
  );
  assert.equal(closes, 2);
});

test('generators validate input and remove incomplete course and module files', async (t) => {
  const original = await manifestApi.readManifest();
  let manifest = structuredClone(original);
  let answers: string[] = [];
  let failWrite = false;
  let failUnlink = false;
  const writes: Array<{ path: string; text: string }> = [];
  const removals: string[] = [];
  const fallbacks: Array<string | undefined> = [];
  let saved: typeof manifest | undefined;
  const argv = process.argv;
  t.mock.module('@coursera-notes/manifest', {
    namedExports: {
      ...manifestApi,
      readManifest: async () => manifest,
      writeManifest: async (value: typeof manifest) => {
        if (failWrite) throw new Error('manifest write failed');
        saved = value;
      },
    },
  });
  t.mock.module('@coursera-notes/core', {
    namedExports: {
      ...core,
      atomicWrite: async (path: string, text: string) => {
        writes.push({ path, text });
      },
    },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      readFile: async () => '{{YEAR}} {{HOLDER}}',
      rm: async (path: string) => {
        removals.push(path);
      },
      unlink: async (path: string) => {
        removals.push(path);
        if (failUnlink) throw new Error('missing file');
      },
    },
  });
  t.mock.module('../src/prompts.js', {
    namedExports: {
      withPrompts: async (
        run: (ask: (question: string, fallback?: string) => Promise<string>) => unknown,
      ) =>
        run(async (_question, fallback) => {
          fallbacks.push(fallback);
          return answers.shift() ?? fallback ?? '';
        }),
    },
  });
  t.mock.method(console, 'log', () => undefined);
  const reset = () => {
    manifest = structuredClone(original);
    answers = [];
    failWrite = false;
    failUnlink = false;
    saved = undefined;
    writes.length = 0;
    removals.length = 0;
    fallbacks.length = 0;
  };
  const run = async (script: string, args: string[] = []) => {
    process.argv = ['node', script, ...args];
    await import(`../src/${script}.js?generators=${sequence++}`);
  };
  try {
    await t.test('setup checks required metadata, year bounds and reconfiguration', async () => {
      await assert.rejects(run('setup'), /already configured/);
      for (const [input, message] of [
        [[''], /title is required/],
        [['Program', ''], /Provider is required/],
        [['Program', 'Provider', 'slug', ''], /holder is required/],
        ...['1999', '2201', '2020.5', 'invalid'].map((year) => [
          ['Program', 'Provider', 'slug', 'Holder', year],
          /Initial year must/,
        ]),
      ] as const) {
        reset();
        answers = [...input];
        await assert.rejects(run('setup', ['--reconfigure']), message);
        assert.equal(saved, undefined);
      }
      reset();
      answers = ['Updated', 'Provider', 'updated', 'Holder', '2200'];
      await run('setup', ['--reconfigure']);
      assert.equal(saved!.program.id, original.program.id);
      assert.equal(saved!.program.license.initialYear, 2200);
      assert.equal(writes[0]!.text, '2200 Holder');
      reset();
      manifest.repository.status = 'template';
      manifest.program.id = null;
      manifest.program.title = 'Coursera Program Notes';
      manifest.program.provider = 'Provider';
      manifest.program.license.holder = null;
      manifest.program.license.initialYear = null;
      answers = ['New', 'Provider', 'new', 'Holder', '2000'];
      await run('setup');
      assert.match(saved!.program.id!, /^program_/);
      assert.equal(fallbacks[0], undefined);
      assert.equal(fallbacks[1], undefined);
      assert.equal(fallbacks[4], String(new Date().getUTCFullYear()));
    });
    await t.test(
      'courses require setup and bilingual titles and reject duplicate slugs',
      async () => {
        reset();
        manifest.repository.status = 'template';
        await assert.rejects(run('course-add'), /Run pnpm setup/);
        for (const input of [
          ['', 'French'],
          ['English', ''],
        ]) {
          reset();
          answers = input;
          await assert.rejects(run('course-add'), /Both English and French/);
        }
        reset();
        answers = ['English', 'French', manifest.courses[0]!.slug];
        await assert.rejects(run('course-add'), /slug already exists/);
        reset();
        answers = ['English', 'French', 'new-course'];
        failWrite = true;
        await assert.rejects(run('course-add'), /manifest write failed/);
        assert.equal(removals.length, 1);
        assert.match(removals[0]!, /new-course$/);
        reset();
        answers = ['English', 'French', 'new-course'];
        await run('course-add');
        assert.equal(saved!.courses.at(-1)!.slug, 'new-course');
        assert.equal(writes.length, 2);
      },
    );
    await t.test(
      'modules validate selection and clean both languages after write failure',
      async () => {
        reset();
        manifest.repository.status = 'template';
        await assert.rejects(run('module-add'), /Run pnpm setup/);
        reset();
        manifest.courses = [];
        await assert.rejects(run('module-add'), /Add a course first/);
        reset();
        answers = ['999'];
        await assert.rejects(run('module-add'), /Unknown course number/);
        for (const input of [
          ['1', '', 'French'],
          ['1', 'English', ''],
        ]) {
          reset();
          answers = input;
          await assert.rejects(run('module-add'), /Both English and French/);
        }
        reset();
        answers = ['1', 'English', 'French', manifest.courses[0]!.modules[0]!.slug];
        await assert.rejects(run('module-add'), /slug already exists/);
        for (const failure of [false, true]) {
          reset();
          answers = ['1', 'English', 'French', 'new-module'];
          failWrite = true;
          failUnlink = failure;
          await assert.rejects(run('module-add'), /manifest write failed/);
          assert.equal(removals.length, 2);
        }
        reset();
        answers = ['1', 'English', 'French', 'new-module'];
        await run('module-add');
        assert.equal(saved!.courses[0]!.modules.at(-1)!.slug, 'new-module');
        assert.equal(writes.length, 4);
      },
    );
  } finally {
    process.argv = argv;
  }
});
