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
  personal review. The bilingual S02 teaching sources are drafts under
  `teaching/courses/02-generative-ai-introduction-and-applications/`. S02 PDF and PPTX drafts,
  teaching visuals, and animated PPTX copies can be generated. Visual inspection and a timed
  rehearsal are still required before release.
- `s03-prompt-engineering-60-min-content-contract.md` proposes a bilingual 25-slide,
  60-minute prompt-design session using the same fictional lot-intake instruction as S02. The
  canonical Course 03 French adaptations await personal review. French and English
  teaching-source drafts are available and structurally aligned; derivative artifacts have not
  yet been produced.
- `docs/case-studies/cocoa-cooperative-near-soubre.md` defines the unnamed, fictional case shared
  with the course examples.

Session PDF and PPTX are generated from the maintained sources in `teaching/`. Run
`pnpm teaching:artifact build --session=s01` or `pnpm teaching:artifact build --session=s02`
to select one session, then replace `build` with `verify` to check its projected text and
notes. S03 is a content contract only and is not a registered artifact target yet. Actual pacing
needs an instructor rehearsal.
