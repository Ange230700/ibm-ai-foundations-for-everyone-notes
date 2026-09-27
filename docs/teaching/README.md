# Teaching specifications

This directory contains delivery specifications derived from the canonical learning content.

## Authority boundary

- `manifest.json` remains the authority for program, course, module, and source mappings.
- `courses/` remains the authority for bilingual canonical learning content.
- Files in `docs/teaching/` define a curated delivery plan for a specific teaching session.
- Teaching specifications do not replace canonical modules; maintained session sources are
  declared separately in `manifest.json` under `teachingSessions`.

## Current specification

- `s01-ai-fundamentals-60-min-content-contract.md` defines the aligned French and English
  content contract for a 60-minute AI fundamentals session.
- `s02-generative-ai-60-min-content-contract.md` proposes the aligned French and English
  60-minute introduction to generative AI. The canonical Course 02 French adaptations still await
  personal review. The bilingual S02 teaching sources are drafts under `teaching/courses/02-generative-ai-introduction-and-applications/`;
  S02 has no generated artifacts yet.
- `docs/case-studies/cocoa-cooperative-near-soubre.md` defines the unnamed, fictional case shared
  with the course examples.

Session PDF and PPTX are generated from the maintained sources in `teaching/`. For S01,
`pnpm teaching:artifact build` creates the bilingual supports, and
`pnpm teaching:artifact verify` checks their projected text and notes. S02 must be declared
and supported by the artifact pipeline before it can be built. Actual pacing needs an instructor
rehearsal.
