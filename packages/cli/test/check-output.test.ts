import assert from 'node:assert/strict';
import test from 'node:test';
import * as validation from '@coursera-notes/validation';

test('semantic CLI reports plans and results, and stops at the first failed task', async (t) => {
  let files: string[] = [];
  let failing = false;
  const output: string[] = [];
  const executed: string[] = [];
  const argv = process.argv;
  const exitCode = process.exitCode;
  t.mock.module('@coursera-notes/validation', {
    namedExports: {
      ...validation,
      changedFiles: () => files,
      planTasks: () =>
        ['first', 'second', 'third'].map((id) => ({
          task: {
            id,
            description: id,
            execute: async (context: validation.ValidationContext) => {
              executed.push(id);
              assert.deepEqual(context.changedFiles, files);
              return { ok: !(failing && id === 'second'), messages: [id] };
            },
          },
          reasons: ['test input'],
        })),
    },
  });
  t.mock.method(console, 'log', (line: string) => {
    output.push(line);
  });
  t.mock.method(process, 'exit', () => {
    throw new Error('exit requested');
  });
  let sequence = 0;
  const run = async (args: string[]) => {
    output.length = 0;
    executed.length = 0;
    process.argv = ['node', 'check', ...args];
    process.exitCode = 0;
    await import(`../src/check.js?outputs=${sequence++}`);
  };
  try {
    for (const [args, mode] of [
      [['--dry-run'], 'full-clean-tree'],
      [['--dry-run', '--full', '--json'], 'full'],
      [['--dry-run', '--json'], 'changed'],
    ] as const) {
      files = mode === 'changed' ? ['changed.md'] : [];
      await assert.rejects(run([...args]), /exit requested/);
      assert.equal(executed.length, 0);
      if (args.includes('--json')) assert.equal(JSON.parse(output[0]!).mode, mode);
      else assert.match(output[0]!, /full-clean-tree/);
    }
    await run([]);
    assert.deepEqual(executed, ['first', 'second', 'third']);
    assert.match(output[0]!, /^PASS/);
    failing = true;
    await run([]);
    assert.deepEqual(executed, ['first', 'second']);
    assert.match(output[1]!, /^FAIL/);
    assert.equal(process.exitCode, 1);
    await run(['--json']);
    assert.equal(JSON.parse(output[0]!).results[1].ok, false);
  } finally {
    process.argv = argv;
    process.exitCode = exitCode;
  }
});
