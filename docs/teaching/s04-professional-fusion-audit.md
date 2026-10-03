# S04 Professional Fusion Audit

## Status

- **Session:** S04 — Working with Documents and Information / Travailler avec des documents et des
  informations
- **Audience:** professionals and learners with no technical prerequisite
- **Curriculum position:** VERIFY
- **Central question:** How do I summarize, compare, and analyze without inventing facts?
- **Primary contribution:** source-grounded information work and verification
- **Parent contract:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Current content contract:** not yet created
- **Current teaching sources:** not yet created
- **Slide-count target:** not yet frozen
- **Detailed timing contract:** not yet frozen
- **Purpose of this audit:** establish the canonical provenance, professional-practice boundary,
  instructional role, inherited concepts, exclusions, and design requirements that should govern
  the S04 bilingual content contract.

## 1. Session role in the fused curriculum

S01 answers:

> What is AI, and what should I realistically expect from it?

S02 answers:

> What can I actually do with generative AI professionally?

S03 answers:

> How do I communicate effectively with an AI system?

S04 should answer:

> How do I summarize, compare, and analyze without inventing facts?

S04 therefore moves the learner from designing a useful instruction to working reliably with
information supplied as evidence.

The intended progression is:

```text
SOURCE
    ↓
UNDERSTAND THE TASK
    ↓
EXTRACT
    ↓
TRANSFORM
    ↓
VERIFY AGAINST SOURCE
    ↓
COMMUNICATE
    ↓
HUMAN REVIEW
```

S04 is not primarily a prompt-engineering session.

Prompt discipline remains necessary, but the instructional focus shifts toward:

```text
WHAT DOES THE SOURCE ACTUALLY SUPPORT?
```

and:

```text
HOW DO I PRESERVE THAT BOUNDARY IN THE OUTPUT?
```

## 2. Source and authority boundary

S04 uses the same layered authority model as the professional curriculum.

### 2.1 Canonical IBM/Coursera provenance selected for S04

S04 should draw from three canonical modules.

#### Course 02 / Module 02 — Applications and Tools of Generative AI

- **Module ID:** `module_c9a9a7cf-4a4d-4dd5-b916-d4a9581492d5`
- **Canonical EN source:**
  `courses/02-generative-ai-introduction-and-applications/en/02-applications-and-tools-of-generative-ai.md`

Relevant canonical material includes:

- text generation and transformation;
- summarization as a text-generation application;
- reviewing summaries against supplied material;
- working with reports, articles, and other professional text;
- source gaps and conflicts;
- keeping missing evidence unresolved rather than reconstructing it;
- matching a task to an output;
- reviewing and refining generated results;
- distinguishing recorded claims from verified evidence.

The optional Gemini summarization activity is useful as evidence that document summarization belongs
within the canonical source material.

The product-specific interface instructions are not required for S04.

#### Course 03 / Module 02 — Prompt Engineering: Techniques and Approaches

- **Module ID:** `module_37663745-fa25-44cc-a2aa-a5f91583fefc`
- **Canonical EN source:**
  `courses/03-generative-ai-prompt-engineering-basics/en/02-prompt-engineering-techniques-and-approaches.md`

Relevant canonical material includes:

- source-constrained prompting;
- the Interview Pattern when required information is absent;
- multimodal prompting with documents and images;
- document summarization that includes text, tables, or charts;
- extraction from supplied visual information;
- explicit task and output requirements;
- separating confirmed facts from unverified information;
- accuracy before fluency;
- preferring an explicit limitation over a fluent invention;
- evaluation using explicit criteria.

The SyncroTask role-play is particularly relevant because the initial generated answer introduced
details that were not present in the confirmed source information.

The revised approach separated confirmed facts from unknown details and instructed the model not to
infer unsupported product behavior.

#### Course 01 / Module 04 — Issues, Concerns, and Ethical Considerations

- **Module ID:** `module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`
- **Canonical EN source:**
  `courses/01-introduction-to-artificial-intelligence-ai/en/04-issues-concerns-and-ethical-considerations.md`

