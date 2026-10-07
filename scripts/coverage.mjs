import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const pnpm = process.env.npm_execpath;
const run = (args) => {
  const result = pnpm
    ? spawnSync(process.execPath, [pnpm, ...args], { stdio: 'inherit' })
    : spawnSync('pnpm', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  return result.status ?? 1;
};

const testStatus = run(['exec', 'c8', '--reporter=none', '--check-coverage=false', 'pnpm', 'test']);
const directory = resolve('coverage', 'tmp');
for (const name of await readdir(directory)) {
  if (!name.endsWith('.json')) continue;
  const path = resolve(directory, name);
  const coverage = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(coverage.result)) continue;
  // Node gives generated module mocks the source module's URL. c8 strips its
  // query string and would otherwise attribute mock code to production lines.
  coverage.result = coverage.result.filter((script) => !script.url.includes('?node-test-mock='));
  await writeFile(path, JSON.stringify(coverage));
}
const reportStatus = run(['exec', 'c8', 'report']);
process.exitCode = testStatus || reportStatus;
