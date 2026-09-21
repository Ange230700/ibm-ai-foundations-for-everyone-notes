# Coursera Program Notes Template

A manifest-driven, bilingual repository template for a multi-course Coursera program or Professional Certificate.

## V1 status

V1 provides the complete local authoring and derivative-artifact pipeline:

- one root `manifest.json` as authoritative program, course, and module configuration;
- Zod manifest validation and generated `manifest.schema.json`;
- strict EN/FR canonical course structure;
- interactive `pnpm setup`, `pnpm course:add`, and `pnpm module:add` commands;
- task-aware validation with dry-run and JSON reporting;
- repository-local design-system configuration;
- deterministic TXT export;
- Markdown AST extraction with canonical source ranges and identities;
- deterministic Mermaid rendering;
- semantic PDF generation and verification;
- native editable PPTX generation and OOXML verification;
- PDF/PPTX visual-QA evidence;
- artifact provenance records;
- pinned Node and pnpm versions;
- Conventional Commit hooks and local-first validation.

The remaining V1 hardening work is tracked in `docs/roadmap.md`. Repository lifecycle automation, GitHub Release publication, TTS, AI-assisted translation QA, and template upgrades are post-V1 capabilities.

## Bootstrap

Create a repository from this template, then run:

```bash
npm install --global corepack@0.34.7
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm manifest:schema
pnpm setup
pnpm course:add
pnpm module:add
pnpm check:full
```

Node `22.13.0`, Corepack `0.34.7`, and pnpm `11.11.0` are the pinned V1 toolchain. Corepack is installed explicitly because the version bundled with Node `22.13.0` predates the signing keys used by current pnpm releases.

## Canonical content

Each active course has parallel canonical language directories:

```text
courses/
  01-course-slug/
    en/
      README.md
      01-module-slug.md
    fr/
      README.md
      01-module-slug.md
```

The manifest owns course/module identity, ordering, slugs, lifecycle state, and EN/FR source paths. Markdown contains the learning content and requires no front matter.

## Common commands

```bash
pnpm setup
pnpm setup -- --reconfigure
pnpm course:add
pnpm module:add
pnpm check
pnpm check:full
pnpm check:dry-run
pnpm check:dry-run -- --json
pnpm manifest:schema
pnpm manifest:schema:check
pnpm artifacts:txt
```

`pnpm check` uses the working-tree change set when Git is available. If the tree is clean or the repository is not yet a Git checkout, it runs the full semantic task plan.

## PDF and PowerPoint artifacts

Inspect the target plan before rendering:

```bash
pnpm artifact plan
pnpm artifact plan --course=1 --module=1 --lang=en
pnpm artifact plan --course=1 --json
```

Generate, independently verify, and create visual-QA evidence:

```bash
pnpm artifact pdf --course=1 --module=1 --lang=en
pnpm artifact pptx --course=1 --module=1 --lang=en
pnpm artifact verify --format=pdf --course=1 --module=1 --lang=en
pnpm artifact verify --format=pptx --course=1 --module=1 --lang=en
pnpm artifact visual-qa --format=pdf --course=1 --module=1 --lang=en
pnpm artifact visual-qa --format=pptx --course=1 --module=1 --lang=en
```

Course and module selectors accept either ordinals or immutable manifest IDs. Omitting `--module` or `--lang` expands the selected target set. PPTX visual QA requires LibreOffice; the other native PPTX checks do not.

## Artifact policy

Generated production artifacts are not committed. On-demand output is written below ignored `.artifacts/` directories together with provenance and verification records. GitHub Release publication is deliberately deferred until the repository lifecycle milestone.

## Scope boundary

V1 ends at a reproducible local workflow: configure a repository, author synchronized EN/FR canonical content, validate it, generate TXT/PDF/PPTX derivatives, and verify those derivatives.

Post-V1 work includes archive/reactivate commands, manifest migrations, GitHub Release publication, TTS, AI-assisted semantic comparison, template upgrades, and advanced revision graphs. See `docs/architecture.md` and `docs/roadmap.md`.
