import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

const entrypoint = fileURLToPath(new URL('../src/teaching-artifact.ts', import.meta.url));

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

async function runTeachingArtifact(args: readonly string[]): Promise<CommandResult> {
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

test('teaching artifact rejects an unknown command', async () => {
  const result = await runTeachingArtifact(['unknown']);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Usage: pnpm teaching:artifact/);
});

test('teaching artifact rejects malformed and duplicate options', async () => {
  const malformed = await runTeachingArtifact(['plan', '--session']);

  assert.notEqual(malformed.exitCode, 0);
  assert.match(malformed.stderr, /Invalid teaching option/);

  const duplicate = await runTeachingArtifact(['plan', '--lang=en', '--lang=fr']);

  assert.notEqual(duplicate.exitCode, 0);
  assert.match(duplicate.stderr, /Unknown or duplicate teaching option/);
});

test('teaching artifact rejects an unmatched session', async () => {
  const result = await runTeachingArtifact(['plan', '--session=s99']);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /No teaching session matched s99/);
});

test('teaching artifact plans one selected language and format', async () => {
  const result = await runTeachingArtifact(['plan', '--session=s01', '--lang=en', '--format=pdf']);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /PLAN s01\/en .*formats=pdf/);
});

test('teaching artifact plans both languages and formats by default', async () => {
  const result = await runTeachingArtifact(['plan', '--session=s01']);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');

  assert.match(result.stdout, /PLAN s01\/en .*formats=pdf,pptx/);
  assert.match(result.stdout, /PLAN s01\/fr .*formats=pdf,pptx/);
});

test('teaching artifact can plan all registered sessions', async () => {
  const result = await runTeachingArtifact(['plan']);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');

  for (const session of ['s01', 's02', 's03', 's04', 's05']) {
    assert.match(result.stdout, new RegExp(`PLAN ${session}/en `));
    assert.match(result.stdout, new RegExp(`PLAN ${session}/fr `));
  }
});

test('teaching artifact rejects unsupported animation sessions and formats', async () => {
  const unsupportedSession = await runTeachingArtifact(['animate', '--session=s04']);

  assert.notEqual(unsupportedSession.exitCode, 0);
  assert.match(
    unsupportedSession.stderr,
    /Native animations currently support S01\/S02\/S03 PPTX only/,
  );

  const unsupportedFormat = await runTeachingArtifact(['animate', '--session=s01', '--format=pdf']);

  assert.notEqual(unsupportedFormat.exitCode, 0);
  assert.match(
    unsupportedFormat.stderr,
    /Native animations currently support S01\/S02\/S03 PPTX only/,
  );
});
