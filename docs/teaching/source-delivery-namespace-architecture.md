# Canonical Source and Teaching Delivery Namespace Architecture

## 1. Purpose

This document defines the boundary between the repository's canonical IBM/Coursera learning
content and its independent professional teaching curriculum.

The repository contains two different ordered structures:

1. the four canonical courses of IBM's AI Foundations for Everyone Specialization;
2. the independent professional teaching sessions maintained by this repository.

Their numbering is independent.

A teaching-session identifier such as `s04` must never imply that the session corresponds to
canonical Course 04.

## 2. Current problem

The current repository model couples each registered teaching session to exactly one canonical
course through `teachingSessions[].courseId`.

The maintained teaching sources also live beneath course-shaped paths such as:

```text
teaching/courses/03-generative-ai-prompt-engineering-basics/...
```

This worked for S01-S03 because their initial development happened to align closely with canonical
Courses 01-03.

That relationship does not hold for the professional curriculum as a whole.

The professional curriculum is:

```text
S01 — Understanding AI
S02 — Using Generative AI at Work
S03 — Designing Effective Prompts
S04 — Working with Documents and Information
S05 — Building an AI-Assisted Workflow
S06 — Security, Privacy, Responsibility
S07 — End-to-End Professional Workshop
```

Canonical Course 04 is:

```text
Building AI Powered Chatbots Without Programming
```

Professional S04 therefore has no ordinal relationship with canonical Course 04.

Future professional sessions may also draw from modules belonging to more than one canonical
course.

## 3. Decision

Canonical courses and professional teaching sessions are separate namespaces.

### Canonical namespace

The canonical source hierarchy remains:

```text
program
└── courses[]
    └── modules[]
```

Canonical course identity is defined by:

- course UUID;
- course ordinal;
- course slug;
- bilingual course title.

Canonical module identity is defined by:

- module UUID;
- module ordinal within its course;
- module slug;
- bilingual module title;
- bilingual canonical source paths.

Nothing in the teaching-session namespace changes canonical course numbering.

### Teaching namespace

Professional delivery remains represented by:

```text
teachingSessions[]
```

Each teaching session has its own independent identity:

- session ID, such as `s01` or `s04`;
- session slug;
- bilingual session title;
- duration;
- slide count;
- bilingual maintained teaching-source paths;
- explicit canonical module provenance.

Session IDs are ordered delivery identifiers only.

They do not identify canonical courses.

## 4. Manifest model

The current teaching-session field:

```json
{
  "id": "s03",
  "courseId": "course_...",
  "durationMinutes": 60,
  "slideCount": 25,
  "source": {
    "en": "...",
    "fr": "..."
  }
}
```

will be replaced by a model equivalent to:

```json
{
  "id": "s03",
  "slug": "designing-effective-prompts",
  "title": {
    "en": "Designing Effective Prompts",
    "fr": "Concevoir de bons prompts"
  },
  "canonicalModuleIds": ["module_..."],
  "durationMinutes": 60,
  "slideCount": 25,
  "source": {
    "en": "teaching/sessions/s03-designing-effective-prompts/en/session.md",
    "fr": "teaching/sessions/s03-designing-effective-prompts/fr/session.md"
  }
}
```

The exact UUID values remain those already assigned to canonical modules.

No new canonical module identity is created by the teaching layer.

## 5. Why canonical modules are the provenance unit

Teaching sessions will reference canonical modules rather than canonical courses.

This is intentional.

A course-level reference is too coarse because it implies that a teaching session derives from the
entire course and prevents a session from cleanly combining selected material from multiple
courses.

`canonicalModuleIds` provides precise provenance.

For S01-S03, the migration will preserve their current canonical source coverage by registering the
same modules already used by their maintained teaching sources.

For S04-S07, module provenance will be selected from the actual source material used by each
session.

A module from canonical Course 04 must be listed only when its content is actually used.

The fact that a professional session is numbered S04 is never sufficient reason to reference
canonical Course 04.

