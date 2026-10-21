# Contributing

Use a feature branch and a pull request targeting `main` for every change.
Direct pushes and local fast-forward integration are no longer the repository workflow.

## Local checks

Use the Node and pnpm versions in `package.json`, then run:

```bash
pnpm install --frozen-lockfile
pnpm check:full
pnpm coverage
```

Use Conventional Commit messages. Keep EN/FR content aligned and preserve source
attribution. For teaching or rendering changes, also build and verify the affected
artifacts, inspect their visual-QA output, and check animations in native PowerPoint
when applicable. Automated checks do not replace visual review or rehearsal.

## Pull requests

Explain the problem, resulting behavior and validation in the PR template.
Wait for required checks, resolve review conversations, then squash merge through
GitHub using a Conventional Commit title. Delete the merged feature branch.
A solo maintainer can merge their own PR after checks pass; another person's
approval is not required. Add a review requirement when a second maintainer joins.

Fork and Dependabot PRs receive no Sonar token. They still run repository checks,
coverage and CodeQL. Their Sonar analysis runs on `main` after merge. Do not use
`pull_request_target` to execute PR code with secrets.

See [repository quality setup](docs/repository-quality.md) for protection and
service configuration.
