# S04 — Working with Documents and Information — 60-Minute Content Contract

## Status

- **Session:** S04 — Working with Documents and Information / Travailler avec des documents et des
  informations
- **Duration:** 60 minutes
- **Slide count:** 25 slides in English and 25 slides in French
- **Audience:** professionals and learners with no technical prerequisite
- **Curriculum position:** VERIFY
- **Central question:** How do I summarize, compare, and analyze without inventing facts?
- **Primary contribution:** source-grounded information work and verification
- **Anchor case:** fictional cocoa cooperative near Soubré
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Fusion audit:** `docs/teaching/s04-professional-fusion-audit.md`
- **Teaching sources:** not yet created
- **Purpose:** freeze the bilingual instructional sequence, timing, source package, activities,
  evidence vocabulary, verification method, provenance, and human-review boundaries before
  implementation.

## 1. Session role

S04 follows S03.

S03 teaches:

> How do I communicate effectively with an AI system?

S04 teaches:

> How do I work with supplied information without presenting unsupported content as fact?

The session therefore shifts the learner from prompt construction toward evidence discipline.

The learner should repeatedly ask:

```text
WHAT DOES THE SOURCE ACTUALLY SUPPORT?
```

and:

```text
CAN I TRACE THIS STATEMENT BACK TO THE SOURCE?
```

The session should follow this operating method:

```text
SOURCE
    ↓
DEFINE THE TASK
    ↓
EXTRACT OR TRANSFORM
    ↓
MARK GAPS AND CONFLICTS
    ↓
TRACE IMPORTANT CLAIMS
    ↓
VERIFY
    ↓
HUMAN REVIEW
```

## 2. Learning outcomes

By the end of the 60-minute session, the learner should be able to:

1. summarize supplied information without adding unsupported facts;
2. extract requested information while preserving missing fields as missing;
3. compare multiple supplied sources without silently resolving conflicts;
4. distinguish source facts from derived observations and recommendations;
5. identify unsupported statements in an AI-generated answer;
6. trace important claims back to the supplied source;
7. apply concrete verification checks before professional use;
8. recognize when an approved source or responsible person must resolve an uncertainty.

## 3. Canonical provenance

The session should adapt material from the following canonical modules.

### Course 02 / Module 02 — Applications and Tools of Generative AI

**Module ID:**

`module_c9a9a7cf-4a4d-4dd5-b916-d4a9581492d5`

Relevant concepts:

- text generation and transformation;
- summarization;
- reviewing summaries against supplied material;
- professional text and document tasks;
- source gaps and conflicts;
- unresolved missing evidence;
- review and refinement.

### Course 03 / Module 02 — Prompt Engineering: Techniques and Approaches

**Module ID:**

`module_37663745-fa25-44cc-a2aa-a5f91583fefc`

Relevant concepts:

- source-constrained prompting;
- explicit missing-information handling;
- document and multimodal input;
- summarizing textual and visual information;
- extracting supplied information;
- accuracy before fluency;
- confirmed versus unverified information;
- explicit evaluation criteria.

### Course 01 / Module 04 — Issues, Concerns, and Ethical Considerations

**Module ID:**

`module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`

Relevant concepts:

- hallucinations;
- factual errors;
- unsupported or fabricated information;
- verification;
- fact-checking;
- human review;
- human oversight;
- fluent output is not evidence of truth.

### Canonical material deliberately excluded

Canonical Course 04 — **Building AI Powered Chatbots Without Programming** — is not part of the S04
provenance.

Professional session numbering and canonical course numbering are independent.

## 4. Professional-practice input

Professional practices adapted from the existing fusion work include:

- summarize supplied notes without inventing missing details;
- restructure supplied information;
- identify missing facts explicitly;
- preserve meaning during rewriting;
- separate facts from recommendations;
- verify names, dates, amounts, decisions, commitments, and other important values before use;
- treat a generated result as a draft;
- refine after identifying a specific failure;
- preserve unknown information as unknown.

These practices are professional adaptation input and are not automatically IBM/Coursera source
material.

## 5. Prior-learning boundary

### Reuse from S02

Assume learners already understand that generative AI may assist with:

- summarization;
- restructuring information;
- professional drafting;
- identifying missing information.

Do not repeat the general introduction to generative AI.

### Reuse from S03

Assume learners already understand:

- task;
- context;
- audience;
- format;
- constraints;
- quality criteria;
- source-constrained prompting;
- asking for missing context;
- targeted refinement;
- human review.

Do not reteach the seven-element prompt framework or the full prompting-technique catalogue.

S04 applies those skills to evidence-bound information work.

## 6. Evidence vocabulary

S04 should use five evidence states consistently.

### Confirmed

The approved source explicitly supports the statement.

### Missing

The approved source does not supply the required information.

### Conflicting

Two supplied sources disagree.

### Derived

The statement is calculated, organized, compared, or otherwise derived from supplied information
rather than copied directly from one source.

### Unsupported

The statement cannot be traced to the approved source material.

The bilingual teaching implementation should preserve these five categories structurally.

French wording may be adapted naturally while preserving meaning:

- Confirmed → Confirmé
- Missing → Manquant
- Conflicting → Contradictoire
- Derived → Déduit
- Unsupported → Non étayé

## 7. Fictional Soubré source package

The main exercise should use a deliberately small fictional source package.

Its purpose is not to teach cocoa operations.

Its purpose is to make evidence checking observable.

### Source A — Reception record

```text
Lot ID: SB-104
Date: 3 October 2026
Weight: 618 kg
```

No other fact is provided by Source A.

### Source B — Second record

```text
Lot ID: SB-104
Date: 3 October 2026
Weight: 681 kg
```

No explanation for the different weight is provided.

The learner must therefore preserve:

```text
CONFIRMED:
- Lot ID SB-104
- Date 3 October 2026

CONFLICTING:
- Weight: 618 kg versus 681 kg
```

The learner must not decide which weight is correct.

### Source C — Incomplete reception record

```text
Lot ID: SB-105
Date: 3 October 2026
Weight: [missing]
```

The standing fictional intake rule is:

> At reception, staff record the lot ID, date, and weight. If a field is missing, mark the record
> “needs completion,” then have a staff member review it. No other rule is provided.

The correct treatment is therefore:

```text
Lot ID: SB-105
Date: 3 October 2026
Weight: Missing
Status: Needs completion
Next step: Staff review
```

No threshold, certification rule, payment rule, acceptance decision, quality grade, or additional
procedure may be invented.

## 8. Source-package design rules

Every activity using the Soubré package must preserve these boundaries:

1. Source A and Source B conflict only on weight.
2. No source explains why the weights differ.
3. No source establishes which weight is correct.
4. Source C contains no weight.
5. The supplied intake rule governs missing fields only.
6. The intake rule does not define how to resolve conflicting values.
7. Any unresolved conflict must remain unresolved.
8. Any missing field must remain missing unless a new approved source supplies it.
9. Generated prose must not convert a gap, conflict, or inference into an official fact.
10. Human review does not authorize invention; it identifies who must resolve the unresolved issue.

## 9. Verification method

Learners should perform concrete checks.

For every important output, ask:

```text
1. What source supports this statement?
2. Is the value copied correctly?
3. Did missing information remain missing?
4. Did conflicting information remain visible?
5. Did the answer introduce a new fact?
6. Is a derived observation labeled as derived?
7. Is a recommendation being presented as if it were a fact?
8. Who must review the output before professional use?
```

Avoid reducing verification to:

```text
Check the AI.
```

Verification must be an observable task.

## 10. Facts, observations, and recommendations

S04 should distinguish three output layers.

### Source fact

Directly supported by an approved source.

Example:

```text
Source A records a weight of 618 kg for lot SB-104.
```

### Derived observation

Produced by comparing or organizing supplied facts.

Example:

```text
The two supplied records disagree on the weight of lot SB-104.
```

### Recommendation

A proposed next action or interpretation.

Example:

```text
The weight discrepancy should be reviewed by the responsible staff member before the value is used.
```

The learner must not present a recommendation as though the source itself stated it.

When a recommendation goes beyond the supplied operational rule, it must be clearly presented as a
recommendation rather than an established procedure.

## 11. Content boundary

### S04 owns

- source-grounded summarization;
- extraction;
- comparison;
- explicit gaps;
- explicit conflicts;
- unsupported-claim detection;
- evidence tracing;
- document verification;
- facts versus derived observations;
- human review before use.

### Defer to S05

Do not teach in depth:

- process mapping;
- workflow automation;
- repeated tool handoffs;
- reusable multi-step operational systems;
- workflow-level value measurement.

### Defer to S06

Do not teach in depth:

- privacy governance;
- confidentiality policy;
- sensitive-data policy;
- authorization models;
- security controls;
- regulatory governance.

S04 should still remind learners to use fictional, anonymized, public, or explicitly authorized
information.

### Defer to S07

Do not perform the full program capstone.

## 12. Slide-by-slide contract

### S04-01 — Working with Documents and Information

**Time:** 1 minute

Purpose:

- establish session identity;
- preserve IBM/Coursera source attribution;
- disclose that the teaching adaptation was generated with AI and requires human review.

Projected message:

> Work from evidence, not from fluency.

### S04-02 — What you will be able to do

**Time:** 2 minutes

Learners should leave able to:

- summarize;
- extract;
- compare;
- analyze;
- verify;

without converting unsupported information into fact.

### S04-03 — From prompting to evidence

**Time:** 2 minutes

Bridge from S03:

```text
S03: HOW DO I ASK?
        ↓
S04: WHAT SUPPORTS THE ANSWER?
```

Prompt quality remains useful.

Evidence quality becomes the central issue.

### S04-04 — A polished answer can still be wrong

**Time:** 2 minutes

Establish the failure mode:

```text
FLUENT
CLEAR
PROFESSIONAL
```

does not imply:

```text
SUPPORTED
```

Connect to hallucination risk without reteaching the complete responsible-AI lesson.

### S04-05 — The source is the boundary

**Time:** 2 minutes

Introduce:

```text
APPROVED SOURCE
      ↓
ALLOWED FACTS
```

The learner may transform information but must not silently expand the source.

### S04-06 — Five evidence states

**Time:** 3 minutes

Introduce:

```text
CONFIRMED
MISSING
CONFLICTING
DERIVED
UNSUPPORTED
```

Use short examples.

This vocabulary remains visible throughout the rest of the session.

### S04-07 — The source-grounded method

**Time:** 2 minutes

Teach:

```text
SOURCE
    ↓
TASK
    ↓
EXTRACT / TRANSFORM
    ↓
MARK GAPS / CONFLICTS
    ↓
TRACE
    ↓
VERIFY
    ↓
HUMAN REVIEW
```

### S04-08 — Meet the Soubré source package

**Time:** 2 minutes

Introduce Source A, Source B, and Source C.

Make explicit:

- all records are fictional;
- the source package is deliberately incomplete;
- learners must not add operational rules.

### S04-09 — Summarize Source A

**Time:** 3 minutes

Task:

> Summarize the confirmed information in Source A in one short paragraph. Do not add information
> that is not present.

Expected content:

- lot SB-104;
- 3 October 2026;
- 618 kg.

No status, certification, quality result, owner, payment state, or interpretation may be added.

### S04-10 — Check the summary against the source

**Time:** 2 minutes

Compare generated statements with Source A.

Ask:

```text
WHERE DID EACH FACT COME FROM?
```

Introduce simple claim-to-source tracing.

### S04-11 — Extract rather than summarize

**Time:** 2 minutes

Show that extraction has a different goal.

Task:

```text
Return:
- lot ID
- date
- weight
```

The expected output should preserve the exact supplied fields.

### S04-12 — Missing means missing

**Time:** 3 minutes

Use Source C.

Expected classification:

```text
Lot ID: Confirmed
Date: Confirmed
Weight: Missing
Status: Needs completion
Next step: Staff review
```

Primary lesson:

```text
MISSING ≠ PERMISSION TO GUESS
```

### S04-13 — Compare Source A and Source B

**Time:** 3 minutes

Ask learners to identify:

- agreements;
- differences;
- unresolved information.

Expected:

```text
Lot ID: Confirmed and consistent
Date: Confirmed and consistent
Weight: Conflicting
```

### S04-14 — A conflict must stay visible

**Time:** 3 minutes

The answer must not choose:

```text
618 kg
```

or:

```text
681 kg
```

without additional approved evidence.

Teach:

```text
CONFLICT
    ↓
SHOW BOTH
    ↓
DO NOT RESOLVE WITHOUT BASIS
```

### S04-15 — Gap versus conflict

**Time:** 2 minutes

Contrast:

```text
SOURCE C:
Weight is missing.
```

with:

```text
SOURCE A + B:
Two different weights are supplied.
```

The problems require different descriptions.

Neither permits invention.

### S04-16 — Fact, derived observation, recommendation

**Time:** 3 minutes

Use the same Soubré material.

Examples:

#### Fact

> Source A records 618 kg.

#### Derived observation

> The supplied records disagree on the weight.

#### Recommendation

> The discrepancy should be reviewed before the weight is used professionally.

Keep the three layers visibly distinct.

### S04-17 — Detect the unsupported claim

**Time:** 3 minutes

Present a deliberately flawed draft such as:

> Lot SB-104 weighed 681 kg and was approved after correction.

Learners identify:

- `681 kg` appears in Source B;
- `approved` is unsupported;
- `after correction` is unsupported;
- the weight conflict has been hidden.

### S04-18 — Correct the specific failure

**Time:** 2 minutes

Require targeted correction.

A valid revision may state:

> Sources A and B both identify lot SB-104 on 3 October 2026, but they record different weights:
> 618 kg and 681 kg. The supplied information does not establish which value is correct.

Primary lesson:

```text
SUPPORTED AND LIMITED
    >
FLUENT AND INVENTED
```

### S04-19 — Documents can contain more than text

**Time:** 2 minutes

Introduce document and multimodal input:

- paragraphs;
- tables;
- charts;
- images.

Canonical connection:

multimodal input expands the evidence available but also creates extraction and interpretation risk.

### S04-20 — More input does not mean more certainty

**Time:** 2 minutes

Teach:

```text
MORE MODALITIES ≠ MORE CERTAINTY
```

Learners must still check:

- what was extracted;
- what was omitted;
- what was inferred;
- what the source supports.

### S04-21 — Verification is a concrete checklist

**Time:** 3 minutes

Use:

```text
NAMES
DATES
VALUES
DECISIONS
MISSING INFORMATION
CONFLICTS
UNSUPPORTED CLAIMS
FACTS VS RECOMMENDATIONS
RESPONSIBLE REVIEWER
```

The precise checks should depend on the document task.

### S04-22 — Professional transfer: meeting notes

**Time:** 2 minutes

Transfer the method to meeting notes.

Ask learners to distinguish:

- confirmed decisions;
- assigned actions;
- owners;
- deadlines;
- information not specified.

If an owner or deadline is absent:

```text
NOT SPECIFIED
```

rather than an invented value.

### S04-23 — Professional transfer: reports and briefings

**Time:** 2 minutes

Show the same method for:

- reports;
- briefings;
- proposals;
- document comparisons.

Professional rule:

> A useful summary may be shorter than its source, but it must not silently become more certain than
> its source.

### S04-24 — Final source-grounded activity

**Time:** 5 minutes

Learners receive the Soubré source package and produce a short briefing containing:

1. confirmed facts;
2. missing information;
3. conflicting information;
4. one derived observation;
5. any unsupported claim found in a supplied flawed draft;
6. the item that requires human resolution.

Acceptance criteria:

- no invented fact;
- conflicts remain visible;
- missing data remains missing;
- derived content is distinguishable;
- no official decision is fabricated;
- important statements are traceable to the source.

### S04-25 — The professional habit

**Time:** 2 minutes

Close with:

```text
IF THE SOURCE DOES NOT SUPPORT IT,
THE OUTPUT MUST NOT PRESENT IT AS FACT.
```

Reconnect to the program framework:

```text
RESULT
    ↓
CONTEXT
    ↓
INSTRUCTION
    ↓
SAFETY
    ↓
VERIFICATION
```

Transition toward S05:

> Once the information method is reliable, the next question is where AI should fit inside a real
> professional workflow.

## 13. Timing contract

The following timing is the single authoritative delivery schedule for S04.

## 14. Final timing

| Slide     | Minutes |
| --------- | ------: |
| S04-01    |       1 |
| S04-02    |       2 |
| S04-03    |       2 |
| S04-04    |       2 |
| S04-05    |       2 |
| S04-06    |       3 |
| S04-07    |       2 |
| S04-08    |       2 |
| S04-09    |       3 |
| S04-10    |       2 |
| S04-11    |       2 |
| S04-12    |       3 |
| S04-13    |       3 |
| S04-14    |       3 |
| S04-15    |       2 |
| S04-16    |       3 |
| S04-17    |       3 |
| S04-18    |       2 |
| S04-19    |       2 |
| S04-20    |       2 |
| S04-21    |       3 |
| S04-22    |       2 |
| S04-23    |       2 |
| S04-24    |       5 |
| S04-25    |       2 |
| **Total** |  **60** |

