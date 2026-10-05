# S05 — Building an AI-Assisted Workflow — 60-Minute Content Contract

## Status

- **Session:** S05 — Building an AI-Assisted Workflow / Construire un workflow assisté par l’IA
- **Duration:** 60 minutes
- **Slide count:** 25 slides in English and 25 slides in French
- **Audience:** professionals and learners with no technical prerequisite
- **Curriculum position:** INTEGRATE
- **Central question:** Where should AI fit inside a real professional process?
- **Primary contribution:** workflow design, human checkpoints, reuse, and value measurement
- **Anchor case:** fictional cocoa cooperative near Soubré
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Fusion audit:** `docs/teaching/s05-professional-fusion-audit.md`
- **Teaching sources:** not yet created
- **Purpose:** freeze the bilingual instructional sequence, timing, provenance, workflow model,
  fictional source package, activities, measurement method, human checkpoints, visuals, and
  professional boundaries before implementation.

## 1. Session role

S05 follows S04.

S04 teaches:

> How do I summarize, compare, and analyze without inventing facts?

S05 teaches:

> Where should AI fit inside a real professional process?

The session therefore shifts the learner from reliable information work toward reliable process
design.

The learner should stop treating professional AI use as:

```text
TASK
    ↓
PROMPT
    ↓
ANSWER
```

and instead reason through:

```text
RESULT
    ↓
INPUTS
    ↓
PREPARATION
    ↓
BOUNDED AI TASK
    ↓
VERIFICATION
    ↓
HUMAN ACTION
    ↓
OUTPUT
    ↓
MEASUREMENT
```

The prompt remains useful, but it is only one component of the workflow.

## 2. Learning outcomes

By the end of the 60-minute session, the learner should be able to:

1. map a bounded professional task as an observable sequence of steps;
2. define the intended result before selecting an AI use case;
3. identify the inputs required by the process;
4. identify a bounded step where AI could assist;
5. distinguish the AI-assisted step from surrounding human work;
6. specify what the AI receives and what it should produce;
7. place verification at an explicit checkpoint;
8. place human review, action, or approval where required;
9. handle missing or unsupported information without allowing the workflow to invent it;
10. convert a one-off interaction into a reusable process;
11. select meaningful measures for comparing the workflow before and after AI assistance;
12. improve a workflow after observing a specific failure rather than assuming that AI creates
    value automatically.

## 3. Canonical provenance

### Course 01 / Module 03 — Business and Career Transformation Through AI

**Module ID:**

`module_0b195bf4-4cc0-4149-9fe7-6b753f42a00c`

Relevant concepts:

- define business goals before adopting AI;
- identify suitable use cases;
- prepare and validate relevant data;
- integrate AI into existing workflows and systems;
- use AI to reduce repetitive work and augment professional capability;
- deploy or integrate AI as part of a broader process;
- monitor performance;
- optimize over time;
- use measurable outcomes rather than assuming improvement;
- preserve human review where required.

This is the primary canonical source for S05.

The relevant adoption pattern is:

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

S05 adapts this organizational idea to a bounded professional workflow.

### Course 03 / Module 02 — Prompt Engineering: Techniques and Approaches

**Module ID:**

`module_37663745-fa25-44cc-a2aa-a5f91583fefc`

Relevant concepts:

- task decomposition;
- gathering missing information;
- matching a technique to the task;
- explicit evaluation criteria;
- evaluating outputs before refinement;
- correcting specific failures;
- human review when the result matters;
- separating confirmed information from unsupported assumptions.

S05 uses these concepts operationally.

It does not reteach the full prompt-engineering curriculum.

### Course 04 / Module 01 — Chatbot Fundamentals

**Module ID:**

`module_344aa1fd-d689-4ac0-a7d9-95aa7b298849`

Relevant concepts:

- actions as bounded tasks;
- action workflows;
- ordered steps;
- conditions;
- branches;
- multi-step processes;
- predictable versus flexible behavior.

S05 directly adapts the structural workflow model:

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

The chatbot implementation, watsonx Assistant interface, and flower-shop implementation are not
taught in S05.

