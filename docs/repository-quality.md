# Repository quality setup

## Automated checks

- **Quality gate:** full semantic validation, ESLint, Markdown lint, tests,
  TypeScript, formatting, and c8 coverage with the existing per-file 100% thresholds.
- **SonarQube Cloud:** imports LCOV and waits up to five minutes for the service's
  quality gate. A failed gate fails the Quality gate job. Fork and Dependabot PRs
  skip this secret-dependent step; analysis still runs after merge to `main`.
- **CodeQL (javascript-typescript):** security analysis on PRs, main pushes and weekly.
  A successful analysis means the scan completed; findings must also be reviewed
  in the Security tab. It does not itself promise zero security alerts.
- **Dependabot:** weekly Actions and npm updates, with grouped development minor
  and patch updates. Major updates remain separate. Updates are never auto-merged.

Actions are pinned to commit SHAs, use limited permissions and do not persist
checkout credentials. Coverage reports are retained for 14 days. CI uses Ubuntu
24.04 and a scoped AppArmor profile for Puppeteer's cached browser executables,
allowing Chromium to create its sandbox user namespaces. The browser sandbox
remains enabled. See [Chromium's AppArmor guidance](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md).

### Coverage contract

Run `pnpm coverage` to execute all six packages' tests and enforce 100% statements,
branches, functions, and lines **for every source file**, not just the aggregate.
The `.c8rc.json` scope includes `packages/*/src/**/*.ts`, including files that no
test imports. Tests are excluded; production files must not be excluded to hide
gaps. The command fails on either a test failure or a coverage shortfall.

CI runs the same command and uploads `coverage/lcov.info` and
`coverage/coverage-summary.json`. When debugging a failure, fix failing tests
before interpreting coverage: an earlier package failure stops later packages
from running. File-system mocks must normalize native paths before matching
repository-relative segments so failure scenarios also execute on Windows.

## Sonar activation

1. In SonarQube Cloud, verify the GitHub binding for project
   `Ange230700_ibm-ai-foundations-for-everyone-notes` in organization `ange230700`.
2. Use CI-based analysis and disable Automatic Analysis for this project.
3. Add a project-scoped analysis token as the GitHub Actions repository secret
   `SONAR_TOKEN`. Never commit or paste the token into issues or PRs.
4. Select the project's quality gate and new-code definition in Sonar's UI.
   Start with the built-in Sonar way gate; review any existing project-specific gate
   before replacing it. The workflow enforces the gate selected in Sonar.
5. Run CI on `main` to establish its baseline, then verify PR decoration on a
   same-repository PR. Ensure the account plan supports the intended PR analysis.

A missing or expired token deliberately fails same-repository CI. Do not weaken
coverage thresholds or add broad exclusions to make an analysis pass.

## Activate main protection

The checked-in `.github/rulesets/main.json` is a configuration to import, not an
already-applied GitHub setting. A repository administrator must activate it.

After this PR has passed CI and merged, open **Settings > Rules > Rulesets >
New ruleset > Import a ruleset** and import that JSON. Confirm both check names
exist and have succeeded on this repository before activating the ruleset:

- `Quality gate` from GitHub Actions
- `CodeQL (javascript-typescript)` from GitHub Actions

The rule requires PRs, an up-to-date branch, successful checks, resolved review
conversations and linear history. It blocks force pushes and branch deletion and
has no bypass actors. It intentionally requires zero approving reviews so the
solo owner can merge their own PR. This still requires a PR and all checks.

Alternatively, an administrator with GitHub CLI can create it once from the repo:

```bash
gh api --method POST repos/Ange230700/ibm-ai-foundations-for-everyone-notes/rulesets \
  --input .github/rulesets/main.json
```

Inspect existing rulesets and classic branch protection first; do not create
duplicate or conflicting policies. For later changes, update the existing rule
rather than running the create command again.

## Repository settings checklist

These settings require administrator access and are not changed by merging YAML:

- Enable squash merging, disable merge commits and rebase merging, and enable
  automatic deletion of merged branches. Use the PR title as squash commit title.
- Keep Actions' default workflow token read-only and leave permission for Actions
  to create or approve PRs disabled. Individual security jobs declare needed access.
- Enable the dependency graph, Dependabot alerts and Dependabot security updates.
- Enable secret scanning and push protection where available.
- Use this CodeQL workflow as advanced setup; disable an existing default setup
  before enabling the workflow if GitHub reports a configuration conflict.
- Review code scanning alerts and configure a code-scanning merge rule if you want
  alert severity to block merges in addition to requiring successful analysis.

Review the first CI and CodeQL runs after activation. The presence of workflow or
ruleset files alone is not evidence that protection or external services are active.
