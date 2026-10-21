# Authored delivery variants

## Authority and source layout

The repository keeps four distinct layers:

1. `courses/` remains the canonical bilingual IBM/Coursera learning material and factual foundation.
2. `teaching/sessions/` remains the independent professional curriculum, with its own S01–S07 IDs.
3. Maintained delivery Markdown is authored for a specific editorial profile and language.
4. PDFs, TXT files, narration chunks, production manifests, and QA evidence are generated artifacts.

A teaching-session number is never derived from or coupled to a canonical course number. Existing
`session.md` files and the presentation workflow are unchanged. S06 pilot variants are registered
inside its manifest entry, with source files at:

```text
teaching/sessions/s06-security-privacy-and-responsibility/
└── deliveries/
    ├── document/{en,fr}.md
    ├── reference/{en,fr}.md
    └── narration/{en,fr}.md
```

Each profile/language source registration includes:

- an exact maintained source path;
- `contentRelationship`: `adaptation` or `translation`;
- `editorialStatus`: `draft` or `reviewed`;
- canonical module IDs for provenance;
- narration-only speaking rate and pronunciation guidance, kept out of spoken text.

Unavailable profiles are omitted rather than synthesized from another language or profile. A
session-wide build skips absent optional registrations; an explicit request for an unavailable
session/profile/language fails with a direct message. No language is silently substituted.

## Editorial profiles and compatible output formats

| Editorial profile | Purpose and maintained-source contract                                                                                                                                                             | Output formats                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `presentation`    | Existing slide-oriented `session.md`; the current teaching artifact pipeline remains authoritative for this profile.                                                                               | PPTX, slide PDF, optional TXT                 |
| `document`        | Standalone reading document with a title, connected explanations, section headings, examples, and attribution. It may reorganize and expand ideas without slide timing or slide-count constraints. | Paginated document PDF, TXT                   |
| `reference`       | Concise standalone lookup or revision notes with headings and predictable lists.                                                                                                                   | TXT, optional document PDF                    |
| `narration`       | Spoken prose paragraphs only. No title, production instructions, metadata, raw URLs, or slide-dependent references are placed in the maintained speech text.                                       | Plain speech-ready TXT and ordered TXT chunks |

The dedicated delivery CLI always requires an explicit profile. A PDF therefore identifies either
`presentation/pdf` through the existing teaching workflow or `document/pdf` (optionally
`reference/pdf`) through the delivery workflow. Output paths and provenance also carry the profile;
document PDFs do not overwrite the existing session slide PDFs.

## Commands

Existing presentation commands and source paths remain valid. Add TXT when wanted:

```powershell
pnpm teaching:artifact build --session=s06 --lang=en --format=txt
pnpm teaching:artifact verify --session=s06 --lang=en --format=txt
```

Plan, build, verify, and visually inspect authored variants with the profile-aware CLI:

```powershell
pnpm delivery:artifact plan --session=s06 --profile=document
pnpm delivery:artifact build --session=s06 --profile=document --format=pdf
pnpm delivery:artifact build --session=s06 --profile=document --format=txt
pnpm delivery:artifact verify --session=s06 --profile=document --format=pdf
pnpm delivery:artifact visual-qa --session=s06 --profile=document --format=pdf
pnpm delivery:artifact build --session=s06 --profile=reference --format=txt --lang=fr
pnpm delivery:artifact build --session=s06 --profile=narration --format=txt --lang=en
pnpm delivery:artifact build --session=s06 --profile=narration --format=txt --chunk-limit=1600
```

Without `--lang`, both registered languages are targeted. Planning a profile without `--format`
lists all compatible formats. Narration's default chunk limit is 2,400 Unicode code points. It can
be lowered with `--chunk-limit`; values above 2,400 are rejected to stay within a conservative
manual-input target. A paragraph is kept intact where possible; longer paragraphs split at sentence
boundaries. A sentence that cannot fit is reported for editorial splitting rather than cut
arbitrarily. Chunk IDs are derived from the session, language, and chunk text; sequence and path
are recorded separately.

The `teaching.delivery-variants` validation task checks registered sources and profile contracts.
The validation planner selects it when manifest, teaching source, or delivery renderer inputs
change. Artifact impact analysis identifies affected authored delivery targets for direct source
changes and linked canonical-module changes.