The module remains registered because its action-workflow model is directly adapted rather than
because the word "workflow" happens to occur in the source.

### Course 01 / Module 04 — Issues, Concerns, and Ethical Considerations

**Module ID:**

`module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`

Relevant concepts:

- human oversight;
- accountability;
- human review;
- verification;
- continuous monitoring;
- responsible use inside AI-enabled processes.

S05 uses these concepts to make responsibility visible inside the workflow.

Detailed privacy, confidentiality, security, authorization, and high-consequence governance remain
primarily S06 material.

### Canonical material deliberately excluded

Course 02 workplace applications remain prior learning from S02.

Course 03 Module 01 prompt fundamentals remain prior learning from S03.

Course 04 Modules 02–06 are not required merely because they contain conditions, variables,
deployment steps, or other workflow-like structures.

## 4. Professional-practice input

Professional practices adapted from the fused curriculum include:

- map the existing process before redesigning it;
- define the desired professional result;
- identify what information is required;
- identify what information is allowed to enter the AI tool;
- assign AI a bounded task rather than an undefined professional responsibility;
- define expected output;
- verify generated output;
- preserve explicit human responsibility;
- reuse controlled process components;
- measure usefulness;
- improve after observing a specific failure.

These practices are professional adaptation input and are not automatically IBM/Coursera source
material.

## 5. Prior-learning boundary

### Reuse from S02

Assume learners already understand that generative AI can assist with:

- drafting;
- rewriting;
- summarizing;
- extracting;
- comparing;
- organizing;
- generating alternatives.

Do not repeat the general catalogue of generative-AI applications.

### Reuse from S03

Assume learners already understand:

- task;
- context;
- audience;
- format;
- constraints;
- quality criteria;
- decomposition;
- gathering missing information;
- iterative refinement.

Do not reteach the complete prompt framework.

### Reuse from S04

Assume learners already understand:

- confirmed information;
- missing information;
- conflicting information;
- derived observations;
- unsupported statements;
- source grounding;
- verification;
- human resolution of uncertainty.

S05 places these controls inside a repeatable process.

## 6. S05 Workflow Canvas

The session should introduce one reusable workflow-design canvas.

It contains eight fields.

### 1. Result

What professional result should the process produce?

### 2. Inputs

What information or material is required?

### 3. Safety

What information is authorized to enter the AI-assisted step?

### 4. AI task

What bounded operation should AI perform?

Examples may include:

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

### 5. Verification

What must be checked, and against what source or criterion?

### 6. Human action

What must a responsible person review, decide, approve, publish, send, or otherwise perform?

### 7. Reuse

What part of the process can be reused?

Examples:

- prompt template;
- source checklist;
- required-input checklist;
- output structure;
- review checklist;
- escalation condition.

### 8. Measure

How will usefulness be observed?

The shorthand is:

```text
RESULT
    ↓
INPUTS
    ↓
SAFETY
    ↓
AI TASK
    ↓
VERIFY
    ↓
HUMAN ACTION
    ↓
REUSE
    ↓
MEASURE
```

The canvas complements rather than replaces the program-wide five-question framework.

## 7. Fictional Soubré workflow package

The anchor case is entirely fictional.

Its purpose is to provide a bounded source package for designing and testing an AI-assisted daily
operations brief.

No real cooperative procedure is asserted.

### Source A — Field operations note

```text
Date: 5 October 2026
Collection point: CP-A

Intake paused at 09:10.
Intake resumed at 09:40.
The note does not state the reason for the pause.
```

### Source B — Reception records

For this fictional exercise, reception staff record:

```text
lot ID
date
weight
```

If one of those fields is missing, the record is marked:

```text
needs completion
```

and is sent for staff review.

Recorded items:

```text
Lot ID: SB-201
Date: 5 October 2026
Weight: 540 kg
```

and:

```text
Lot ID: SB-202
Date: 5 October 2026
Weight: missing
Status: needs completion
```

### Source C — Warehouse movement note

```text
Lot ID: SB-201
Movement time: 12:15
Recorded destination: Area A
```

No meaning beyond the supplied label `Area A` is established.

### Source D — Follow-up list

