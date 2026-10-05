# S05 Professional Fusion Audit

## Status

- **Session:** S05 — Building an AI-Assisted Workflow / Construire un workflow assisté par l’IA
- **Audience:** professionals and learners with no technical prerequisite
- **Curriculum position:** INTEGRATE
- **Central question:** Where should AI fit inside a real professional process?
- **Primary contribution:** workflow design, human checkpoints, reuse, and value measurement
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Current content contract:** not yet created
- **Current teaching sources:** not yet created
- **Slide-count target:** not yet frozen
- **Detailed timing contract:** not yet frozen
- **Purpose of this audit:** establish the canonical provenance, professional-practice boundary,
  workflow model, inherited concepts, exclusions, measurement requirements, and design constraints
  that should govern the S05 bilingual content contract.

## 1. Session role in the fused curriculum

The fused curriculum progresses through:

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

S05 occupies the **INTEGRATE** position.

S01 asks:

> What is AI, and what should I realistically expect from it?

S02 asks:

> What can I actually do with generative AI professionally?

S03 asks:

> How do I communicate effectively with an AI system?

S04 asks:

> How do I summarize, compare, and analyze without inventing facts?

S05 should ask:

> Where should AI fit inside a real professional process?

The instructional shift is important.

S05 is not primarily about discovering another AI capability or writing a better individual prompt.

It is about moving from:

```text
ONE AI INTERACTION
```

toward:

```text
A REPEATABLE PROFESSIONAL PROCESS
```

in which:

- the desired result is explicit;
- inputs and approved sources are known;
- AI is assigned bounded tasks;
- human responsibility remains visible;
- verification occurs at defined checkpoints;
- the process can be reused;
- usefulness can be measured.

## 2. Source and authority boundary

S05 uses the same layered authority model as the professional curriculum.

### 2.1 Canonical IBM/Coursera provenance selected for S05

#### Course 01 / Module 03 — Business and Career Transformation Through AI

- **Module ID:** `module_0b195bf4-4cc0-4149-9fe7-6b753f42a00c`
- **Canonical EN source:**
  `courses/01-introduction-to-artificial-intelligence-ai/en/03-business-and-career-transformation-through-ai.md`

This should be the primary canonical source for S05.

Relevant material includes:

- defining business goals before adopting AI;
- identifying suitable AI use cases;
- preparing and validating relevant data;
- building organizational capability;
- integrating AI solutions into existing workflows and systems;
- monitoring performance;
- optimizing the process over time;
- using AI to reduce repetitive work;
- using AI to augment professional capabilities;
- integrating generative AI into professional workflows;
- preserving human review where necessary;
- applying AI to process improvement;
- evaluating adoption through measurable outcomes.

The canonical module presents AI adoption as an iterative sequence rather than a one-time deployment:

```text
DEFINE GOALS
    ↓
IDENTIFY USE CASES
    ↓
PREPARE DATA
    ↓
BUILD CAPABILITY
    ↓
DEPLOY / INTEGRATE
    ↓
MONITOR
    ↓
OPTIMIZE
```

Its repository adaptation for the fictional cocoa cooperative also proposes measurable indicators
such as:

- incomplete records;
- reconciliation time;
- forecast error;
- share of drafts accepted after review.

No performance improvement is assumed before measurement.

#### Course 03 / Module 02 — Prompt Engineering: Techniques and Approaches

- **Module ID:** `module_37663745-fa25-44cc-a2aa-a5f91583fefc`
- **Canonical EN source:**
  `courses/03-generative-ai-prompt-engineering-basics/en/02-prompt-engineering-techniques-and-approaches.md`

Relevant material includes:

- task decomposition;
- gathering missing information before proceeding;
- choosing a technique according to the task;
- using explicit evaluation criteria;
- evaluating outputs before refinement;
- human review when the final choice matters;
- separating confirmed information from unsupported assumptions.

S05 should reuse these concepts operationally.

It should not reteach the complete prompt-engineering curriculum from S03.

The relevant contribution is:

```text
BREAK THE WORK INTO BOUNDED STEPS
    ↓
USE THE APPROPRIATE AI TECHNIQUE
    ↓
EVALUATE THE OUTPUT
    ↓
CONTINUE OR CORRECT
```

#### Course 04 / Module 01 — Chatbot Fundamentals