## Documents and references

Document and reference PDFs reuse the repository's Markdown-to-document renderer, A4 typography,
table treatment, page numbering, PDF semantic checks, and page-render/contact-sheet visual QA.
Rendering rejects horizontal overflow and failed local image loads; PDF verification checks that
source text survives pagination in order. TXT uses the shared semantic Markdown text renderer,
UTF-8 validation, predictable heading underlines and list markers.

The S06 document explains the evidence, permission, and authority checks in connected prose. Its
CP-A and lot facts are from the maintained fictional S06 exercise packet, not from canonical IBM
material. The attribution section distinguishes canonical course concepts, professional teaching
adaptation, and the fictional example. It does not mechanically turn slides or speaker notes into
sections.

## Narration and ElevenLabs workflow

The maintained narration Markdown contains only words intended to be spoken, in natural paragraphs.
The renderer rejects headings, tables, lists, links, raw URLs, and slide-dependent phrases in this
profile. Production instructions and pronunciation notes are manifest metadata and appear only in a
separate generated production manifest. The TXT and chunk files contain no SSML, bracketed
directions, pause tags, or other model-specific controls. No pronunciation substitutions are
applied automatically.

The pilot targets **manual text entry in ElevenLabs Text to Speech on the web**, not document
import, Studio, or the API. ElevenLabs' current help article states a single-generation text limit
of 2,500 characters on free plans and 5,000 on paid plans. The default 2,400-character chunk target
leaves a small margin below the published free-plan limit. Character counting and product limits
can change; confirm the current UI and account limit before generation.

ElevenLabs Studio is a separate long-form project workflow: its documentation describes uploading
existing text/audio files and working with chapters. This repository does not create a Studio
project or claim that its manual-input chunks are Studio import boundaries. The Text-to-Speech API
is a third workflow: its official conversion endpoint takes text, a voice ID, and optionally a
model ID; it requires authenticated API use. Official help documents API text limits by model,
including up to 10,000 characters for Multilingual v2. The repository does not call the API,
select a model or voice, configure an account, require credentials, or generate paid audio.

Official references checked on 21 October 2026:

- [ElevenLabs text input limits](https://help.elevenlabs.io/hc/en-us/articles/13298164480913-What-s-the-maximum-amount-of-characters-and-text-I-can-generate)
- [ElevenLabs Studio](https://elevenlabs.io/docs/eleven-creative/products/studio)
- [ElevenLabs Text-to-Speech API: Create speech](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)

The production manifest records the source and canonical hashes, ordered chunk IDs and paths,
character and word counts, pronunciation notes, and an estimated duration with its assumed
words-per-minute rate. Duration is a planning estimate, not measured audio length. Different
language scripts use distinct rates and chunk boundaries.

## Provenance, staleness, and editorial review

Each generated artifact record identifies the teaching target, language, editorial profile, output
format, maintained source path and SHA-256, canonical module IDs and source hashes, renderer
identity, and generated output path and SHA-256. PDF rendering also records its stylesheet, HTML,
browser, renderer, page count, and semantic identity. The narration production manifest is separate
from spoken text.

`verify` compares the maintained source and canonical source hashes with the recorded artifact. A
changed canonical source marks the variant as needing editorial review. Rebuilding is blocked until
the source registration explicitly changes `editorialStatus` to `reviewed`; after review, a new
build records the updated source relationship. A hash proves byte identity only. It cannot prove
that a paraphrase, translation, example, qualification, or cross-language adaptation is
semantically faithful.

Automated checks cover manifest shape, exact source resolution, supported profile/format pairs,
Markdown contracts, UTF-8 and text export, chunk boundaries and limits, exclusion of production
metadata from narration, output hashes, PDF text integrity, pagination, and visual-QA rendering.
Human review is still required for factual meaning, qualifications, attribution, fictional-example
labeling, privacy choices, translation quality, spoken naturalness, pronunciation, and final visual
quality. The registered pilot sources are marked `draft` pending that review.

All generated files are written below ignored `.artifacts/` paths. Authored Markdown, source
registration, and documentation remain in Git.
