# Validation

Validation tasks are declared centrally in `packages/validation/src/tasks.ts`.

The planner:

1. reads changed files from Git when available;
2. selects tasks whose declared inputs changed;
3. adds transitive dependencies;
4. propagates impact to dependent tasks;
5. topologically orders the selected plan;
6. explains every selection in dry-run mode.

Use:

```bash
pnpm check:dry-run
pnpm check:dry-run -- --json
pnpm check:full
```

The current task set checks JSON Schema drift, manifest validity, bilingual course structure, design-system paths, and required repository structure.