```text
SB-202 requires staff review because the weight field is missing.
```

### Information deliberately not supplied

The source package does not establish:

- why intake paused;
- lot quality;
- acceptance or rejection;
- certification status;
- producer identity;
- producer payment;
- ownership;
- commercial value;
- whether Area A represents approval or a quality category;
- any legal or regulatory consequence.

Those items must remain unknown unless a future exercise explicitly supplies them.

## 8. Source-package design rules

The source package must remain identical in meaning across English and French.

The implementation must not silently add:

- a power outage;
- equipment failure;
- weather event;
- quality threshold;
- certification requirement;
- payment rule;
- approval status;
- warehouse interpretation;
- producer information.

`CP-A`, `SB-201`, `SB-202`, `540 kg`, `09:10`, `09:40`, `12:15`, and `Area A` are fictional teaching
data.

## 9. Baseline workflow

Before inserting AI, learners should map a reasonable manual process:

```text
RECEIVE APPROVED SOURCE PACKAGE
    ↓
READ EACH SOURCE
    ↓
IDENTIFY RELEVANT FACTS / GAPS
    ↓
DRAFT DAILY BRIEF
    ↓
VERIFY AGAINST SOURCES
    ↓
RESPONSIBLE PERSON USES OR SENDS BRIEF
```

This manual workflow is the baseline.

It must not be described as inefficient merely because it is manual.

Its strengths and weaknesses must be observed rather than assumed.

## 10. AI-assisted workflow

A candidate AI-assisted design is:

```text
APPROVED INPUTS
    ↓
CHECK COMPLETENESS / AUTHORIZATION
    ↓
AI STRUCTURES A DRAFT BRIEF
    ↓
STAFF VERIFIES AGAINST SOURCES
    ↓
CORRECT OR ESCALATE IF NEEDED
    ↓
RESPONSIBLE PERSON USES OR SENDS BRIEF
    ↓
RECORD USEFULNESS MEASURES
```

The AI task is bounded:

> Structure the supplied information into a short operations brief. Use only the supplied sources.
> Preserve missing information as missing. Do not infer reasons, approvals, quality results,
> payments, or other facts that are not supplied.

AI does not acquire organizational authority merely because it appears in the workflow.

## 11. Deliberately flawed AI draft

Use the following simulated output during the session:

> Intake at CP-A was interrupted by a power outage and resumed at 09:40. Lot SB-201 weighed 540 kg
> and was approved for storage in Area A. Lot SB-202 is awaiting completion because its weight is
> missing.

Learners should identify:

### Supported

- intake resumed at 09:40;
- SB-201 records 540 kg;
- SB-202 has a missing weight;
- SB-202 needs completion.

### Unsupported

- `power outage`;
- `approved for storage`.

### Source-supported but requiring careful wording

`Area A` is a recorded destination.

The source does not establish what Area A means.

A corrected draft may state:

> At CP-A, intake was paused at 09:10 and resumed at 09:40. The supplied note does not state the
> reason for the pause. Lot SB-201 records 540 kg and a movement to Area A at 12:15. Lot SB-202 has
> no recorded weight and is marked needs completion for staff review.

## 12. Conditions and exception paths

A professional workflow should not assume that every case follows the happy path.

S05 should introduce simple conditions such as:

```text
INPUT COMPLETE?
    ├── YES → CONTINUE TO AI TASK
    └── NO  → MARK GAP / REQUEST REVIEW
```

and:

```text
AI OUTPUT SUPPORTED?
    ├── YES → CONTINUE
    └── NO  → CORRECT / RETURN / ESCALATE
```

This adapts the concept of conditions and branches without turning the session into programming.

## 13. Human checkpoint contract

A checkpoint must answer four questions:

1. What is being checked?
2. Against what source or criterion?
3. Who is responsible for the check?
4. What happens if the check fails?

For the Soubré case:

```text
CHECK:
facts in the draft brief

AGAINST:
Sources A–D

RESPONSIBLE:
staff reviewer

IF CHECK FAILS:
correct the draft or escalate unresolved information
```

Human review does not automatically mean formal approval.

The required human action depends on the task.