- **Module ID:** `module_344aa1fd-d689-4ac0-a7d9-95aa7b298849`
- **Canonical EN source:**
  `courses/04-building-ai-powered-chatbots-without-programming/en/01-chatbot-fundamentals.md`

Relevant canonical concepts include:

- actions as bounded tasks;
- action workflows as sequences of steps;
- conditions and branches;
- multi-step processes;
- predictable versus flexible behavior;
- assigning different interaction types to different mechanisms.

S05 may adapt the structural idea:

```text
TASK
    ↓
STEPS
    ↓
CONDITIONS
    ↓
CHECKPOINTS
    ↓
RESULT
```

The chatbot implementation itself is not the subject of S05.

#### Course 01 / Module 04 — Issues, Concerns, and Ethical Considerations

- **Module ID:** `module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`
- **Canonical EN source:**
  `courses/01-introduction-to-artificial-intelligence-ai/en/04-issues-concerns-and-ethical-considerations.md`

Relevant material includes:

- human oversight;
- human review;
- accountability;
- verification;
- continuous monitoring;
- integrating responsible-AI considerations into project workflows.

S05 should use these concepts to define checkpoints and responsibility.

It should not expand them into the full confidentiality, governance, or consequential-decision
curriculum reserved for S06.

### 2.2 Canonical modules not selected by default

#### Course 02 / Module 02 — Applications and Tools of Generative AI

This module contains useful workplace applications such as drafting, summarization, transformation,
and analysis.

Those capabilities have already been introduced in S02 and operationalized further in S04.

S05 may rely on them as prior knowledge without registering this module unless substantial content
is directly adapted into the final session.

#### Course 03 / Module 01 — Prompt Engineering for Generative AI

Prompt structure, context, constraints, and iterative refinement remain important.

They were already taught in S03.

S05 should use those skills rather than teach them again.

#### Course 04 / Modules 02–06

The remaining chatbot modules contain valuable implementation patterns, but S05 is not intended to
become a watsonx Assistant or chatbot-development session.

They should not be registered merely because they contain workflows, variables, conditions, or
deployment terminology.

## 3. Collaborative professional-practice input

The professional curriculum adds practical workflow-design requirements that are not automatically
claims about the IBM/Coursera source.

These include:

- map a real task as a sequence rather than a single prompt;
- identify what happens before AI is used;
- identify the exact step AI assists;
- specify what happens after AI produces an output;
- identify required human checkpoints;
- design the process so it can be repeated;
- preserve approved source boundaries;
- measure whether the workflow actually improves the work.

Useful measurements may include:

- time required;
- number of corrections;
- factual accuracy;
- consistency;
- ease of reuse;
- user effort;
- latency;
- operational risk;
- acceptance after human review.

A faster workflow is not automatically a better workflow.

## 4. Repository adaptation

The repository's fictional cocoa cooperative near Soubré should remain the anchor case.

The scenario must remain fictional and bounded.

S05 should not invent:

- real cooperative procedures;
- real ANADER rules;
- quality thresholds;
- producer payment rules;
- collection schedules;
- certification requirements;
- banking processes;
- official approval authority.

Any operational fact used in an exercise must either:

1. be explicitly supplied in the exercise; or
2. remain unknown.

## 5. What S05 inherits from S02

Assume learners already understand that generative AI can assist with tasks such as:

- drafting;
- rewriting;
- summarizing;
- extracting information;
- comparing information;
- organizing material;
- generating alternatives.

S05 should not repeat the general survey of generative-AI applications.

Instead, it asks:

> Where in the process should one of those capabilities be used?

## 6. What S05 inherits from S03

Assume learners already know how to define:

- task;
- context;
- audience;
- format;
- constraints;
- quality criteria.

They also know that an underspecified task may require:

- additional context;
- decomposition;
- examples;
- iterative refinement.

S05 converts those prompt-level skills into workflow-level design.

## 7. What S05 inherits from S04

Assume learners already know that:

- supplied information must remain source-grounded;
- missing information must remain missing;
- conflicting information should not be silently reconciled;
- generated statements are not evidence;
- important claims should be traceable;
- verification is part of the work;
- a human may need to resolve uncertainty.

S05 should place those controls at explicit points in a reusable process.

## 8. Core professional problem

A useful AI interaction does not automatically produce a useful professional workflow.

A weak workflow may look like:

```text
WORK ARRIVES
    ↓
SEND EVERYTHING TO AI
    ↓
ACCEPT OUTPUT
    ↓
USE IT
```

