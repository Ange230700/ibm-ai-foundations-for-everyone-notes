import { spawnSync } from 'node:child_process';

const pnpmCli = process.env.npm_execpath;

function run(args: string[]): void {
  const command = pnpmCli ? process.execPath : 'pnpm';
  const commandArgs = pnpmCli ? [pnpmCli, ...args] : args;

  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: !pnpmCli && process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const args = process.argv.slice(2);
const allowed = new Set(['--dry-run', '--full']);

for (const arg of args) {
  if (!allowed.has(arg)) {
    console.error(`Unknown check option: ${arg}`);
    process.exit(2);
  }
}

if (args.includes('--dry-run') && args.includes('--full')) {
  console.error('--dry-run and --full cannot be used together.');
  process.exit(2);
}

if (args.includes('--dry-run')) {
  run(['exec', 'tsx', 'packages/cli/src/check.ts', '--dry-run']);
  process.exit(0);
}

if (args.includes('--full')) {
  run(['exec', 'tsx', 'packages/cli/src/check.ts', '--full']);
} else {
  run(['exec', 'tsx', 'packages/cli/src/check.ts']);
}

run(['lint']);
run(['exec', 'markdownlint-cli2']);
run(['test']);
run(['typecheck']);
run(['format:check']);