## 14. Reuse contract

The workflow should produce reusable process components.

For the anchor case, these may include:

### Prompt template

A stable instruction for converting approved inputs into a draft brief.

### Required-input checklist

```text
field note
reception records
warehouse movement note
follow-up list
```

### Verification checklist

```text
dates
times
lot IDs
weights
missing fields
unsupported causes
unsupported approvals
other added claims
```

### Output structure

```text
Operations
Recorded lots
Follow-up required
Unknown or unresolved information
```

Reuse means controlling the process.

It does not mean reusing the same answer.

## 15. Measurement contract

S05 must compare workflows without assuming that AI improved them.

Candidate measures include:

| Dimension          | Observable question                                      |
| ------------------ | -------------------------------------------------------- |
| Time               | How long did the task take?                              |
| Corrections        | How many corrections were required?                      |
| Accuracy           | Were important source facts preserved?                   |
| Unsupported claims | How many unsupported statements appeared?                |
| Consistency        | Did repeated cases follow the intended structure?        |
| Reuse              | Could the process be repeated with limited adjustment?   |
| Effort             | How much avoidable manual work remained?                 |
| Risk               | Did the process introduce a meaningful new failure mode? |

At least one baseline observation and one AI-assisted observation should be recorded when the
activity permits.

Before-and-after observations should use the same task or sufficiently comparable task conditions.

Otherwise, the result should be described as an informal observation rather than evidence that AI
caused the difference.

The governing measurement rule is:

```text
FASTER ≠ AUTOMATICALLY BETTER
```

## 16. Improvement loop

Teach:

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

A change should respond to an observed problem.

Examples:

```text
Observed:
AI invents a reason for an interruption.

Adjustment:
strengthen source constraint and add a verification check for unsupported causes.
```

or:

```text
Observed:
reviewers repeatedly reformat the same section.

Adjustment:
freeze a reusable output structure.
```

The learner should improve the workflow because of evidence, not novelty.

## 17. Content boundary

### S05 owns

- workflow mapping;
- bounded AI tasks;
- process inputs and outputs;
- conditions and exception paths;
- human checkpoints;
- workflow reuse;
- before-and-after observation;
- value measurement;
- iterative workflow improvement.

### Defer to S06

- detailed confidentiality classification;
- detailed privacy practice;
- security controls;
- credentials;
- authorization models;
- regulated-data handling;
- high-consequence decision governance;
- detailed accountability frameworks.

### Defer to S07

- learner-designed end-to-end capstone;
- integrated application of S01–S06;
- full reusable professional process;
- capstone presentation;
- final limitations and transfer analysis.

## 18. Slide-by-slide contract

### S05-01 — Building an AI-Assisted Workflow

**Time:** 1 minute

Purpose:

- establish session identity;
- preserve IBM/Coursera source attribution;
- disclose AI-assisted teaching-material generation and human-review requirement.

Projected message:

> Put AI inside the process. Do not replace the process with AI.

### S05-02 — What you will be able to do

**Time:** 2 minutes

Learners should leave able to:

- map a workflow;
- choose a bounded AI step;
- define inputs and outputs;
- add verification;
- keep human responsibility visible;
- reuse the process;
- measure whether it helps.

### S05-03 — From verification to integration

**Time:** 2 minutes

Bridge from S04:

```text
S04:
IS THE OUTPUT SUPPORTED?
        ↓
S05:
WHERE DOES THAT CHECK BELONG
IN THE PROCESS?
```

Verification remains necessary.

S05 makes it part of workflow design.

### S05-04 — One prompt is not a workflow

**Time:** 2 minutes

Contrast:

```text
TASK → PROMPT → ANSWER
```

with:

```text
INPUT → AI TASK → CHECK → HUMAN ACTION → OUTPUT
```

Main lesson:

> A useful answer is not automatically a reliable professional process.

### S05-05 — The Workflow Canvas

**Time:** 3 minutes

Introduce:

```text
RESULT
INPUTS
SAFETY
AI TASK
VERIFY
HUMAN ACTION
REUSE
MEASURE
```

This remains visible throughout the session.

### S05-06 — Start with the result

