import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const templateRoot = fileURLToPath(new URL('../../../', import.meta.url));
const script = resolve(templateRoot, 'packages/manifest/src/generate-schema.ts');

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

async function runGenerateSchema(
  repositoryRoot: string,
  args: readonly string[] = [],
): Promise<CommandResult> {
  const child = spawn(process.execPath, ['--import', 'tsx', script, ...args], {
    cwd: templateRoot,
    env: {
      ...process.env,
      COURSERA_NOTES_REPOSITORY_ROOT: repositoryRoot,
    },
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

test('manifest schema CLI writes, verifies, and rejects stale output', async () => {
  const repositoryRoot = await mkdtemp(resolve(tmpdir(), 'coursera-manifest-schema-'));

  try {
    const missing = await runGenerateSchema(repositoryRoot, ['--check']);

    assert.notEqual(missing.exitCode, 0);
    assert.match(missing.stderr, /manifest\.schema\.json is stale/);

    const write = await runGenerateSchema(repositoryRoot);

    assert.equal(write.exitCode, 0);
    assert.match(write.stdout, /WROTE manifest\.schema\.json/);

    const schemaPath = resolve(repositoryRoot, 'manifest.schema.json');
    const schema = await readFile(schemaPath, 'utf8');

    assert.match(schema, /"\$schema"/);
    assert.match(schema, /"Coursera Program Notes Manifest"/);

    const check = await runGenerateSchema(repositoryRoot, ['--check']);

    assert.equal(check.exitCode, 0);
    assert.match(check.stdout, /PASS manifest\.schema/);

    await writeFile(schemaPath, '{}\n', 'utf8');

    const stale = await runGenerateSchema(repositoryRoot, ['--check']);

    assert.notEqual(stale.exitCode, 0);
    assert.match(stale.stderr, /manifest\.schema\.json is stale/);
  } finally {
    await rm(repositoryRoot, {
      recursive: true,
      force: true,
    });
  }
});
