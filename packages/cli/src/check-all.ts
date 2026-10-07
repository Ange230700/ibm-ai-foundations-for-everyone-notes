import { runCheckAll } from './check-all-runner.js';

const exitCode = runCheckAll(process.argv.slice(2));

if (exitCode !== 0) {
  process.exitCode = exitCode;
}