**Time:** 2 minutes

Ask:

> What professional result are we trying to produce?

Use the anchor result:

> A short daily operations brief based only on approved fictional source information.

AI selection comes after the result is defined.

### S05-07 — Map the process before changing it

**Time:** 3 minutes

Show the manual baseline:

```text
SOURCES
    ↓
READ
    ↓
IDENTIFY FACTS / GAPS
    ↓
DRAFT
    ↓
VERIFY
    ↓
USE
```

Do not label it good or bad yet.

First understand it.

### S05-08 — Find the bounded AI step

**Time:** 2 minutes

Ask:

> Which step could AI assist without taking over the professional responsibility?

Candidate:

```text
STRUCTURE A DRAFT BRIEF
```

not:

```text
RUN OPERATIONS
```

or:

```text
MAKE OFFICIAL DECISIONS
```

### S05-09 — Give AI a bounded task

**Time:** 2 minutes

Teach:

```text
INPUT
    ↓
SPECIFIC OPERATION
    ↓
EXPECTED OUTPUT
```

Examples:

```text
summarize
extract
classify
compare
flag
draft
reformat
```

### S05-10 — Inputs must be known and allowed

**Time:** 2 minutes

Introduce the fictional source package.

Before the AI step, ask:

```text
DO WE HAVE THE REQUIRED INPUTS?
ARE WE ALLOWED TO USE THEM HERE?
```

S06 will deepen the safety question.

### S05-11 — The prompt belongs inside the workflow

**Time:** 2 minutes

Show:

```text
WORKFLOW
    ↓
AI TASK
    ↓
PROMPT
```

not:

```text
PROMPT
    ↓
HOPE FOR A PROCESS
```

Reuse S03 prompt skills without reteaching them.

### S05-12 — Steps, conditions, and checkpoints

**Time:** 3 minutes

Directly adapt the action-workflow model:

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

Introduce simple branch:

```text
INPUT COMPLETE?
YES → CONTINUE
NO  → REVIEW
```

### S05-13 — Meet the Soubré workflow package

**Time:** 2 minutes

Introduce Sources A–D.

Explicitly state:

- all information is fictional;
- missing facts remain missing;
- no quality, payment, certification, or approval rule is supplied.

### S05-14 — Establish the manual baseline

**Time:** 3 minutes

Learners inspect the source package and outline how a person could prepare the brief manually.

Possible observations:

- several sources must be read;
- facts must be selected;
- missing information must remain visible;
- the final brief must still be verified.

No efficiency conclusion is assumed.

### S05-15 — Insert AI into one step

**Time:** 3 minutes

Build:

```text
APPROVED INPUTS
    ↓
CHECK COMPLETENESS
    ↓
AI DRAFT
    ↓
VERIFY
    ↓
HUMAN ACTION
    ↓
USE
```

Ask learners what AI is doing and what it is not doing.

### S05-16 — Put the human checkpoint in the workflow

**Time:** 3 minutes

Use the four checkpoint questions:

```text
WHAT?
AGAINST WHAT?
WHO?
WHAT IF IT FAILS?
```

The reviewer compares the draft against Sources A–D.

### S05-17 — Test the AI-assisted step

**Time:** 3 minutes

Show the deliberately flawed draft:

> Intake at CP-A was interrupted by a power outage and resumed at 09:40. Lot SB-201 weighed 540 kg
> and was approved for storage in Area A. Lot SB-202 is awaiting completion because its weight is
> missing.

Learners identify:

```text
SUPPORTED
UNSUPPORTED
REQUIRES CAREFUL WORDING
```

### S05-18 — Design the exception path

**Time:** 2 minutes

Teach:

```text
CHECK PASSES?
    ├── YES → CONTINUE
    └── NO  → CORRECT / ESCALATE
```

A workflow is incomplete if it defines only the successful path.

### S05-19 — Make the process reusable

**Time:** 2 minutes

Identify reusable components:

- prompt template;
- required-input checklist;
- verification checklist;
- fixed output structure;
- exception rule.

Projected message:

> Reuse the process, not yesterday's answer.

### S05-20 — Measure whether it helps

