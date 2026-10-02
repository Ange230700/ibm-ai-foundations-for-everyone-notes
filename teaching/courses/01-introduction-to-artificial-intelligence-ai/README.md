# Course 01 teaching pack — Introduction to Artificial Intelligence (AI)

This teaching pack adapts the four canonical Course 01 modules into shorter instructor-led sessions.

## Source of truth

The complete bilingual learning notes remain authoritative:

- `courses/01-introduction-to-artificial-intelligence-ai/en/`
- `courses/01-introduction-to-artificial-intelligence-ai/fr/`

The bilingual delivery contract for the first session is:

- `docs/teaching/s01-ai-fundamentals-60-min-content-contract.md`

The unnamed fictional cocoa cooperative near Soubré is defined in
`docs/case-studies/cocoa-cooperative-near-soubre.md`. Its proposed AI uses must not be attributed
to a real cooperative.

## Session structure

Each language uses a dedicated session source:

```text
teaching/courses/01-introduction-to-artificial-intelligence-ai/
├── en/
│   └── sessions/
│       └── s01-ai-fundamentals.md
└── fr/
    └── sessions/
        └── s01-fondamentaux-de-l-ia.md
```

The English and French sources preserve the same 30 identifiers, order, durations, learning
functions, and case-study decisions. They are conceptually equivalent adaptations rather than
mechanical word-for-word translations.

## Authoring contract

Every slide uses an H2 heading and contains:

- a stable `S01-nn` identifier;
- an explicit duration;
- `On-Slide Content` or `Contenu de la diapositive` for projected text;
- `Teaching Notes` or `Notes pédagogiques` for the key message, explanation, interaction, and
  transition.

The title and objectives slides also declare renderer-oriented semantic roles. Canonical sources are
listed in the session metadata and mapped to slide ranges in its traceability section.

## Production status

These Markdown files are maintained teaching sources, declared under `teachingSessions` in
`manifest.json`. Run `pnpm teaching:artifact build --session=s01`, then
`pnpm teaching:artifact verify --session=s01` to generate and independently check the two PDF
and editable PPTX language variants. Slides retain the identifiers and one-minute to three-minute
allocations from the teaching contract; the PPTX speaker notes include the facilitation text.
Visual review and a timed rehearsal remain necessary before the session is released.

The French and English S01-22 PPTX use unaltered captures of real ChatGPT exchanges at
`teaching/visuals/s01/fr/chat-capture.png` and `teaching/visuals/s01/en/chat-capture.png`.
The cocoa cooperative in the prompts is fictional; both responses still need human review.
The screenshots are maintained source assets and the visual generator does not overwrite them.

On Windows with desktop PowerPoint, `pnpm teaching:artifact animate --session=s01` builds
separate animated PPTX copies after the native PPTX files have been generated. In FR and EN, all
30 slides contain click animations: the cover introduces its subtitle, slide 19 introduces the
complete table, and the other slides reveal their content lines progressively. Each language
keeps the same 30 slides and speaker notes.
