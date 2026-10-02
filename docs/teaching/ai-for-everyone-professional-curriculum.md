# AI for Everyone — Professional Curriculum Contract

## Status

- **Purpose:** define the shared curriculum architecture for the instructor-led AI sessions.
- **Audience:** professionals and learners with no technical prerequisite.
- **Delivery model:** instructor-led, practical, progressive, source-grounded.
- **Current implemented sessions:** S01–S03.
- **Planned curriculum:** S01–S07.
- **Teaching languages:** English and French.
- **Repository role:** this document governs curriculum-level fusion before individual session contracts are revised.

## 1. Curriculum intent

The program teaches enough artificial intelligence for learners to understand what they are
using, then emphasizes how to use it effectively, safely, and responsibly in professional work.

The curriculum must remain accessible to people without a technical background while still
providing useful professional skills.

The program therefore combines two complementary goals:

1. **AI for everyone**
   - build simple and accurate mental models;
   - introduce technical vocabulary progressively;
   - avoid assuming programming, mathematics, or data-science knowledge;
   - explain technical ideas through concrete situations;
   - place deeper technical detail in presenter notes or reference material when it is not
     necessary for the main learning objective.

2. **AI for professional practice**
   - connect concepts to recognizable workplace tasks;
   - make learners practice rather than only observe;
   - teach verification, confidentiality, and human responsibility as normal parts of AI use;
   - show how AI fits inside a workflow rather than treating prompting as an isolated skill;
   - measure whether AI actually improves the work.

## 2. Source and authority model

The fused curriculum uses three distinct layers of input.

### 2.1 Canonical IBM/Coursera learning source

The repository's canonical course notes under `courses/` remain the authoritative source for
concepts adapted from IBM's **AI Foundations for Everyone** Specialization delivered through
Coursera.

Teaching adaptations must preserve the meaning of those concepts and maintain existing source
traceability.

### 2.2 Collaborative professional-practice input

A colleague-supplied course manuscript titled:

> _Cours complet : Utiliser l’intelligence artificielle dans la vie professionnelle_

is used as collaborative curriculum-design input.

Its useful contributions include:

- a seven-module professional progression;
- a practical prompt framework;
- common workplace use cases;
- workflow integration;
- quality and value measurement;
- confidentiality and responsible-use guidance;
- an end-to-end professional workshop;
- a five-question method for practical AI use.

The manuscript is not treated automatically as an IBM/Coursera source.

If it introduces factual or technical material not supported by the repository's canonical
sources, that material must either:

1. receive an approved external source;
2. be explicitly documented as an independent curriculum extension; or
3. remain outside the teaching source until reviewed.

The colleague-supplied PDF is not committed to this repository unless its owner explicitly
authorizes repository distribution.

### 2.3 Repository teaching adaptations

The materials under `teaching/` are independent teaching adaptations.

They may:

- select;
- simplify;
- reorder;
- contextualize;
- combine;
- demonstrate;
- exercise

approved curriculum material for a specific audience and session.

They must preserve:

- factual meaning;
- source traceability;
- explicit human responsibility;
- confidentiality boundaries;
- bilingual alignment where applicable.

As documented elsewhere in the repository, these teaching adaptations are generated with AI and
require human review before delivery.

## 3. Program-wide learning model

The seven-session program follows this progression:

```text
UNDERSTAND
    ↓
USE
    ↓
PROMPT
    ↓
VERIFY
    ↓
INTEGRATE
    ↓
GOVERN
    ↓
APPLY
```

The progression is pedagogical rather than a strict technical dependency.

Each session should make the learner more capable of using AI in real work while reinforcing
concepts introduced earlier.

## 4. Fused session architecture