**Time:** 3 minutes

Introduce measures:

```text
TIME
CORRECTIONS
ACCURACY
UNSUPPORTED CLAIMS
CONSISTENCY
REUSE
EFFORT
RISK
```

Require at least one meaningful observation.

### S05-21 — Faster does not automatically mean better

**Time:** 2 minutes

Example:

```text
WORKFLOW A:
5 minutes
0 unsupported claims

WORKFLOW B:
3 minutes
3 unsupported claims
```

Do not declare B better because it is faster.

The metrics must reflect the intended result.

### S05-22 — Improve from an observed failure

**Time:** 2 minutes

Teach:

```text
DESIGN → TRY → CHECK → MEASURE → ADJUST
```

Example:

unsupported cause invented

→ add stronger source constraint

→ add verification check

→ test again.

### S05-23 — Professional transfer

**Time:** 2 minutes

Transfer the same model to:

#### Meeting follow-up

```text
approved notes
    ↓
AI drafts actions
    ↓
meeting owner verifies
    ↓
follow-up is sent
```

#### Project status update

```text
confirmed status
    ↓
AI structures draft
    ↓
project owner verifies
    ↓
update is published
```

The method is not cocoa-specific.

### S05-24 — Build the workflow

**Time:** 5 minutes

Learners use the Workflow Canvas for the Soubré case.

They must specify:

1. result;
2. inputs;
3. safety boundary;
4. bounded AI task;
5. verification checkpoint;
6. human action;
7. reusable components;
8. one meaningful measure;
9. one exception path.

Acceptance criteria:

- AI responsibility is bounded;
- inputs are explicit;
- missing information remains missing;
- verification is observable;
- human responsibility is explicit;
- an exception path exists;
- reuse is concrete;
- value is measured rather than assumed.

### S05-25 — The professional habit

**Time:** 2 minutes

Close with:

```text
DO NOT ASK ONLY:
"CAN AI DO THIS?"

ASK:
"WHERE SHOULD AI FIT,
WHO CHECKS THE RESULT,
AND DOES THE WORKFLOW ACTUALLY HELP?"
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

Transition toward S06:

> Once AI is inside the workflow, the next question is which information, actions, and decisions
> require stronger boundaries.

## 19. Timing contract

The following timing is the single authoritative delivery schedule for S05.

## 20. Final timing

| Slide     | Minutes |
| --------- | ------: |
| S05-01    |       1 |
| S05-02    |       2 |
| S05-03    |       2 |
| S05-04    |       2 |
| S05-05    |       3 |
| S05-06    |       2 |
| S05-07    |       3 |
| S05-08    |       2 |
| S05-09    |       2 |
| S05-10    |       2 |
| S05-11    |       2 |
| S05-12    |       3 |
| S05-13    |       2 |
| S05-14    |       3 |
| S05-15    |       3 |
| S05-16    |       3 |
| S05-17    |       3 |
| S05-18    |       2 |
| S05-19    |       2 |
| S05-20    |       3 |
| S05-21    |       2 |
| S05-22    |       2 |
| S05-23    |       2 |
| S05-24    |       5 |
| S05-25    |       2 |
| **Total** |  **60** |

The teaching sources must use this timing exactly.

## 21. Activity contract

S05 should contain three levels of learner action.

### Guided

Learners:

- map the manual process;
- identify a bounded AI-assisted step;
- identify inputs and expected output.

### Diagnostic

Learners:

- inspect the deliberately flawed AI draft;
- identify unsupported statements;
- determine where the workflow should detect or correct the failure.

### Integrated

Learners complete the S05 Workflow Canvas for the full fictional source package.

No activity requires private internal reasoning to be exposed.

Tasks should request observable outputs.

Live AI access is optional.

If live access is unavailable, the deliberately flawed draft and other clearly labelled simulated
outputs may be used.

## 22. Visual contract

The eventual deck should prioritize process-oriented visuals.

Candidate visual structures include:

### Workflow Canvas

```text
RESULT
  ↓
INPUTS
  ↓
SAFETY
  ↓
AI TASK
  ↓
VERIFY
  ↓