S05 should replace this with a bounded process such as:

```text
DEFINE RESULT
    ↓
IDENTIFY INPUTS
    ↓
CHECK SOURCE / COMPLETENESS
    ↓
ASSIGN A BOUNDED AI TASK
    ↓
VERIFY OUTPUT
    ↓
HUMAN DECISION OR APPROVAL
    ↓
USE RESULT
    ↓
MEASURE AND IMPROVE
```

The key question is not:

> Can AI do something here?

It is:

> What exact part of this process should AI assist, under what conditions, and how will the result
> be checked?

## 9. Workflow before prompt

S05 should establish that the prompt is one component of a larger process.

The workflow may contain:

```text
INPUT
    ↓
PREPARATION
    ↓
AI TASK
    ↓
CHECK
    ↓
HUMAN ACTION
    ↓
OUTPUT
```

The prompt belongs inside the AI-task step.

A strong prompt cannot repair a badly designed professional process by itself.

## 10. Bounded AI tasks

S05 should favor narrow operations that can be described and checked.

Examples include:

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

These operations come from the broader professional curriculum.

The learner should be able to state:

- what information enters the AI step;
- what task the AI performs;
- what output it should produce;
- what the AI is not authorized to decide;
- how that output is checked.

## 11. Human checkpoints

A workflow should make responsibility visible.

Typical human responsibilities may include:

```text
verify
approve
commit
authorize
publish
sign
decide
```

S05 should teach checkpoints as part of ordinary workflow design.

A checkpoint should answer:

1. What is being checked?
2. Against what source or criterion?
3. Who is responsible?
4. What happens if the result is incomplete or wrong?

Detailed governance and high-consequence decision boundaries remain primarily S06 material.

## 12. Reuse

A professional workflow becomes more valuable when it can be reused deliberately.

Potential reusable components include:

- a prompt template;
- a source checklist;
- a required-input checklist;
- a review checklist;
- a fixed output format;
- a sequence of steps;
- an escalation rule.

Reuse should not mean blindly repeating a prompt.

The reusable object is the controlled process.

## 13. Measure usefulness

S05 should make measurement observable.

Before claiming that AI improved the work, the learner should define at least one baseline and one
post-use observation.

Possible measures include:

| Dimension   | Example question                                          |
| ----------- | --------------------------------------------------------- |
| Time        | Did the task take less time?                              |
| Corrections | How many edits were required?                             |
| Accuracy    | Were important facts preserved correctly?                 |
| Consistency | Did repeated cases follow the same structure?             |
| Reuse       | Can the process be applied again with limited adjustment? |
| Effort      | Did the user perform less avoidable manual work?          |
| Risk        | Did the workflow introduce new failure modes?             |

The session should explicitly preserve:

```text
FASTER ≠ AUTOMATICALLY BETTER
```

## 14. Improvement loop

The canonical adoption material presents AI integration as iterative.

S05 should therefore use a loop such as:

```text
DESIGN
    ↓
TRY
    ↓
CHECK
    ↓
MEASURE
    ↓
ADJUST
    └────────→ DESIGN
```

The workflow should improve because a specific problem was observed.

Changes should not be made merely because the first output was imperfect.

## 15. Anchor-case requirement

The main S05 case should use a bounded workflow for the fictional cocoa cooperative near Soubré.

A strong candidate is:

> Prepare a daily operations brief from approved field and intake information.

Possible source inputs may include only facts explicitly supplied in the exercise, for example:

- field-visit notes;
- lot intake records;
- warehouse movements;
- unresolved record-completeness checks.

A candidate workflow is:

```text
APPROVED INPUTS
    ↓
CHECK COMPLETENESS
    ↓
AI STRUCTURES A DRAFT BRIEF
    ↓
STAFF VERIFIES FACTS
    ↓
RESPONSIBLE PERSON APPROVES
    ↓
BRIEF IS USED
    ↓
TIME / CORRECTIONS ARE RECORDED
```

This remains a fictional teaching adaptation.

No real cooperative rule is implied.

## 16. Professional transfer requirement

The session must demonstrate that the method transfers beyond the cocoa-cooperative case.

Possible short transfer examples include:

### Meeting follow-up

```text
approved notes
    ↓
AI drafts decisions / actions
    ↓
meeting owner verifies
    ↓
approved follow-up is sent
```

### Project status update