The teaching sources must use this timing exactly.

## 15. Activity contract

S04 should contain three levels of learner action.

### Guided

Learners:

- summarize Source A;
- extract fields;
- classify evidence states.

### Comparative

Learners:

- compare Source A and Source B;
- identify the conflict;
- preserve unresolved information.

### Integrated

Learners complete the final source-grounded briefing from the full source package.

No activity requires private internal reasoning to be exposed.

Tasks should request observable outputs.

## 16. Visual contract

The eventual deck should prioritize simple evidence-oriented visuals.

Candidate visual structures include:

### Source-grounded method

```text
SOURCE → TASK → EXTRACT / TRANSFORM → MARK → TRACE → VERIFY → HUMAN REVIEW
```

### Evidence-state model

```text
CONFIRMED
MISSING
CONFLICTING
DERIVED
UNSUPPORTED
```

### Gap versus conflict

```text
MISSING:
SOURCE DOES NOT PROVIDE VALUE

CONFLICTING:
SOURCES PROVIDE DIFFERENT VALUES
```

### Statement layers

```text
SOURCE FACT
    ↓
DERIVED OBSERVATION
    ↓
RECOMMENDATION
```

### Verification loop

```text
OUTPUT
    ↓
TRACE TO SOURCE
    ↓
CHECK VALUES / GAPS / CONFLICTS
    ↓
CORRECT
    ↓
HUMAN REVIEW
```

Visuals must support the content rather than duplicate dense paragraphs.

## 17. Bilingual alignment contract

English and French implementations must preserve:

- 25 slides each;
- the same slide IDs;
- the same slide ordering;
- the same timing;
- the same source facts;
- the same evidence-state structure;
- the same activity logic;
- the same human-review boundaries;
- the same canonical provenance.

Translation may adapt phrasing naturally.

Translation must not alter facts or introduce a different business rule.

## 18. Source attribution and AI disclosure

The first slide must visibly communicate both:

1. the teaching session is based in part on IBM's **AI Foundations for Everyone** Specialization on
   Coursera; and
2. the deck is an independent teaching adaptation generated with AI and subject to human review.

Presenter metadata must preserve the same distinction.

## 19. Human-decision boundary

The session may teach AI assistance for:

- summarization;
- extraction;
- comparison;
- organizing evidence;
- identifying gaps;
- drafting analysis;
- preparing a briefing.

The session must not imply that AI may automatically:

- accept or reject a lot;
- assign an official grade;
- approve payment;
- issue a certificate;
- resolve an unsupported discrepancy;
- create legal authority;
- replace an authorized decision-maker.

## 20. Acceptance criteria

The S04 teaching implementation is acceptable only if:

1. both languages contain exactly 25 aligned slides;
2. total timing is exactly 60 minutes;
3. the source package remains fictional and bounded;
4. Source A records 618 kg for SB-104;
5. Source B records 681 kg for SB-104;
6. neither source establishes which weight is correct;
7. Source C leaves the SB-105 weight missing;
8. the supplied missing-field rule is preserved exactly in meaning;
9. no threshold, certification rule, payment rule, acceptance decision, or quality grade is invented;
10. the five evidence states remain recognizable;
11. learners practice summarization;
12. learners practice extraction;
13. learners practice source comparison;
14. learners practice unsupported-claim detection;
15. learners distinguish fact, derived observation, and recommendation;
16. verification uses concrete checks;
17. important claims remain traceable to the source;
18. human review remains explicit;
19. S03 prompt concepts are applied without being retaught in depth;
20. S05 workflow design is deferred;
21. S06 governance remains at boundary level only;
22. canonical Course 04 chatbot material is not introduced;
23. source attribution remains visible;
24. AI-generation disclosure remains visible;
25. projected content and presenter notes preserve the same factual boundaries.

## 21. Governing rule

```text
IF THE SOURCE DOES NOT SUPPORT IT,
THE OUTPUT MUST NOT PRESENT IT AS FACT.
```

Everything in the S04 implementation should reinforce that habit.