## 6. Professional-practice inputs

`canonicalModuleIds` records provenance from the repository's canonical IBM/Coursera learning
layer.

It does not claim to enumerate every professional-practice input used during curriculum design.

Professional extensions, collaborative inputs, case-study decisions, and other non-canonical
material remain documented in the corresponding:

- curriculum contract;
- session content contract;
- fusion audit;
- teaching metadata;
- source-attribution notes.

This distinction prevents the manifest from falsely representing professional extensions as
canonical IBM material.

## 7. Teaching-source path layout

Maintained teaching sessions will no longer live under `teaching/courses/`.

The target structure is:

```text
teaching/
├── sessions/
│   ├── s01-understanding-ai/
│   │   ├── en/
│   │   │   └── session.md
│   │   └── fr/
│   │       └── session.md
│   ├── s02-using-generative-ai-at-work/
│   │   ├── en/
│   │   │   └── session.md
│   │   └── fr/
│   │       └── session.md
│   ├── s03-designing-effective-prompts/
│   │   ├── en/
│   │   │   └── session.md
│   │   └── fr/
│   │       └── session.md
│   └── ...
└── visuals/
    ├── s01/
    ├── s02/
    ├── s03/
    └── ...
```

The generic filename `session.md` is deliberate.

Session identity belongs to the directory and manifest rather than to a title-dependent filename.

The existing visual namespace is already session-based and remains unchanged.

## 8. Teaching specifications

Content contracts remain session-based under:

```text
docs/teaching/
```

Examples:

```text
s01-ai-fundamentals-60-min-content-contract.md
s02-generative-ai-60-min-content-contract.md
s03-prompt-engineering-60-min-content-contract.md
```

Future contracts may use the professional session slug in their filename, but canonical course
ordinals must not be inferred from the session ordinal.

## 9. Source resolution

Teaching tooling must resolve canonical sources from `canonicalModuleIds`.

For every registered module ID, the resolver must:

1. find exactly one canonical module in `manifest.courses`;
2. retrieve that module's source path for the requested language;
3. preserve the order declared by the teaching session;
4. pass those paths to teaching-source validation.

A missing canonical module ID is an error.

A duplicate canonical module ID inside one teaching session is an error.

The same canonical module may legitimately be used by multiple different teaching sessions.

## 10. Bilingual invariants

Namespace separation does not weaken existing bilingual requirements.

Every registered teaching session must continue to preserve:

- English and French teaching sources;
- equal slide counts;
- equal planned duration;
- aligned projected-content structure;
- source attribution;
- AI-generation disclosure;
- canonical-source traceability;
- human-responsibility boundaries.

## 11. Session identity invariants

For `teachingSessions`:

- every `id` is unique;
- every `slug` is unique;
- every session has one English and one French title;
- every `canonicalModuleIds` entry resolves to an existing canonical module;
- module IDs cannot repeat within one session;
- session numbering is independent of canonical course ordinals.

No validation rule may require:

```text
S01 -> Course 01
S02 -> Course 02
S03 -> Course 03
S04 -> Course 04
```

Such ordinal correspondence is explicitly not part of the architecture.

## 12. Manifest schema version

Removing `courseId` and introducing explicit module provenance changes the meaning and structure of
registered teaching sessions.

The manifest schema must therefore move from schema version 1 to schema version 2.

The generated JSON Schema must be regenerated from the TypeScript/Zod authority.

No compatibility shim is required inside this configured repository once the migration is complete.

## 13. Migration of S01-S03

The migration must preserve behavior.

For each existing session:

### S01

- retain ID `s01`;
- retain 30 slides;
- retain 60 minutes;
- retain its current canonical Course 01 module provenance;
- move maintained teaching sources to `teaching/sessions/s01-understanding-ai/`.

### S02

- retain ID `s02`;
- retain 26 slides;
- retain 60 minutes;
- retain its current canonical Course 02 module provenance;
- move maintained teaching sources to `teaching/sessions/s02-using-generative-ai-at-work/`.