| Session | Working title                                                                              | Central question                                                  | Primary contribution                                                           |
| ------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| S01     | Comprendre l’IA / Understanding AI                                                         | What is AI, and what should I realistically expect from it?       | AI foundations, capabilities, limits, human role                               |
| S02     | Utiliser l’IA générative au travail / Using Generative AI at Work                          | What can I actually do with generative AI professionally?         | Generative AI concepts plus transferable workplace applications                |
| S03     | Concevoir de bons prompts / Designing Effective Prompts                                    | How do I communicate effectively with an AI system?               | Prompt framework, iteration, examples, interviewing, decomposition, evaluation |
| S04     | Travailler avec des documents et des informations / Working with Documents and Information | How do I summarize, compare, and analyze without inventing facts? | Source-grounded information work and verification                              |
| S05     | Construire un workflow assisté par l’IA / Building an AI-Assisted Workflow                 | Where should AI fit inside a real professional process?           | Workflow design, human checkpoints, reuse, and value measurement               |
| S06     | Sécurité, confidentialité et responsabilité / Security, Privacy, and Responsibility        | What information and decisions require stronger boundaries?       | Confidentiality, authorization, verification, and consequential decisions      |
| S07     | Atelier professionnel de bout en bout / End-to-End Professional Workshop                   | Can I apply the complete method to a bounded professional task?   | Integrated capstone and reusable professional process                          |

S01–S03 already exist and remain valid teaching assets until their individual refactors are
approved.

S04–S07 are curriculum targets only until dedicated content contracts and teaching sources are
created.

## 5. The five-question operating framework

Every session should reinforce the same five questions.

### Q1 — Result

**What result am I trying to obtain?**

The learner should define:

- the task;
- the intended outcome;
- the person who will use the result;
- what a successful result looks like.

### Q2 — Context

**What does the AI need to know?**

The learner should identify:

- relevant facts;
- source documents;
- constraints;
- background information;
- missing information.

Unknown information must remain unknown unless it is obtained from an approved source.

### Q3 — Instruction

**How should I ask for the result?**

The learner should determine:

- task;
- audience;
- format;
- tone;
- constraints;
- examples when useful;
- criteria for a useful answer.

### Q4 — Safety

**What information am I allowed to provide to this tool?**

The learner must consider:

- organizational rules;
- confidential information;
- personal information;
- credentials;
- financial, medical, legal, or commercially sensitive information;
- anonymization or fictionalization where appropriate.

### Q5 — Verification

**How will the result be checked before it is used?**

The learner should identify:

- source checks;
- calculations or values to confirm;
- unsupported assumptions;
- missing information;
- the person responsible for approval.

The program may use the shorthand:

```text
RESULT → CONTEXT → INSTRUCTION → SAFETY → VERIFICATION
```

## 6. Professional traits that apply to every session

Professional usefulness is not a standalone module. It is a transversal requirement.

### 6.1 Recognizable workplace context

Important concepts should be connected to ordinary professional tasks such as:

- email and messaging;
- meetings;
- reports;
- presentations;
- document review;
- customer communication;
- project planning;
- information organization;
- comparisons;
- data interpretation;
- process documentation;
- operational checklists.

The examples should remain understandable across industries.

### 6.2 Anchor case plus transfer examples

The fictional cocoa cooperative near Soubré remains the principal continuous case study.

It provides continuity across sessions and supports locally meaningful examples.

However, it must not become the only lens through which learners see AI.

Each session should also include one or more short transfer examples from other professional
contexts when this improves generalization.

Possible contexts include:

- administration;
- customer service;
- entrepreneurship;
- finance;
- human resources;
- operations;
- project management;
- sales.

No learner should need knowledge of cocoa production to understand the core lesson.

### 6.3 Source before formulation

When an exercise depends on supplied information, learners must distinguish:

```text
KNOWN
UNKNOWN
INFERRED
GENERATED
```

A generated statement is not evidence.

The normal professional pattern is:

```text
SOURCE → AI → VERIFY → HUMAN APPROVAL
```

### 6.4 Human responsibility

AI may assist with operations such as:

```text
draft
summarize
extract
classify
compare
flag
suggest
reformat
```

A responsible person may still need to:

```text
verify
approve
commit
authorize
publish
sign
decide
```

The exact boundary depends on the task and its consequences.

