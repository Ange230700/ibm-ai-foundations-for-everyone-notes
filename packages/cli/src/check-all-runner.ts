import { spawnSync } from 'node:child_process';

interface SpawnResult {
  error?: Error;
  status: number | null;
}

export interface CheckAllDependencies {
  error: (message: string) => void;
  execPath: string;
  platform: NodeJS.Platform;
  pnpmCli: string | undefined;
  spawn: (
    command: string,
    args: readonly string[],
    options: {
      stdio: 'inherit';
      shell: boolean;
    },
  ) => SpawnResult;
}

const systemDependencies: CheckAllDependencies = {
  error: (message) => console.error(message),
  execPath: process.execPath,
  platform: process.platform,
  pnpmCli: process.env.npm_execpath,
  spawn: (command, args, options) => spawnSync(command, [...args], options),
};

function runCheckCommand(args: readonly string[], dependencies: CheckAllDependencies): number {
  const command = dependencies.pnpmCli ? dependencies.execPath : 'pnpm';

  const commandArgs = dependencies.pnpmCli ? [dependencies.pnpmCli, ...args] : [...args];

  const result = dependencies.spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: !dependencies.pnpmCli && dependencies.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function runCheckAll(
  args: readonly string[],
  dependencies: CheckAllDependencies = systemDependencies,
): number {
  const allowed = new Set(['--dry-run', '--full']);

  for (const arg of args) {
    if (!allowed.has(arg)) {
      dependencies.error(`Unknown check option: ${arg}`);
      return 2;
    }
  }

  if (args.includes('--dry-run') && args.includes('--full')) {
    dependencies.error('--dry-run and --full cannot be used together.');
    return 2;
  }

  const commands: string[][] = [];

  if (args.includes('--dry-run')) {
    commands.push(['exec', 'tsx', 'packages/cli/src/check.ts', '--dry-run']);
  } else {
    commands.push(
      args.includes('--full')
        ? ['exec', 'tsx', 'packages/cli/src/check.ts', '--full']
        : ['exec', 'tsx', 'packages/cli/src/check.ts'],
    );

    commands.push(
      ['lint'],
      ['exec', 'markdownlint-cli2'],
      ['test'],
      ['typecheck'],
      ['format:check'],
    );
  }

  for (const command of commands) {
    const status = runCheckCommand(command, dependencies);

    if (status !== 0) {
      return status;
    }
  }

  return 0;
}
