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
- `docs/case-studies/cocoa-cooperative-near-soubre.md` defines the unnamed, fictional case shared
  with the course examples.

The session PDF and PPTX are generated from the maintained sources in `teaching/`, not from this
specification. `pnpm teaching:artifact build` creates the bilingual supports, and
`pnpm teaching:artifact verify` independently checks their projected text and notes. The planned
minute total is verified automatically; actual pacing needs an instructor rehearsal.
