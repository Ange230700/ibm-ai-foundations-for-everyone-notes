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
- Course 02 — Generative AI: Introduction and Applications
  - S02 — Introduction to Generative AI / Introduction à l’IA générative
  - Duration: 60 minutes; 26 slides in each language
  - French teaching source: draft available
  - English teaching source: draft available
  - Bilingual structural and contract alignment: verified at the source level
  - The Course 02 French canonical adaptations still await personal review.
  - S02 is declared in `manifest.json`; draft PDF and native PPTX generation is available.
- Course 03 — Generative AI: Prompt Engineering Basics
  - S03 — Principes de base de la conception des prompts
  - Duration: 60 minutes; 25 slides in each language
  - French and English teaching sources: drafts available and structurally aligned with the S03 content contract
  - S03 is declared in `manifest.json`; draft PDF and PPTX generation is available
  - The Course 03 French canonical adaptations still await personal review.

## Session artifacts

The Mermaid visuals for S01–S03 use a wide diagram area above the slide's teaching points.
Their short labels preserve the underlying process while leaving the fuller explanation in
the slide text and presenter notes. After editing a `.mmd` file, regenerate its SVG with
`node --import tsx scripts/generate-s01-visuals.mjs --diagrams-only` (or the corresponding
S02/S03 script). Rebuild and verify the affected PPTX, then regenerate the animated copy.
`--diagrams-only` leaves the simulated screen images untouched. The presentation tests
check the minimum projected size of the Mermaid node labels.

`manifest.json` declares the bilingual S01 source and its 30-slide, 60-minute delivery contract.
Use `pnpm teaching:artifact plan` to inspect the targets, `pnpm teaching:artifact build` to
generate both languages in PDF and native PPTX, and `pnpm teaching:artifact verify` to recheck
the generated files against the current sources. Add `--lang=en|fr` or `--format=pdf|pptx` to
select a subset. Outputs are written under `.artifacts/teaching-sessions/s01/<language>/`.
`pnpm teaching:artifact visual-qa --format=pdf` creates page images and contact sheets for
inspection. PPTX visual QA uses LibreOffice when available.

On Windows with desktop PowerPoint, run `pnpm teaching:artifact animate --session=s01` after
building the PPTX files to create `session-animated.pptx` beside each language's static PPTX.
The S01 PPTX includes four Mermaid diagrams and two clearly labelled simulated screens in each
language. Its 30 presenter notes use a bold key message, underlined action cues, and compact
source references; the editable teaching Markdown remains the source of the full text.
The visuals are kept in `teaching/visuals/s01/`. After editing the Mermaid or HTML sources,
regenerate the SVG and PNG files with `node --import tsx scripts/generate-s01-visuals.mjs` before
building and animating again.
The animation plan comes from the current teaching sources and covers all 30 slides in both
languages. The cover reveals its main heading and context together, slide 19 reveals its complete table,
and the other 28 slides reveal each row after the first on click; the first row is visible on
arrival. This plan contains 90 clicks and 267 individual PowerPoint shape effects per language.
The command checks the source PPTX before animation, then checks every slide and each animated
shape after saving the copy. Rerun it after rebuilding S01 to refresh these copies. The 30-slide,
60-minute contract and PDF output remain the same.

The PDF contains the projected slides. The editable PPTX also includes facilitation notes and
source references in its speaker notes. Generation checks slide count and planned duration;
the instructor must still rehearse the 60-minute delivery and visually inspect both formats
before distributing them as final supports.

For S02, run `pnpm teaching:artifact plan --session=s02`, then
`pnpm teaching:artifact build --session=s02` and
`pnpm teaching:artifact verify --session=s02`. The four draft outputs live under
`.artifacts/teaching-sessions/s02/<language>/`; `visual-qa --session=s02 --format=pdf`
provides contact sheets. S02 has 26 slides per language and the same rich presenter-note
formatting as S01. Its PPTX includes four Mermaid diagrams and five clearly labelled teaching
simulations per language: the prompt, a wrong response, its revision, a poster, and a local HTML
guide. The editable sources are in `teaching/visuals/s02/`. Regenerate SVG and PNG assets with
`node --import tsx scripts/generate-s02-visuals.mjs` before rebuilding S02 PPTX. These screens
were authored for teaching and are not captured responses from an AI service. On Windows with
desktop PowerPoint, run `pnpm teaching:artifact animate --session=s02` after building the PPTX to
create `session-animated.pptx` for both languages. The plan covers all 26 slides, including 53
clicks and 158 shape effects per language; diagrams and simulation screens are visible when the
slide opens, while text rows reveal one by one. The Course 02 French adaptations still need
personal review, and the draft decks need visual inspection and a timed rehearsal before release.

For S03, run `pnpm teaching:artifact plan --session=s03`, then
`pnpm teaching:artifact build --session=s03` and
`pnpm teaching:artifact verify --session=s03`. The four draft files are generated under
`.artifacts/teaching-sessions/s03/<language>/`. Run
`pnpm teaching:artifact visual-qa --session=s03 --format=pdf` to create PDF page images and
contact sheets for review. These 25-slide decks include speaker notes and slide numbering.
The S03 PPTX includes four Mermaid diagrams and five clearly labelled fictional teaching
screens per language. Their editable sources live in `teaching/visuals/s03/`; regenerate SVG
and PNG files with `node --import tsx scripts/generate-s03-visuals.mjs` before building S03
PPTX. These images are not captures of a real model interaction. On Windows with desktop
PowerPoint, run `pnpm teaching:artifact animate --session=s03` after building and verifying
the PPTX to create `session-animated.pptx` for both languages. The plan covers 25 slides,
52 clicks and 155 shape effects per language: the images remain visible on arrival, and the
text rows reveal one by one. The command reopens both saved decks to verify every animated
shape and trigger. A timed rehearsal and visual review remain necessary before release.
The canonical Course 03 French adaptations still need personal review; the bilingual drafts
need visual inspection and a timed rehearsal before release.