HUMAN ACTION
  ↓
REUSE
  ↓
MEASURE
```

### Manual versus AI-assisted workflow

```text
MANUAL
SOURCES → READ → DRAFT → VERIFY → USE

AI-ASSISTED
SOURCES → CHECK → AI DRAFT → VERIFY → HUMAN ACTION → USE
```

### Human / AI responsibility model

```text
HUMAN
define result
select allowed inputs
              ↓
AI
bounded task
              ↓
HUMAN
verify
decide / act
```

### Exception path

```text
CHECK PASSES?
   ├── YES → CONTINUE
   └── NO  → CORRECT / ESCALATE
```

### Improvement loop

```text
DESIGN → TRY → CHECK → MEASURE → ADJUST
   ↑                                  │
   └──────────────────────────────────┘
```

Visuals should clarify process structure rather than decorate dense text.

## 23. Bilingual alignment contract

English and French implementations must preserve:

- 25 slides each;
- identical slide IDs;
- identical slide ordering;
- identical timing;
- identical fictional source facts;
- identical workflow logic;
- identical unsupported claims in the flawed draft;
- identical exception paths;
- identical human-responsibility boundaries;
- identical measurement logic;
- identical canonical provenance.

Translation may adapt phrasing naturally.

Translation must not introduce a new operational rule.

## 24. Source attribution and AI disclosure

The first slide must visibly communicate both:

1. the teaching session is based in part on IBM's **AI Foundations for Everyone** Specialization on
   Coursera; and
2. the deck is an independent teaching adaptation generated with AI and subject to human review.

Presenter metadata must preserve the same distinction.

## 25. Human-decision boundary

S05 may teach AI assistance for:

- drafting;
- summarization;
- extraction;
- comparison;
- classification;
- structuring information;
- flagging missing information;
- preparing reusable professional outputs.

The session must not imply that AI automatically has authority to:

- accept or reject a cocoa lot;
- assign a quality grade;
- approve payment;
- approve storage;
- determine certification;
- create producer obligations;
- resolve unsupported facts;
- publish on behalf of an organization without the required human action;
- make consequential decisions merely because the workflow contains AI.

## 26. Acceptance criteria

The S05 teaching implementation is acceptable only if:

1. both languages contain exactly 25 aligned slides;
2. total timing is exactly 60 minutes;
3. S05 retains the INTEGRATE role;
4. the workflow is taught before the prompt is treated as an implementation detail;
5. the Workflow Canvas contains Result, Inputs, Safety, AI Task, Verification, Human Action, Reuse,
   and Measure;
6. the Soubré source package remains fictional;
7. CP-A intake pauses at 09:10 and resumes at 09:40;
8. no cause for that pause is supplied;
9. SB-201 records 540 kg;
10. SB-201 records a movement to Area A at 12:15;
11. no meaning beyond the label Area A is asserted;
12. SB-202 has a missing weight;
13. SB-202 is marked needs completion;
14. SB-202 requires staff review;
15. the flawed AI draft includes the unsupported `power outage` claim;
16. the flawed AI draft includes the unsupported `approved for storage` claim;
17. learners detect those unsupported claims;
18. learners map at least one exception path;
19. AI responsibility remains bounded;
20. human verification remains explicit;
21. formal human approval is required only where the task actually calls for it;
22. at least one reusable workflow component is identified;
23. measurement includes at least one meaningful before/after observation when comparable conditions
    exist;
24. faster performance is not automatically treated as better performance;
25. workflow improvement responds to an observed failure;
26. Course 04 Module 01 is used only for its directly adapted action-workflow structure;
27. S06 confidentiality, security, and consequential governance remain deferred;
28. S07 capstone work remains deferred;
29. source attribution remains visible;
30. AI-generation disclosure remains visible;
31. projected content and presenter notes preserve the same factual and responsibility boundaries.

## 27. Governing rule

```text
AI SHOULD HAVE A DEFINED PLACE IN THE PROCESS,
A DEFINED TASK,
A DEFINED CHECK,
AND A MEASURABLE REASON TO BE THERE.
```

Everything in the S05 implementation should reinforce that habit.
