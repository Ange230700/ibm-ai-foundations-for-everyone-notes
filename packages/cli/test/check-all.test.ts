import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { runCheckAll, type CheckAllDependencies } from '../src/check-all-runner.js';

interface SpawnCall {
  command: string;
  args: readonly string[];
  shell: boolean;
}

function fixture(overrides: Partial<CheckAllDependencies> = {}) {
  const calls: SpawnCall[] = [];
  const errors: string[] = [];

  const dependencies: CheckAllDependencies = {
    error: (message) => {
      errors.push(message);
    },
    execPath: 'node',
    platform: 'linux',
    pnpmCli: '/pnpm.cjs',
    spawn: (command, args, options) => {
      calls.push({
        command,
        args,
        shell: options.shell,
      });

      return { status: 0 };
    },
    ...overrides,
  };

  return {
    calls,
    dependencies,
    errors,
  };
}

test('check-all rejects unknown and conflicting options', () => {
  const unknown = fixture();

  assert.equal(runCheckAll(['--unknown'], unknown.dependencies), 2);
  assert.deepEqual(unknown.errors, ['Unknown check option: --unknown']);
  assert.equal(unknown.calls.length, 0);

  const conflicting = fixture();

  assert.equal(runCheckAll(['--dry-run', '--full'], conflicting.dependencies), 2);
  assert.deepEqual(conflicting.errors, ['--dry-run and --full cannot be used together.']);
  assert.equal(conflicting.calls.length, 0);
});

test('check-all dry-run executes only semantic dry-run validation', () => {
  const context = fixture();

  assert.equal(runCheckAll(['--dry-run'], context.dependencies), 0);

  assert.deepEqual(context.calls, [
    {
      command: 'node',
      args: ['/pnpm.cjs', 'exec', 'tsx', 'packages/cli/src/check.ts', '--dry-run'],
      shell: false,
    },
  ]);
});

test('check-all full mode executes the complete quality gate', () => {
  const context = fixture();

  assert.equal(runCheckAll(['--full'], context.dependencies), 0);

  assert.deepEqual(
    context.calls.map((call) => call.args),
    [
      ['/pnpm.cjs', 'exec', 'tsx', 'packages/cli/src/check.ts', '--full'],
      ['/pnpm.cjs', 'lint'],
      ['/pnpm.cjs', 'exec', 'markdownlint-cli2'],
      ['/pnpm.cjs', 'test'],
      ['/pnpm.cjs', 'typecheck'],
      ['/pnpm.cjs', 'format:check'],
    ],
  );
});

test('check-all default mode supports direct pnpm on Windows', () => {
  const context = fixture({
    pnpmCli: undefined,
    platform: 'win32',
  });

  assert.equal(runCheckAll([], context.dependencies), 0);

  assert.deepEqual(context.calls[0], {
    command: 'pnpm',
    args: ['exec', 'tsx', 'packages/cli/src/check.ts'],
    shell: true,
  });

  assert.equal(context.calls.length, 6);
});

test('check-all propagates spawn errors and command exit statuses', () => {
  const failure = new Error('spawn failed');

  const errored = fixture({
    spawn: () => ({
      error: failure,
      status: null,
    }),
  });

  assert.throws(() => runCheckAll(['--dry-run'], errored.dependencies), failure);

  const nonzero = fixture({
    spawn: () => ({ status: 7 }),
  });

  assert.equal(runCheckAll(['--dry-run'], nonzero.dependencies), 7);

  const missingStatus = fixture({
    pnpmCli: undefined,
    platform: 'linux',
    spawn: () => ({ status: null }),
  });

  assert.equal(runCheckAll(['--dry-run'], missingStatus.dependencies), 1);
});

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
const entrypoint = fileURLToPath(new URL('../src/check-all.ts', import.meta.url));

async function runEntrypoint(args: readonly string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  const child = spawn(process.execPath, ['--import', 'tsx', entrypoint, ...args], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'pipe',
  });

  let stdout = '';
  let stderr = '';

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stdout.on('data', (chunk: string) => {
    stdout += chunk;
  });

  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  const exitCode = await new Promise<number>((complete, reject) => {
    child.once('error', reject);
    child.once('close', (code) => complete(code ?? 1));
  });

  return {
    exitCode,
    stdout,
    stderr,
  };
}

test('check-all entrypoint succeeds in dry-run mode', async () => {
  const result = await runEntrypoint(['--dry-run']);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /^Validation plan:/m);
});

test('check-all entrypoint returns usage exit code for invalid options', async () => {
  const result = await runEntrypoint(['--invalid']);

  assert.equal(result.exitCode, 2);
  assert.match(result.stderr, /Unknown check option: --invalid/);
});