### S03

- retain ID `s03`;
- retain 25 slides;
- retain 60 minutes;
- retain its current canonical Course 03 module provenance;
- move maintained teaching sources to `teaching/sessions/s03-designing-effective-prompts/`.

The migration must not alter instructional content merely because paths and manifest relationships
change.

## 14. S04 consequence

The next professional session is:

```text
S04 — Working with Documents and Information
```

Its identity will be independent of canonical Course 04.

When S04 is designed, its `canonicalModuleIds` will be selected from the canonical modules actually
used by the session.

If chatbot material from canonical Course 04 is not used, S04 will contain no Course 04 module ID.

If useful material comes from multiple canonical courses, S04 may reference modules from all of
those courses.

This is expected behavior.

## 15. Tooling consequences

The migration will require updates to code that currently reads `session.courseId`.

Affected areas must be identified before implementation and may include:

- manifest schema and validation;
- generated `manifest.schema.json`;
- teaching artifact planning/building/verification;
- teaching-session tests;
- presentation tests;
- repository checks;
- fixtures and helpers;
- documentation referring to course-shaped teaching paths.

Tooling must resolve canonical module provenance centrally rather than reimplementing lookup logic
in multiple consumers where practical.

## 16. Artifact behavior

Generated artifact identity remains session-based:

```text
.artifacts/teaching-sessions/<session-id>/<language>/
```

No output path change is required.

Existing commands remain conceptually unchanged:

```text
pnpm teaching:artifact plan --session=s03
pnpm teaching:artifact build --session=s03
pnpm teaching:artifact verify --session=s03
pnpm teaching:artifact visual-qa --session=s03
pnpm teaching:artifact animate --session=s03
```

The namespace refactor must not change slide counts, durations, projected content, visuals, or
animation behavior for S01-S03.

## 17. Non-goals

This architecture change does not:

- redesign S01-S03 content;
- design S04 content;
- rename canonical IBM courses;
- change canonical course ordinals;
- merge canonical and professional curricula;
- decide the final public title of the professional curriculum;
- claim that professional extensions originate from IBM or Coursera;
- change generated artifact formats;
- change existing human-review requirements.

## 18. Implementation order

The implementation sequence is:

```text
Architecture decision
        ↓
Reference audit
        ↓
Manifest schema v2
        ↓
Canonical-module provenance resolver
        ↓
Manifest migration for S01-S03
        ↓
Teaching-source path migration
        ↓
Consumer and test migration
        ↓
Documentation alignment
        ↓
Full repository validation
        ↓
Artifact regression check
        ↓
Begin S04 contract
```

The repository must remain internally consistent at every committed checkpoint.

## 19. Acceptance criteria

The namespace migration is complete when:

1. `manifest.json` uses schema version 2.
2. Registered teaching sessions no longer contain `courseId`.
3. Every teaching session declares a unique slug and bilingual title.
4. Every teaching session declares explicit `canonicalModuleIds`.
5. All declared module IDs resolve to canonical modules.
6. S01-S03 preserve their existing canonical source coverage.
7. Maintained teaching sources live under `teaching/sessions/`, not `teaching/courses/`.
8. Existing session IDs, slide counts, durations, content, visuals, and animation behavior remain
   unchanged.
9. Teaching artifact tooling supports canonical modules from more than one course.
10. No code assumes that a session ordinal equals a course ordinal.
11. The generated manifest JSON Schema matches the Zod schema.
12. Repository structure, lint, typecheck, tests, and full validation pass.
13. S01-S03 artifact plans still resolve correctly.
14. Documentation clearly distinguishes canonical courses from professional sessions.
15. S04 can be created without assigning it to canonical Course 04.

## 20. Governing rule

The governing rule is:

> Canonical courses describe where knowledge comes from. Teaching sessions describe how this
> repository delivers selected knowledge.

The two structures may overlap, but neither one's numbering defines the other.