Sessions must make consequential decision boundaries explicit rather than implying that an AI
assistant has organizational authority.

### 6.5 Confidentiality before convenience

Before giving information to an AI tool, learners should ask whether they are authorized to share
it.

Exercises should use:

- fictional data;
- anonymized data;
- approved public material; or
- explicitly authorized professional information.

Real confidential material must not be required for classroom participation.

### 6.6 Verification as normal work

Verification is not presented as an exceptional recovery step after an AI failure.

It is part of the workflow.

Learners should practice checking:

- names;
- dates;
- numbers;
- units;
- source support;
- missing information;
- added assumptions;
- commitments;
- links or references where relevant.

The level of checking should increase with the consequences of an error.

### 6.7 Measure usefulness

A successful AI interaction is not defined only by producing an answer.

Where appropriate, activities should examine:

- time before and after using AI;
- number of corrections required;
- factual accuracy;
- consistency;
- ease of reuse;
- user effort;
- latency;
- operational risk;
- whether the result actually helps the intended user.

A faster process is not automatically a better process.

## 7. Progressive disclosure

The course remains "for everyone" by separating essential understanding from optional depth.

### Main slide

Contains:

- one central idea;
- plain language;
- only the terminology needed for the learning objective;
- a professional example or decision.

### Facilitator explanation

Adds:

- clarification;
- analogy;
- misconceptions;
- discussion prompts;
- transitions to the case study.

### Presenter notes

May contain:

- technical nuance;
- source references;
- additional examples;
- edge cases;
- warnings;
- facilitation guidance.

### Reference material

May contain deeper material that learners do not need to memorize during the session.

Technical terminology should normally answer a professional question before the terminology itself
is emphasized.

Example:

```text
Professional question:
How can an assistant answer from approved company documents instead of relying only on its
general model knowledge?

Concept:
Retrieval-Augmented Generation (RAG)
```

## 8. Prompting framework

S03 should introduce a simple reusable prompt structure before advanced prompting techniques.

A practical prompt may specify:

1. **Role** — useful perspective or operating context.
2. **Task** — what the system should do.
3. **Context** — relevant information and sources.
4. **Audience** — who will receive or use the result.
5. **Format** — expected structure.
6. **Constraints** — limits, language, tone, exclusions, or rules.
7. **Quality criteria** — what makes the result acceptable.

Not every prompt requires all seven elements.

Learners should use only the information necessary for the task.

The framework precedes deeper techniques such as:

- zero-shot prompting;
- one-shot and few-shot prompting;
- iterative refinement;
- interview prompting;
- task decomposition;
- alternative formulations;
- multimodal prompting;
- structured evaluation.

## 9. Activity design

Each session should contain meaningful learner action.

Activities should prefer observable work over passive recall.

Useful activity patterns include:

- identify whether AI is suitable for a task;
- improve a weak prompt;
- identify missing information;
- compare an output with its source;
- correct an unsupported statement;
- rewrite for another professional audience;
- choose where human approval belongs in a workflow;
- identify confidential information;
- measure whether AI improved a task;
- critique another learner's prompt using explicit criteria.

When live AI access is unavailable, the instructor may use pre-generated or fictional outputs that
are clearly labelled as simulations.

## 10. Session-level professional transfer

Every session should answer three questions before it ends:

```text
WHAT DID I LEARN?
WHERE COULD I USE IT?
WHAT MUST I CHECK BEFORE I USE IT?
```

A learner should be able to transfer the method to a profession other than the one shown in the
main case study.

## 11. Capstone contract

S07 is the integrated professional application of S01–S06.

Each learner or group chooses a bounded professional task.

The task should be:

- understandable;
- useful;
- limited in scope;
- safe to simulate;
- suitable for human review.

Examples include:

- preparing a meeting summary;
- drafting a recurring response;
- summarizing a procedure;
- preparing a checklist;
- organizing a project plan;
- comparing documented options;
- transforming approved notes into a structured document.

The capstone must contain:

1. **Problem**
   - What work problem is being addressed?

