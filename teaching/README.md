# Teaching adaptations

This directory contains instructor-led teaching sources derived from the canonical bilingual
learning content under `courses/`.

## Authority boundary

- `manifest.json` defines the canonical program, course, module, and source mappings.
- `courses/` remains authoritative for the complete bilingual course knowledge.
- `docs/teaching/` defines approved delivery contracts.
- `teaching/` contains maintained teaching adaptations that implement those contracts.
- Generated TXT, PDF, and PPTX files remain derivatives and must not be edited directly.

Teaching adaptations may select, reorder, simplify, and contextualize canonical concepts for a
specific audience and duration. They must preserve meaning, source traceability, bilingual alignment,
and explicit human responsibility for consequential decisions.

## Current sessions

- Course 01 — Introduction to Artificial Intelligence (AI)
  - S01 — AI Fundamentals / Fondamentaux de l’IA
  - Duration: 60 minutes
  - French teaching source: available
  - English teaching source: available
  - Bilingual structural alignment: verified

## Session artifacts

`manifest.json` declares the bilingual S01 source and its 30-slide, 60-minute delivery contract.
Use `pnpm teaching:artifact plan` to inspect the targets, `pnpm teaching:artifact build` to
generate both languages in PDF and native PPTX, and `pnpm teaching:artifact verify` to recheck
the generated files against the current sources. Add `--lang=en|fr` or `--format=pdf|pptx` to
select a subset. Outputs are written under `.artifacts/teaching-sessions/s01/<language>/`.
`pnpm teaching:artifact visual-qa --format=pdf` creates page images and contact sheets for
inspection. PPTX visual QA uses LibreOffice when available.

On Windows with desktop PowerPoint, run `pnpm teaching:artifact animate --session=s01` after
building the PPTX files to create `session-animated.pptx` beside each language's static PPTX.
The animation plan comes from the current teaching sources. Slides 02, 03, and 08 reveal each
remaining row on click in both languages; the first row is visible on arrival. The command checks
the source PPTX before animation, then checks the copied PPTX and its click sequence. Rerun it
after rebuilding S01 to refresh these copies. The 30-slide, 60-minute contract and PDF output
remain the same.

The PDF contains the projected slides. The editable PPTX also includes facilitation notes and
source references in its speaker notes. Generation checks slide count and planned duration;
the instructor must still rehearse the 60-minute delivery and visually inspect both formats
before distributing them as final supports.
