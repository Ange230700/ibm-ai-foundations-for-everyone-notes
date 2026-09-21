import { changedFiles, planTasks, type ValidationContext } from '@coursera-notes/validation';

function validationMode(isFull: boolean, files: readonly string[]): string {
  if (isFull) {
    return 'full';
  }

  return files.length > 0 ? 'changed' : 'full-clean-tree';
}

const dryRun = process.argv.includes('--dry-run');
const full = process.argv.includes('--full');
const json = process.argv.includes('--json');
const files = changedFiles();
const plan = planTasks(files, full);
const context = {
  changedFiles: files,
  full,
} satisfies ValidationContext;

if (dryRun) {
  const payload = {
    mode: validationMode(full, files),
    changedFiles: files,
    tasks: plan.map(({ task, reasons }) => ({
      id: task.id,
      description: task.description,
      reasons,
    })),
  };
  if (json) console.log(JSON.stringify(payload, null, 2));
  else {
    console.log(`Validation plan: ${payload.mode}`);
    for (const item of payload.tasks) {
      console.log(`- ${item.id}: ${item.reasons.join('; ')}`);
    }
  }
  process.exit(0);
}

const results: Array<{ id: string; ok: boolean; messages: string[] }> = [];
for (const { task } of plan) {
  const result = await task.execute(context);
  results.push({ id: task.id, ...result });
  if (!json)
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${task.id} - ${result.messages.join(' | ')}`);
  if (!result.ok) break;
}

if (json) console.log(JSON.stringify({ changedFiles: files, results }, null, 2));
if (results.some((result) => !result.ok)) process.exitCode = 1;
