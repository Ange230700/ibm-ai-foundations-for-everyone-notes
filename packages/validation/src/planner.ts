import { execFileSync } from 'node:child_process';

import { repositoryRoot } from '@coursera-notes/core';

import { TASKS, type ValidationTask } from './tasks.js';

function matches(pattern: string, path: string): boolean {
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -3));
  return path === pattern;
}

function gitExecutable(): string {
  if (process.platform === 'win32') {
    return String.raw`C:\\Program Files\\Git\\cmd\\git.exe`;
  }

  return '/usr/bin/git';
}

function changedPath(line: string): string {
  const path = line.slice(3).trim();
  return path.includes(' -> ') ? (path.split(' -> ').at(-1) ?? path) : path;
}

export function changedFiles(): string[] {
  try {
    const output = execFileSync(
      gitExecutable(),
      ['status', '--porcelain=v1', '--untracked-files=all'],
      {
        cwd: repositoryRoot(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => changedPath(line))
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

function byId(): Map<string, ValidationTask> {
  return new Map(TASKS.map((task) => [task.id, task]));
}

export interface PlannedTask {
  task: ValidationTask;
  reasons: string[];
}

type TaskReasons = Map<string, Set<string>>;

function selectTask(reasons: TaskReasons, id: string, reason: string): void {
  const selectedReasons = reasons.get(id) ?? new Set<string>();
  selectedReasons.add(reason);
  reasons.set(id, selectedReasons);
}

function selectInitialTasks(files: readonly string[], full: boolean, reasons: TaskReasons): void {
  if (full || files.length === 0) {
    const reason = full ? 'full validation requested' : 'no working-tree changes detected';

    for (const task of TASKS) {
      selectTask(reasons, task.id, reason);
    }

    return;
  }

  for (const task of TASKS) {
    for (const file of files) {
      if (task.inputs.some((pattern) => matches(pattern, file))) {
        selectTask(reasons, task.id, `input changed: ${file}`);
      }
    }
  }
}

function propagateTaskSelection(task: ValidationTask, reasons: TaskReasons): boolean {
  let changed = false;

  if (reasons.has(task.id)) {
    for (const dependency of task.dependencies) {
      if (!reasons.has(dependency)) {
        selectTask(reasons, dependency, `dependency of ${task.id}`);
        changed = true;
      }
    }
  }

  const selectedDependency = task.dependencies.some((dependency) => reasons.has(dependency));

  if (!reasons.has(task.id) && selectedDependency) {
    selectTask(reasons, task.id, 'affected by selected dependency');
    changed = true;
  }

  return changed;
}

function propagateSelections(reasons: TaskReasons): void {
  let changed = true;

  while (changed) {
    changed = false;

    for (const task of TASKS) {
      changed = propagateTaskSelection(task, reasons) || changed;
    }
  }
}

function visitTask(
  id: string,
  tasks: ReadonlyMap<string, ValidationTask>,
  reasons: TaskReasons,
  visited: Set<string>,
  ordered: PlannedTask[],
): void {
  if (visited.has(id) || !reasons.has(id)) return;

  const task = tasks.get(id);

  if (!task) {
    throw new Error(`Unknown task: ${id}`);
  }

  for (const dependency of task.dependencies) {
    visitTask(dependency, tasks, reasons, visited, ordered);
  }

  visited.add(id);
  ordered.push({
    task,
    reasons: [...(reasons.get(id) ?? [])].sort((left, right) => left.localeCompare(right)),
  });
}

function orderSelectedTasks(
  tasks: ReadonlyMap<string, ValidationTask>,
  reasons: TaskReasons,
): PlannedTask[] {
  const ordered: PlannedTask[] = [];
  const visited = new Set<string>();

  for (const task of TASKS) {
    visitTask(task.id, tasks, reasons, visited, ordered);
  }

  return ordered;
}

export function planTasks(files: string[], full = false): PlannedTask[] {
  const tasks = byId();
  const reasons: TaskReasons = new Map();

  selectInitialTasks(files, full, reasons);
  propagateSelections(reasons);

  return orderSelectedTasks(tasks, reasons);
}