```text
confirmed status inputs
    ↓
AI structures a draft update
    ↓
project owner verifies dates / blockers / commitments
    ↓
update is published
```

The learner should understand the workflow method without needing knowledge of cocoa production.

## 17. Safety boundary

S05 should reinforce the program-wide safety question:

> What information am I allowed to provide to this tool?

Exercises should use:

- fictional data;
- anonymized data;
- approved public information;
- explicitly authorized information.

S05 should not become the detailed security and privacy session.

That belongs to S06.

The purpose here is to ensure that a workflow does not omit the safety checkpoint entirely.

## 18. Content to reuse without reteaching

### From S02

- generative-AI capabilities;
- common workplace use cases;
- human review of generated output.

### From S03

- prompt structure;
- iterative refinement;
- decomposition;
- gathering missing context;
- explicit quality criteria.

### From S04

- source grounding;
- evidence states;
- verification;
- unsupported-information handling;
- human resolution of uncertainty.

## 19. Content to defer

### Defer to S06

- detailed confidentiality policy;
- privacy classification;
- security controls;
- authorization models;
- regulatory compliance;
- high-consequence decision governance;
- detailed accountability frameworks.

### Defer to S07

- learner-designed end-to-end professional process;
- full capstone presentation;
- integrated application of S01–S06;
- formal reflection on process limitations and transfer.

## 20. Content explicitly excluded

S05 should not become:

- a survey of automation products;
- an RPA implementation course;
- an API-integration tutorial;
- an AI-agent engineering session;
- a chatbot-building lab;
- a second prompt-engineering session;
- a governance lecture;
- a claim that every professional task should use AI;
- a claim that automation is always desirable;
- a claim that faster work automatically creates more value.

## 21. Candidate learning outcomes

By the end of S05, the learner should be able to:

1. map a bounded professional task as a sequence of steps;
2. identify where AI could assist within that process;
3. distinguish the AI task from the surrounding human work;
4. define the inputs and expected output for the AI-assisted step;
5. place verification and human approval at explicit checkpoints;
6. convert a one-off AI interaction into a reusable workflow;
7. identify at least one meaningful measure of workflow usefulness;
8. compare the workflow before and after AI assistance without assuming improvement;
9. identify when AI should not perform or decide a particular step;
10. propose a small workflow improvement after observing a specific failure.

## 22. Open decisions for the content contract

The following decisions should remain open until the S05 content contract is written:

- exact 60-minute versus alternative duration;
- final slide count;
- exact cocoa-cooperative anchor workflow;
- exact measurement exercise;
- whether a before/after workflow comparison becomes the principal learner activity;
- whether learners receive a reusable workflow canvas;
- which transfer example accompanies the anchor case;
- number and placement of human checkpoints;
- final visual vocabulary for AI versus human steps.

These decisions must not be silently fixed by implementation.

## 23. Proposed canonical provenance

If the final teaching source substantially follows the design above, register:

```text
module_0b195bf4-4cc0-4149-9fe7-6b753f42a00c
module_37663745-fa25-44cc-a2aa-a5f91583fefc
module_344aa1fd-d689-4ac0-a7d9-95aa7b298849
module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c
```

This provenance should be reconsidered when the actual content contract is complete.

A module should remain registered only if its material is substantially adapted into the teaching
session.

## 24. Acceptance criteria for the S05 content contract

The future content contract should:

- preserve the INTEGRATE role of S05;
- build directly on S01–S04 without unnecessary repetition;
- keep AI tasks bounded;
- make workflow steps observable;
- identify inputs and outputs;
- include explicit human checkpoints;
- preserve source-grounding behavior;
- include at least one reuse mechanism;
- include measurable before/after evaluation;
- avoid claiming value without evidence;
- preserve a fictional and safe anchor case;
- include professional transfer beyond the cocoa context;
- distinguish canonical source material from repository adaptations;
- defer detailed governance to S06;
- prepare learners for the integrated S07 capstone.

## 25. Governing rule

S05 should teach learners to move from:

```text
"I USED AI."
```

to:

```text
"I KNOW WHERE AI FITS IN THE PROCESS,
WHAT IT RECEIVES,
WHAT IT PRODUCES,
WHO CHECKS IT,
AND WHETHER IT ACTUALLY HELPS."
```

The session is successful when AI is treated as one bounded component of a professional workflow,
not as a substitute for the workflow itself.
