# Roadmap

## V1 acceptance status

### Complete

- [x] Manifest and Zod schema architecture.
- [x] Strict bilingual EN/FR canonical structure.
- [x] Interactive setup, course, and module generators.
- [x] Typed task-aware validation.
- [x] Repository-local design-system configuration.
- [x] Deterministic TXT export.
- [x] Markdown AST content model and source ranges.
- [x] Mermaid extraction, deterministic rendering, and render identities.
- [x] Semantic PDF renderer and independent verifier.
- [x] Native editable PPTX renderer and OOXML verifier.
- [x] PDF/PPTX visual and geometry QA contracts.
- [x] Artifact provenance records and canonical source identity checks.
- [x] Linting, formatting, type-checking, commit hooks, and package tests.
- [x] Sonar Quality Gate with zero open issues and zero duplicated code.
- [x] Documentation aligned with implemented artifact capabilities.

### Required before declaring V1 complete

- [x] A clean-bootstrap end-to-end smoke test covering setup, course creation, module creation, full validation, artifact planning, generation, and verification.
- [ ] GitHub Actions CI enforcing the repository quality gate on pushes and pull requests. The workflow is configured in `.github/workflows/ci.yml`, but hosted execution is currently blocked by an account billing restriction.
- [x] A final V1 version and release-readiness decision.
- [x] A final clean-clone readiness audit using Node 22.13.0, Corepack 0.34.7, pnpm 11.11.0, frozen dependency installation, the full quality gate, and a clean repository state.

### V1 release decision

- The release target is `1.0.0`.
- The repository is not yet release-ready: GitHub-hosted CI cannot execute because of the current account billing restriction. All local and clean-clone V1 gates pass.
- Existing `0.1.0` metadata remains unchanged until the final release-preparation commit.
- No `v1.0.0` tag will be created until every V1 acceptance gate passes.
- GitHub Release publication remains post-V1.

## Post-V1 - repository lifecycle

- Archive and reactivate commands.
- Manifest migrations.
- Stronger transactional guarantees across multi-file generators.
- Deterministic validation and release reports.
- Central error, event, operation, and prerequisite registries.
- Release versioning and GitHub Release publication.

## Optional advanced capabilities

- ElevenLabs TTS and audio QA.
- OpenAI semantic EN/FR comparison.
- Playwright screenshot scenarios and baseline bundles.
- Template upgrade engine.

## Later only when justified

- Per-option immutable revision graphs.
- Fixture supersession lifecycle and correction workflows.
- Full learner-attempt migration ecosystem.