Relevant canonical material includes:

- hallucinations;
- factual errors;
- prompt contradiction;
- unsupported or fabricated information;
- verification and fact-checking;
- supplying sufficient context;
- validation processes;
- human review;
- human oversight;
- the principle that fluent or confident language is not evidence that a generated statement is
  true.

S04 should use these concepts operationally rather than turn into a complete responsible-AI or
governance session.

### 2.2 Canonical modules not selected by default

#### Course 03 / Module 01

Course 03 Module 01 contains useful prompt fundamentals, context, constraints, and iterative
refinement.

Those concepts are already taught in S03.

S04 may rely on them as prior learning without registering the module unless the eventual content
contract substantially adapts material directly from that module.

#### Course 03 / Module 03

Course 03 Module 03 contains glossary, quiz, wrap-up, and project material with some relevant
terminology.

The current S04 design does not require it as primary canonical provenance.

It should not be registered merely because keyword matches occur inside glossary or assessment
content.

#### Canonical Course 04 — Building AI Powered Chatbots Without Programming

Canonical Course 04 is not selected for S04.

The reviewed chatbot material concerns areas such as:

- chatbot fundamentals;
- assistant behavior;
- action workflows;
- chatbot risks;
- deployment boundaries;
- staff-facing assistant deployment.

Those concepts are not required to teach S04's document-and-information objectives.

The fact that the professional session is numbered `S04` is not evidence that it should reference
canonical Course 04.

If later S04 design work introduces a specific chatbot concept that is actually adapted from
canonical Course 04, provenance can be reconsidered based on that content.

Until then:

```text
PROFESSIONAL S04 ≠ CANONICAL COURSE 04
```

### 2.3 Collaborative professional-practice input

The existing professional-fusion work records practical guidance contributed by the colleague
manuscript _Cours complet : Utiliser l’intelligence artificielle dans la vie professionnelle_.

Relevant professional practices already captured in the repository include:

- summarize supplied notes without inventing missing details;
- restructure supplied information;
- identify missing facts explicitly;
- preserve meaning during rewriting;
- separate facts from recommendations when appropriate;
- use objectives, audience, length, and permitted sources when preparing reports;
- flag missing information;
- verify names, dates, amounts, commitments, and attachments before sending professional
  communication;
- treat the first generated result as a draft;
- refine after observing a concrete gap;
- preserve unknown information as unknown.

These contributions are professional-practice input.

They are not automatically IBM/Coursera source material.

The colleague manuscript remains outside the repository unless its distribution is explicitly
authorized.

### 2.4 Repository adaptation

The S04 teaching session will be an independent repository adaptation generated with AI and subject
to human review.

The adaptation should combine:

```text
CANONICAL DOCUMENT / TEXT APPLICATIONS
            +
SOURCE-CONSTRAINED PROMPTING
            +
HALLUCINATION AWARENESS
            +
PROFESSIONAL INFORMATION TASKS
            +
SOURCE VERIFICATION
            +
VISIBLE UNKNOWNS
            +
HUMAN RESPONSIBILITY
```

## 3. What S04 inherits from S02

S02 introduces professional uses of generative AI.

Its fusion boundary explicitly allows S02 to introduce:

- summarizing supplied notes;
- restructuring supplied information;
- identifying missing facts.

S02 deliberately does not become the full source-grounded document-analysis session.

It defers to S04:

- detailed summarization;
- comparison;
- extraction;
- information verification.

S04 should therefore deepen these practices rather than repeat the general introduction to
generative-AI workplace applications.

The learner should arrive already understanding that AI may assist with professional information
tasks.

S04 must teach how to perform those tasks with stronger evidence discipline.

## 4. What S04 inherits from S03

S03 establishes the professional prompting method.

Relevant prior learning includes:

- task definition;
- context;
- source-constrained prompting;
- audience;
- format;
- constraints;
- quality criteria;
- asking for missing context;
- targeted iteration;
- decomposition into observable operations;
- explicit unknowns;
- verification;
- human review.

S03 explicitly defers the following to S04:

- long documents;
- source comparison;
- summarization against multiple sources;
- extraction;
- evidence tracking;
- conflicting information.

S04 should therefore apply prompt discipline rather than reteach the full prompt-engineering
framework.

The learner should move from:

```text
HOW DO I ASK?
```

to:

```text
WHAT INFORMATION SUPPORTS THE ANSWER?
```

## 5. Core professional problem

Professional document work creates a specific failure mode.

A generated answer may be:

- fluent;
- concise;
- well structured;
- professionally written;

while still containing information that the supplied source does not support.

S04 must make that distinction observable.

The central operating rule is:

> The model must not silently fill a source gap.

A missing fact remains missing.

A conflict remains a conflict until an approved source or responsible person resolves it.

An inference must not be presented as a supplied fact.

## 6. Four core information-work capabilities

S04 should develop four closely related capabilities.

### 6.1 Summarize

The learner should be able to reduce supplied information while preserving the meaning that matters.

A useful summary should distinguish:

- what the source states;
- what the source does not state;
- important decisions;
- important values;
- important deadlines or dates when present;
- unresolved information.

Summarization does not authorize the model to complete the source.

### 6.2 Extract

The learner should be able to retrieve defined information from a supplied source.

Examples may include:

- names;
- dates;
- quantities;
- decisions;
- responsibilities;
- actions;
- deadlines;
- missing fields.

Extraction should preserve:

```text
PRESENT → PRESENT
MISSING → MISSING
```

not:

```text
MISSING → PLAUSIBLE GUESS
```

### 6.3 Compare

The learner should be able to compare two or more supplied sources against explicit criteria.

Comparison should preserve:

- agreements;
- differences;
- missing information;
- contradictory information;
- source-specific claims.

The model should not reconcile a contradiction unless the sources provide a valid basis for doing
so.

### 6.4 Analyze

The learner should be able to organize supplied information and derive useful observations while
keeping different statement types visible.

S04 should distinguish:

```text
SOURCE FACT
```

from:

```text
DERIVED OBSERVATION
```

from:

```text
RECOMMENDATION / INTERPRETATION
```

An analysis may go beyond extraction, but the basis for that analysis must remain inspectable.

## 7. Source-grounded operating method

S04 should teach a repeatable process.

```text
1. IDENTIFY THE SOURCE
        ↓
2. DEFINE THE INFORMATION TASK
        ↓
3. EXTRACT OR TRANSFORM
        ↓
4. MARK GAPS AND CONFLICTS
        ↓
5. TRACE IMPORTANT CLAIMS BACK TO THE SOURCE
        ↓
6. CHECK THE OUTPUT
        ↓
7. HUMAN REVIEW BEFORE USE
```

This process should reinforce the program-wide framework:

```text
RESULT → CONTEXT → INSTRUCTION → SAFETY → VERIFICATION
```

S04 goes deepest into the **CONTEXT** and **VERIFICATION** layers while continuing to use the
**INSTRUCTION** discipline established in S03.

## 8. Evidence discipline

S04 needs an explicit evidence vocabulary.

At minimum, learners should be able to identify:

### Confirmed

The supplied source explicitly supports the statement.

### Missing

The source does not provide the required information.

### Conflicting

Two supplied pieces of information disagree.

### Derived

The statement is an observation or calculation produced from supplied information rather than a
directly quoted source fact.

### Unsupported

The generated statement cannot be traced to the approved source material.

This vocabulary should help learners evaluate generated outputs without requiring advanced
technical knowledge.

## 9. Verification should be observable

Verification must be a learner action rather than a generic warning.

Useful verification behaviors include:

- compare the generated summary with the source;
- confirm important names;
- confirm dates;
- confirm quantities and amounts;
- confirm decisions and commitments;
- check whether missing information stayed missing;
- check whether conflicting information stayed visible;
- identify unsupported statements;
- distinguish facts from recommendations;
- identify who must approve the final result.

The session should avoid presenting:

```text
CHECK THE AI
```

as a sufficient method.

The learner needs specific checks.

## 10. Source gaps and conflicts

