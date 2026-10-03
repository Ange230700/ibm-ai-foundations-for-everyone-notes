# Teaching specifications

This directory contains delivery specifications derived from the canonical learning content.

## Attribution and AI-generation requirement

Every teaching session registered in `manifest.json` must preserve source attribution and AI
transparency in both languages.

Each maintained session source must:

- identify the original learning provider and delivery platform declared in `manifest.json`;
- state explicitly in its teaching metadata that the session is generated with AI as an independent
  repository adaptation;
- repeat a compact source acknowledgment on Slide 01;
- repeat a compact AI-generation disclosure on Slide 01;
- avoid presenting repository-specific wording, examples, case studies, sequencing, or presentation
  design as official material from the original provider or platform.

The Slide 01 requirement ensures that attribution and AI disclosure remain visible when a teaching
session is exported to PDF or PPTX independently of the repository.

Repository tests enforce these requirements for every registered teaching session. Adding a future
session without the required metadata and Slide 01 disclosures must fail validation.

## Authority boundary

- `manifest.json` remains the authority for program, course, module, and source mappings.
- `courses/` remains the authority for bilingual canonical learning content.
- Files in `docs/teaching/` define a curated delivery plan for a specific teaching session.
- Teaching specifications do not replace canonical modules; maintained session sources are
  declared separately in `manifest.json` under `teachingSessions`.
- Each maintained session source path is derived from its manifest identity:
  `teaching/sessions/<id>-<slug>/<language>/session.md`.

## Current specification

- `s01-ai-fundamentals-60-min-content-contract.md` defines the aligned French and English
  content contract for the 60-minute Understanding AI / Comprendre l’IA professional-curriculum session.
- `s02-generative-ai-60-min-content-contract.md` defines the aligned French and English
  60-minute Using Generative AI at Work / Utiliser l’IA générative au travail
  professional-curriculum session. The bilingual S02 teaching sources implement the approved
  professional-fusion contract under
  `teaching/sessions/s02-using-generative-ai-at-work/`. The session preserves the
  fictional Soubré anchor while adding transferable professional tasks, source-preserving
  transformations, explicit verification, and human responsibility. Its teaching visuals are
  aligned with the revised semantics, and its animation plan covers 26 slides, 68 clicks, and 203
  shape effects per language. The current bilingual PDF and PPTX artifacts have been regenerated
  and verified. PDF visual QA, bilingual animated-PowerPoint human review, and the timed rehearsal
  have passed for this production cycle. The canonical Course 02 French adaptations still await
  personal review.
- `s03-prompt-engineering-60-min-content-contract.md` defines the aligned
  25-slide, 60-minute Designing Effective Prompts / Concevoir de bons prompts
  professional-curriculum session. The bilingual S03 teaching sources implement the approved
  professional-fusion contract under
  `teaching/sessions/s03-designing-effective-prompts/`. The session preserves the
  fictional Soubré source-constrained exercise while introducing the seven-element practical
  prompt framework, purposeful technique selection, targeted iteration, reusable prompt
  templates, professional transfer, output evaluation, and explicit human responsibility.
  Its teaching visuals are aligned with the revised semantics, and its animation plan covers
  25 slides, 75 clicks, and 224 shape effects per language. The current bilingual PDF and PPTX artifacts have been regenerated and verified. PDF visual
  QA, bilingual animated-PowerPoint human review, and the timed rehearsal have passed for this
  production cycle. The canonical Course 03 French adaptations still await personal review.
- `docs/case-studies/cocoa-cooperative-near-soubre.md` defines the unnamed, fictional case shared
  with the course examples.

Session PDF and PPTX artifacts are generated from maintained sources under
`teaching/sessions/`. Use:

```text
pnpm teaching:artifact build --session=sNN
pnpm teaching:artifact verify --session=sNN
```

The currently registered sessions are S01-S03. Session source paths are derived from each
manifest entry's ID and slug, so future sessions use the same namespace without being assigned to a
same-numbered canonical course. Actual pacing needs an instructor rehearsal.
