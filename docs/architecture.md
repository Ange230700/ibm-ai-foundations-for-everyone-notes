# Architecture

## Authority chain

1. `manifest.json` owns repository, program, course, module, and source-mapping metadata.
2. `courses/` owns canonical EN/FR learning content.
3. `design-system/` owns repository-specific visual tokens.
4. Packages derive validation plans and artifacts from those authoritative inputs.
5. Generated artifacts and QA evidence live below ignored `.artifacts/` directories.

## V1 packages

- `@coursera-notes/core`: deterministic JSON, hashes, IDs, slugs, paths, and atomic writes.
- `@coursera-notes/manifest`: Zod schema, manifest IO, and JSON Schema generation.
- `@coursera-notes/validation`: typed validation task registry, dependency-aware planning, and artifact-impact analysis.
- `@coursera-notes/cli`: setup/content generators, validation orchestration, artifact targeting, rendering, verification, and visual-QA adapters.
- `@coursera-notes/artifacts`: reusable semantic Markdown-to-text rendering and TXT export.
- `@coursera-notes/presentations`: canonical Markdown extraction, Mermaid assets, DeckSpec synthesis, PDF/PPTX rendering, provenance, semantic/structural verification, and visual QA.

## Canonical artifact pipeline

1. Resolve a target from immutable manifest IDs or human-facing ordinals.
2. Read canonical Markdown and extract structured `ModuleContent`.
3. Bind source and content SHA-256 identities to the derivative specification.
4. Render deterministic Mermaid assets where required.
5. Render TXT, PDF, or native editable PPTX output.
6. Independently verify semantic or OOXML structure and canonical provenance.
7. Store the artifact, provenance record, verification record, and optional visual-QA evidence below `.artifacts/`.

Renderers reject stale source identities and stale diagram assets rather than silently producing derivatives from mismatched inputs.

## Identity

Program, course, and module identities use prefixed UUIDv4 values. Ordinals and slugs are human-facing location metadata and may later be migrated without changing immutable IDs.

Canonical source bytes, extracted module content, deck specifications, render inputs, and generated artifacts use SHA-256 identities where applicable.

## V1 boundary

V1 guarantees a reproducible local workflow for:

- repository configuration;
- synchronized EN/FR course and module creation;
- canonical structure and manifest validation;
- change-aware validation planning;
- TXT/PDF/PPTX generation;
- independent PDF/PPTX verification;
- PDF/PPTX visual-QA evidence.

GitHub Release publication and repository lifecycle commands are not part of the V1 acceptance boundary.

## Post-V1 capabilities

The following remain deliberately deferred:

- archive/reactivate commands and manifest migrations;
- release publication and release-version automation;
- template upgrade bundles;
- TTS and audio QA;
- AI-assisted EN/FR semantic comparison;
- screenshot baselines beyond artifact visual QA;
- skills, outcomes, assessment, question, and learner-attempt revision graphs.