Canonical Course 02 already preserves multiple unresolved source gaps and conflicts instead of
silently correcting them.

That behavior is directly relevant to S04.

S04 should teach:

```text
SOURCE GAP
    ↓
MARK IT
    ↓
ASK / ESCALATE / LEAVE UNRESOLVED
```

and:

```text
SOURCE CONFLICT
    ↓
SHOW BOTH
    ↓
DO NOT CHOOSE WITHOUT BASIS
    ↓
HUMAN OR APPROVED SOURCE RESOLVES
```

This principle should be visible in exercises.

## 11. Accuracy before fluency

The Course 03 SyncroTask role-play provides a strong canonical example.

The first generated FAQ introduced unsupported details despite producing fluent professional text.

The corrected approach separated:

- confirmed facts;
- unverified details.

S04 should preserve this professional lesson:

```text
SUPPORTED AND LIMITED
```

is preferable to:

```text
FLUENT AND INVENTED
```

The session should reward explicit limitations.

## 12. Multimodal and document input

Canonical Course 03 includes multimodal tasks involving:

- PDFs;
- text;
- tables;
- charts;
- images.

It also explicitly warns that multimodal input may introduce extraction or interpretation errors.

S04 may therefore include document input that contains more than plain text.

However:

```text
MORE INPUT MODALITIES ≠ MORE CERTAINTY
```

The learner still needs to verify:

- what was extracted;
- what was omitted;
- what was inferred;
- what the source actually supports.

## 13. Human responsibility

S04 must preserve the existing human-decision boundary.

AI may assist with:

- organizing information;
- summarizing;
- extracting;
- comparing;
- highlighting gaps;
- drafting an analysis;
- formatting a report.

AI should not automatically:

- convert an unsupported statement into an official fact;
- resolve a source conflict without evidence;
- approve a consequential decision;
- certify a record;
- assign an official grade;
- approve payment;
- create legal authority;
- replace an authorized reviewer.

The more consequential the output, the stronger the requirement for human verification and approval.

## 14. Safety boundary

S04 should keep safety visible without teaching S06 early.

Practice should use only:

- fictional information;
- anonymized information;
- public information;
- explicitly authorized information.

The learner should be reminded not to upload information merely because it would make a document
task easier.

Detailed instruction on:

- confidentiality;
- organizational authorization;
- privacy;
- sensitive-data handling;
- security controls;
- governance;

belongs primarily to S06.

## 15. Anchor-case requirement

The fictional cocoa cooperative near Soubré should remain the primary continuity case unless the
content contract establishes a stronger pedagogical reason to change it.

S04 should use a bounded information source that makes verification possible.

The exact source bundle is not yet frozen.

The content contract should determine whether the learner works with:

- one document;
- multiple short documents;
- a document plus a structured record;
- text plus a table;
- another bounded fictional information package.

No missing business rule, threshold, certification condition, payment rule, or official decision
should be invented merely to make the exercise more complete.

## 16. Professional transfer requirement

The Soubré case should teach the method, not trap the method inside cocoa operations.

Transfer examples may include professional tasks such as:

- meeting-summary preparation;
- report summarization;
- comparing two versions of a document;
- extracting actions and owners;
- comparing proposals;
- preparing a briefing from supplied information;
- restructuring notes;
- checking whether a draft introduces facts not present in the source.

The eventual contract should select a small number of transfer examples rather than turning the
session into a catalogue of office tasks.

## 17. Content to reuse without reteaching

### From S02

Reuse:

- generative AI can assist with professional text tasks;
- first output is a draft;
- missing facts should remain visible;
- generated professional communication requires review.

Do not repeat the full introduction to generative AI or its general workplace applications.

### From S03

Reuse:

- structured prompts;
- source-constrained instructions;
- context versus source;
- asking for missing information;
- quality criteria;
- targeted refinement;
- answer verification.

Do not reteach the complete seven-element prompt framework or the catalogue of prompting
techniques.

## 18. Content to defer

S04 must not absorb later sessions.

### Defer to S05

Detailed workflow integration:

