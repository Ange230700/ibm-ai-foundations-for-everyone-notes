# Course 01 teaching pack — Introduction to Artificial Intelligence (AI)

This teaching pack adapts the four canonical Course 01 modules into shorter instructor-led sessions.

## Source of truth

The complete bilingual learning notes remain authoritative:

- `courses/01-introduction-to-artificial-intelligence-ai/en/`
- `courses/01-introduction-to-artificial-intelligence-ai/fr/`

The bilingual delivery contract for the first session is:

- `docs/teaching/s01-ai-fundamentals-60-min-content-contract.md`

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

These Markdown files are maintained teaching sources, but they are not artifact targets in the V1
manifest. PDF and PPTX production requires a separately reviewed pipeline extension. Until then, no
generated session artifact should be treated as a verified release.