2. **Expected result**
   - What should the process produce?

3. **Audience**
   - Who will use the result?

4. **Allowed information**
   - What information may be supplied to the AI?

5. **Prompt or prompt sequence**
   - What instructions are used?

6. **Example output**
   - What did the AI produce?

7. **Iteration**
   - What was changed after evaluating the first result?

8. **Verification**
   - What must be checked and against which source?

9. **Human responsibility**
   - Who approves or uses the final result?

10. **Reuse**
    - How could the prompt or process be used again?

11. **Value**
    - Did it improve time, quality, consistency, or another meaningful measure?

12. **Limitations**
    - When should the process not be used?

Learners should present the process, not merely the final AI-generated answer.

## 12. Session readiness

A session is not ready for delivery merely because a Markdown source, PDF, or PPTX exists.

Before release, the session should satisfy the repository's existing validation requirements and
receive human review for:

- factual suitability;
- source alignment;
- audience accessibility;
- professional relevance;
- exercise clarity;
- confidentiality;
- human-decision boundaries;
- slide readability;
- presenter notes;
- timing;
- rehearsal.

Automated validation supports these checks but does not replace instructor judgment.

## 13. Fusion rules for S01–S03

Existing sessions should be refactored incrementally.

### S01

Preserve:

- accessible AI foundations;
- the Soubré cooperative anchor case;
- predictive versus generative AI;
- machine learning and deep learning at an appropriate level;
- foundation models and LLMs;
- human responsibility.

Strengthen:

- immediate professional relevance;
- capability-versus-limit framing;
- tool-choice questions;
- transfer examples outside the anchor case.

Avoid turning S01 into a survey of terminology with no workplace consequence.

### S02

Preserve:

- generative-AI foundations;
- model capabilities and limitations;
- existing practical demonstrations;
- source-grounding and human review.

Strengthen:

- email;
- reports;
- meeting summaries;
- presentations;
- rewriting;
- workplace content transformation;
- transferable examples across professions.

S02 should make professional usefulness visible before S03 focuses on prompting technique.

### S03

Preserve:

- source-constrained prompting;
- zero-shot and few-shot techniques;
- interview prompting;
- decomposition;
- alternative formulations;
- evaluation;
- multimodal inputs;
- explicit human approval.

Add early:

- the seven-element practical prompt framework.

S03 should progress from:

```text
STRUCTURE
    ↓
ITERATE
    ↓
EXAMPLES
    ↓
ASK FOR MISSING CONTEXT
    ↓
DECOMPOSE
    ↓
COMPARE
    ↓
VERIFY
```

## 14. Development order

The intended implementation sequence is:

```text
Curriculum contract
        ↓
Refactor S01
        ↓
Refactor S02
        ↓
Refactor S03
        ↓
Design S04 contract
        ↓
Design S05 contract
        ↓
Design S06 contract
        ↓
Design S07 capstone contract
        ↓
Build and validate S04–S07
```

Each refactor should remain independently reviewable and revertible.

## 15. Open decisions

The following decisions remain intentionally unresolved until implementation review:

- final public program title;
- final duration of S04–S07;
- whether S07 uses individual work, group work, or both;
- which non-cooperative professional examples become recurring examples;
- whether learners receive a separate workbook or job-aid;
- whether the five-question framework receives a dedicated visual identity;
- whether the final capstone is assessed formally or used only as guided practice.

These decisions must not be silently fixed by generated teaching material.

## 16. Success criteria

The fused curriculum succeeds when a learner without a technical background can:

- explain what AI and generative AI can and cannot reasonably do;
- identify useful AI opportunities in ordinary professional work;
- formulate and improve a task-appropriate prompt;
- work from approved source information without inventing missing facts;
- verify an AI-generated result before using it;
- protect information that should not be shared;
- identify when human approval is required;
- integrate AI into a bounded workflow;
- evaluate whether the workflow actually improves the work;
- build and explain a reusable AI-assisted professional process.

The program should make learners more capable without implying that AI removes professional
judgment, responsibility, or accountability.