- process mapping;
- repeated operational workflows;
- tool handoffs;
- workflow automation;
- reusable multi-step systems;
- value measurement across a process.

### Defer to S06

Detailed:

- confidentiality policy;
- privacy governance;
- authorization models;
- security controls;
- sensitive-data policy;
- regulatory or legal governance;
- consequential-decision governance.

### Defer to S07

Full end-to-end professional application and capstone integration.

## 19. Content explicitly excluded

Unless later source analysis establishes a direct need, S04 should not include:

- chatbot architecture;
- chatbot decision-tree design;
- chatbot variables;
- chatbot deployment mechanics;
- chatbot channel integration;
- a generic survey of AI tools;
- a repeat of prompt-engineering terminology;
- a general responsible-AI lecture;
- unsupported current product comparisons.

These exclusions protect the session's information-work focus.

## 20. Candidate learning outcomes

The exact content contract remains to be designed, but S04 should make the learner capable of
demonstrating the following behaviors.

By the end of the session, the learner should be able to:

1. summarize supplied information without adding unsupported facts;
2. extract defined facts and preserve missing information explicitly;
3. compare supplied sources while keeping agreements, differences, gaps, and conflicts visible;
4. distinguish source facts from derived observations and recommendations;
5. identify unsupported claims in an AI-generated result;
6. trace important statements back to their source;
7. apply specific verification checks before professional use;
8. identify when a human or approved source must resolve an uncertainty.

These are candidate outcomes for the content-contract phase, not yet a finalized slide sequence.

## 21. Open decisions for the content contract

The following decisions should remain open until the S04 content contract is designed:

- final slide count;
- detailed timing allocation;
- exact bilingual slide sequence;
- exact Soubré source bundle;
- whether the main exercise uses one source or multiple sources;
- whether a table, chart, image, or PDF is included;
- exact terminology used for evidence status;
- number and type of professional transfer examples;
- visual requirements;
- activity format;
- exact balance between summarization, extraction, comparison, and analysis.

These decisions should be driven by the learning objectives rather than copied mechanically from
S01-S03.

## 22. Proposed canonical provenance

The initial S04 content contract should use the following canonical provenance unless later content
design establishes that a module is not actually adapted.

```text
module_c9a9a7cf-4a4d-4dd5-b916-d4a9581492d5
Course 02 / Module 02
Applications and Tools of Generative AI

module_37663745-fa25-44cc-a2aa-a5f91583fefc
Course 03 / Module 02
Prompt Engineering: Techniques and Approaches

module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c
Course 01 / Module 04
Issues, Concerns, and Ethical Considerations
```

Canonical Course 04 is deliberately absent.

Provenance must describe material actually used by the session, not session numbering.

## 23. Acceptance criteria for the S04 content contract

The subsequent bilingual content contract should satisfy all of the following:

1. S04 remains centered on source-grounded information work.
2. The central question remains observable in the activities:
   **How do I summarize, compare, and analyze without inventing facts?**
3. Every substantive information task has a bounded source.
4. Missing information remains missing unless an approved source supplies it.
5. Conflicting information remains visible until legitimately resolved.
6. Important generated claims can be checked against supplied evidence.
7. Facts, derived observations, and recommendations are distinguishable.
8. S03 prompt discipline is reused without dominating the session.
9. S05 workflow design is not taught early.
10. S06 governance and confidentiality are reinforced only at the necessary boundary level.
11. Canonical Course 04 is not referenced merely because the professional session is S04.
12. The Soubré anchor remains fictional and source-constrained.
13. Professional transfer beyond the anchor case is visible.
14. Human review remains explicit.
15. English and French teaching sources can be built from one aligned content contract.
16. Source attribution and AI-generation disclosure remain required.
17. The eventual `canonicalModuleIds` reflect only canonical material actually adapted.

## 24. Governing rule

S04 should teach a simple professional habit:

```text
IF THE SOURCE DOES NOT SUPPORT IT,
THE OUTPUT MUST NOT PRESENT IT AS FACT.
```

The learner should leave with a method for producing useful information work without confusing
fluency with evidence.
