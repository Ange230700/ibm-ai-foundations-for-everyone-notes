# Completed-course import

This repository reuses Courses 01–03 already completed in the IBM Generative AI Engineering learning route. The notes are independent copies owned by this repository after import. The source repository remains unchanged.

## Source and destination

- Source repository: [Ange230700/ibm-generative-ai-engineering-notes](https://github.com/Ange230700/ibm-generative-ai-engineering-notes).
- Source revision: [31acf050aac1d950279ee08e76e0f9489f5ab9fe](https://github.com/Ange230700/ibm-generative-ai-engineering-notes/tree/31acf050aac1d950279ee08e76e0f9489f5ab9fe).
- Destination base: `5d6f36545a93f8978b908218e8c25f1f4393e168` in `Ange230700/ibm-ai-foundations-for-everyone-notes`.
- Import prepared: 2026-09-21.
- File-level mapping and SHA-256 checksums: [completed-courses.json](./completed-courses.json).

| Course | Source folder                                    | Destination folder                               | Modules |
| ------ | ------------------------------------------------ | ------------------------------------------------ | ------- |
| 01     | `01-introduction-to-artificial-intelligence`     | `01-introduction-to-artificial-intelligence-ai`  | 4       |
| 02     | `02-generative-ai-introduction-and-applications` | `02-generative-ai-introduction-and-applications` | 3       |
| 03     | `03-generative-ai-prompt-engineering-basics`     | `03-generative-ai-prompt-engineering-basics`     | 3       |

The existing program and course IDs, ordinals, slugs and titles remain authoritative. The ten new module IDs belong to this destination manifest. Each module has matching EN/FR filenames under its course language directories. Course 04 remains planned and has no imported modules.

## Canonical content

The English module files are byte-for-byte copies of the pinned source revision. Their hashes record that original snapshot, including historical editorial checkboxes, source-program references, assessment caveats and unverified tool descriptions. The adapted course indexes explain the destination specialization and the separate completion evidence.

The ten French modules are newly written adaptations of those English modules. They preserve the learning objectives, principal concepts, exercises, explicit source uncertainties, diagrams and literal code/prompt examples. Repeated prose and some subsection structure are condensed. They are not represented as verbatim translations or as previously reviewed French source notes. All require the owner's personal review. English prompt examples remain in English so that their literal content can be checked against the source.

The source repository's French teaching materials are a separate pedagogical product and were not substituted for canonical French notes. No source PDF/PPTX exports, teaching scripts, transcripts, quiz-answer dumps or build caches are imported.

Each language is a canonical Markdown input in this repository. Module identity is shared between languages; editorial subsection IDs and any future slide sequences can differ. This import does not claim full slide-by-slide bilingual identity or visual artifact validation.

## Completion and editorial status

The three unmodified PDFs supplied by the owner are indexed in the [certificate register](../../certificates/README.md), with printed completion dates, verification URLs and SHA-256 checksums. These are evidence of the three individual course completions. They do not establish completion of Course 04, this specialization, or every optional exercise mentioned in the historical notes.

All three imported courses use `notes-in-progress` in the manifest while the new French adaptations await personal review. This status describes the notes lifecycle, not the owner's Coursera achievement. The existing schema is unchanged; certificate metadata lives outside the strict manifest.

The original English checkboxes and statements about missing certificates or results describe what was available when those notes were authored. The certificate register records the newly supplied evidence. Neither certificate import nor French drafting marks a module as personally reviewed, an artifact as visually verified, or a course release as complete.

## Future maintenance

1. Review the French adaptations against the pinned English sources and make corrections in the canonical language files.
2. Keep the import checksums as historical provenance when making later edits; they are not checksums of an automatically synchronized live source.
3. To bring in later source changes, compare a specifically chosen upstream revision, review the diff, adapt the destination files and record that new import separately.
4. Generate future derivatives from the destination manifest and canonical Markdown using its artifact tooling. Destination IDs and content provenance must describe those new artifacts.
5. Run `pnpm check:full` before committing or publishing. Advance lifecycle statuses only when the corresponding review and artifact work is complete.

This is a one-time content import. It adds no Git submodule, cross-repository runtime dependency, shared-file indirection or template-engine change.
