import { spawnSync } from 'node:child_process';
import process from 'node:process';

if (!process.env.SONAR_TOKEN?.trim()) {
  process.stderr.write('SONAR_TOKEN is missing. Add it to .env, then run pnpm sonar:scan.\n');
  process.exitCode = 1;
} else {
  const scanner = process.platform === 'win32' ? 'sonar-scanner-npm.cmd' : 'sonar-scanner-npm';
  const result = spawnSync(scanner, process.argv.slice(2), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
