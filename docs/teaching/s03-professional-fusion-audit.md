# S03 Professional Fusion Audit

## Status

- **Session:** S03 — Designing Effective Prompts / Concevoir de bons prompts
- **Duration target:** 60 minutes
- **Slide-count target:** 25 slides in English and 25 slides in French
- **Audience:** professionals and learners with no technical prerequisite
- **Anchor case:** fictional cocoa cooperative near Soubré
- **Curriculum position:** PROMPT
- **Parent contract:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Current content contract:** `docs/teaching/s03-prompt-engineering-60-min-content-contract.md`
- **Current teaching sources:** bilingual S03 sources under
  `teaching/courses/03-generative-ai-prompt-engineering-basics/`
- **Purpose of this audit:** identify what should be preserved, strengthened, compressed, or
  deferred before the S03 bilingual content contract is refactored.

## 1. Session role in the fused curriculum

S01 answers:

> What is AI, and what should I realistically expect from it?

S02 answers:

> What can I actually do with generative AI professionally?

S03 should answer:

> How do I communicate effectively with an AI system?

S03 therefore moves the learner from recognizing a useful generative-AI task to expressing that
task in a form that can be executed, reviewed, improved, and reused.

Its primary job is not to teach prompt tricks.

Its primary job is to teach a professional method for translating a work need into an instruction
that makes the expected result and its evaluation clearer.

The intended progression is:

```text
WORK RESULT
    ↓
PROMPT STRUCTURE
    ↓
DRAFT
    ↓
EVALUATE
    ↓
REFINE
    ↓
REUSE OR ADAPT
    ↓
HUMAN REVIEW
```

The technique progression remains:

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

## 2. Source and authority boundary

The S03 fusion uses the same three-layer authority model as the parent curriculum.

### 2.1 Canonical IBM/Coursera source

The canonical Course 03 notes remain authoritative for concepts adapted from IBM's
**Generative AI: Prompt Engineering Basics** course within the **AI Foundations for Everyone**
Specialization delivered through Coursera.

Concepts that should remain traceable to the canonical modules include:

- prompt engineering fundamentals;
- task, context, input data, and output requirements;
- zero-shot prompting;
- one-shot and few-shot prompting;
- iterative refinement;
- examples inside prompts;
- interview-style prompting;
- task decomposition;
- alternative formulations;
- evaluation of generated outputs;
- multimodal prompting;
- source-constrained prompting;
- explicit human review.

The teaching session may select, simplify, reorder, contextualize, and combine these concepts
without changing their meaning.

### 2.2 Collaborative professional-practice input

The colleague-supplied manuscript
_Cours complet : Utiliser l’intelligence artificielle dans la vie professionnelle_
contributes a practical prompt framework with seven possible elements:

1. role;
2. task;
3. context;
4. audience;
5. format;
6. constraints;
7. quality criteria.

It also contributes professional-use principles including:

- the first result is a draft;
- refine a result after observing a concrete gap;
- identify missing information instead of inventing it;
- preserve facts during rewriting;
- separate facts from recommendations when appropriate;
- create reusable prompt templates for repeated tasks;
- review reusable templates when the context changes;
- test and improve a prompt from the result obtained.

These contributions are curriculum-design input, not automatically IBM/Coursera source material.

The colleague-supplied manuscript remains outside the repository unless its distribution is
explicitly authorized.

### 2.3 Repository adaptation

The S03 teaching session remains an independent repository adaptation generated with AI and subject
to human review.

The adaptation should combine:

```text
CANONICAL PROMPTING CONCEPTS
            +
PRACTICAL PROMPT STRUCTURE
            +
PROFESSIONAL WORK TASKS
            +
ITERATION
            +
OUTPUT EVALUATION
            +
HUMAN RESPONSIBILITY
```

## 3. What the current S03 already does well

The current 25-slide S03 has a strong instructional foundation.

### Source-constrained prompting

The session uses the same deliberately small fictional source introduced in S02:

- lot identifier;
- date;
- weight;
- incomplete records marked for completion;
- staff review.

This creates an objective basis for checking generated claims.

The source should remain.

### Prompt as task plus context

The current session correctly teaches that a prompt can contain:

- a task;
- context;
- input data;
- output requirements.

This should remain as the conceptual bridge between the canonical course and the professional
framework.

### Vague versus structured request

The current contrast between:

```text
Write a message about lot intake.
```

and a source-bounded request is useful.

It makes missing context observable before introducing more advanced techniques.

### Prompt precision versus truth

The current session repeatedly teaches that a better prompt does not guarantee a correct answer.

This distinction is essential and should remain explicit.

### Zero-shot and few-shot

The current treatment correctly distinguishes:

- a request with no example;
- a request containing examples.

It also avoids implying that zero-shot or few-shot changes model training.

This should remain.

### Interview prompting

The current session introduces the useful pattern:

```text
MISSING CONTEXT
    ↓
ASK
    ↓
CONFIRM
    ↓
DRAFT FROM CONFIRMED INFORMATION
```

The instruction to preserve an unknown as unknown is especially valuable.

This should remain.

### Task decomposition

The current session breaks the fictional task into observable operations rather than implying
access to hidden internal reasoning.

That boundary should remain.

### Alternative formulations and evaluation

The current session asks learners to compare versions against explicit criteria.

This should remain and become more professional by tying comparison to predefined quality criteria.

### Deliberately unsupported output

The invented certification-within-24-hours sentence provides a concrete failure that learners can
detect and revise.

This should remain.

### Human approval

The current session consistently keeps lot, payment, certification, publication, and other
consequential decisions with authorized people.

This should remain explicit.

### Multimodal prompting

The final multimodal example usefully shows that a new input modality does not remove the need to
verify what was extracted or inferred.

This should remain concise.

## 4. Main fusion gap

The current S03 teaches prompt-engineering techniques effectively, but its central prompt framework
is not yet aligned with the professional curriculum.

The current session presents six teaching cues:

```text
TASK
AUDIENCE
SOURCE
CONSTRAINTS
FORMAT
HUMAN REVIEW
```

The fused curriculum requires learners to encounter the practical seven-element framework early:

```text
ROLE
TASK
CONTEXT
AUDIENCE
FORMAT
CONSTRAINTS
QUALITY CRITERIA
```

Human review remains essential, but it is not one of the seven prompt elements.

It belongs to the broader professional workflow:

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

S03 should therefore distinguish:

```text
PROMPT DESIGN
```

from:

```text
PROFESSIONAL USE OF THE RESULT
```

A well-structured prompt may improve clarity while the result still requires verification and
authorization.

## 5. Professional elements to strengthen

### 5.1 Begin with the result the person needs

Prompt design should start from:

```text
WHAT RESULT DO I NEED?
```

not:

```text
WHAT MAGIC WORDS SHOULD I TYPE?
```

The first minutes should preserve the S02 transition:

```text
WORK NEED
    ↓
EXPECTED RESULT
    ↓
PROMPT
```

### 5.2 Introduce the seven-element framework early

The framework should appear before zero-shot, few-shot, interview prompting, decomposition, or
other named techniques.

The seven elements are:

```text
ROLE
TASK
CONTEXT
AUDIENCE
FORMAT
CONSTRAINTS
QUALITY CRITERIA
```

Not every prompt needs every element.

The framework is a checklist for thinking, not a mandatory syntax.

### 5.3 Clarify context versus source

The current session often uses "source" as a teaching cue.

The fused session should clarify that:

```text
CONTEXT
```

may include:

- relevant facts;
- background;
- approved source information;
- constraints;
- known unknowns.

A source-constrained task is therefore a specific form of context-rich prompting.

The Soubré exercise continues to use an explicit source because it makes verification observable.

### 5.4 Make quality criteria explicit

Quality criteria should be defined before comparing outputs where possible.

Examples include:

- factual support;
- completeness;
- clarity;
- tone;
- length;
- audience fit;
- required structure;
- preservation of supplied facts.

This gives the learner something more concrete than:

```text
Make it better.
```

### 5.5 Preserve role without overstating it

The existing warning remains useful:

```text
ROLE ≠ AUTHORITY
```

A role can guide:

- perspective;
- vocabulary;
- focus;
- tone.

It does not grant:

- organizational authority;
- regulatory authority;
- access rights;
- factual knowledge that was not supplied.

### 5.6 Teach iteration as targeted correction

Iteration should not mean:

```text
Keep regenerating until I like it.
```

It should mean:

```text
OBSERVE A GAP
    ↓
NAME THE GAP
    ↓
CHANGE THE INSTRUCTION
    ↓
RECHECK
```

Examples:

- shorten without removing decisions;
- change tone without changing facts;
- expose missing information;
- remove an unsupported claim;
- follow the requested format.

### 5.7 Make technique selection purposeful

Named prompting techniques should answer specific problems.

```text
TASK IS CLEAR
    ↓
DIRECT REQUEST
```

```text
FORMAT IS HARD TO DESCRIBE
    ↓
EXAMPLE
```

```text
IMPORTANT CONTEXT IS MISSING
    ↓
INTERVIEW / QUESTIONS
```

```text
TASK HAS DISTINCT CHECKABLE OPERATIONS
    ↓
DECOMPOSITION
```

Technique names should follow the professional problem they solve.

### 5.8 Add reusable prompt templates

A useful professional prompt is often reused.

S03 should teach learners to convert a validated prompt into a template with replaceable fields.

Example structure:

```text
ROLE: [optional role]
TASK: [task]
CONTEXT: [approved information]
AUDIENCE: [audience]
FORMAT: [format]
CONSTRAINTS: [constraints]
QUALITY: [acceptance criteria]
```

A reusable template must still be reviewed when:

- the audience changes;
- the source changes;
- the task changes;
- organizational rules change;
- the required result changes.

Reuse does not remove judgment.

### 5.9 Broaden professional transfer beyond Soubré

The cooperative remains the anchor case, but the framework should visibly transfer to tasks such as:

- drafting an email;
- preparing a meeting summary;
- structuring a report;
- creating a presentation outline;
- preparing customer communication;
- organizing project information;
- producing an operational checklist.

The learner should see that the framework is portable even when the source and output change.

### 5.10 Keep safety visible without teaching S06 early

S03 should reinforce that prompt quality does not authorize information sharing.

Exercises should use only:

- fictional information;
- anonymized information;
- public information;
- explicitly authorized information.

Detailed security and privacy governance remains S06.

### 5.11 Evaluate the prompt and the answer separately

Two questions must remain distinct:

```text
IS THE PROMPT WELL FRAMED?
```

and:

```text
IS THE ANSWER ACCEPTABLE?
```

A well-designed prompt can still produce an unacceptable answer.

A weak prompt may occasionally produce a useful answer by chance.

Professional use requires evaluation of the result.

## 6. Content to preserve but compress

### Terminology

Keep:

- prompt;
- zero-shot;
- one-shot/few-shot;
- interview prompting;
- decomposition;
- multimodal prompting.

Avoid spending excessive time on terminology when the learner can demonstrate the method.

### Repeated warnings

The source-grounding and human-approval warnings remain essential, but they do not need identical
wording on every slide.

Use repetition strategically.

### Cocoa-specific detail

The intake source remains useful for practice, but some explanation can move into presenter notes
once the facts are established.

The lesson should increasingly focus on the reusable prompting method.

## 7. Content to defer

S03 should not absorb later sessions.

### Defer to S04

Detailed work with:

- long documents;
- source comparison;
- summarization against multiple sources;
- extraction;
- evidence tracking;
- conflicting information.

### Defer to S05

Detailed workflow design:

- process mapping;
- repeated operational steps;
- tool handoffs;
- human checkpoints across a workflow;
- value measurement across the process.

### Defer to S06

Detailed:

- confidentiality;
- privacy;
- organizational authorization;
- security;
- sensitive-data policy;
- consequential-decision governance.

### Defer to S07

Full end-to-end professional application and capstone.

## 8. Proposed 25-slide professional sequence

The 25-slide and 60-minute envelope should remain unchanged.

### S03-01 — Designing Effective Prompts

**Action:** retitle.

Purpose:

- establish professional-curriculum identity;
- connect directly to S02;
- retain source attribution and AI disclosure.

### S03-02 — What you will be able to do

**Action:** strengthen.

Learners should leave able to:

- structure a prompt;
- choose an appropriate technique;
- refine against an observed gap;
- evaluate the output;
- turn a useful prompt into a reusable starting point.

### S03-03 — Better prompt does not mean true answer

**Action:** preserve and sharpen.

Keep the unsupported 24-hour certification example from S02.

Primary lesson:

```text
PROMPT QUALITY ≠ FACTUAL GUARANTEE
```

### S03-04 — Keep the source visible

**Action:** preserve.

Keep the fictional intake instruction as the bounded source used to verify outputs.

Also reinforce:

- no real records;
- unknown remains unknown;
- no additional business rule may be inferred.

### S03-05 — Prompt as a professional work instruction

**Action:** refactor slightly.

Preserve:

```text
TASK + CONTEXT + INPUT + OUTPUT REQUIREMENTS
```

but place it in the complete loop:

```text
RESULT
    ↓
PROMPT
    ↓
DRAFT
    ↓
CHECK
    ↓
REFINE OR APPROVE
```

The existing workflow visual should remain broadly compatible.

### S03-06 — A weak request leaves decisions unstated

**Action:** preserve.

Keep the vague request.

Ask learners to identify what is missing before introducing the framework.

### S03-07 — Seven elements for a useful prompt

**Action:** major professional-fusion change.

Introduce:

```text
ROLE
TASK
CONTEXT
AUDIENCE
FORMAT
CONSTRAINTS
QUALITY CRITERIA
```

Important note:

> Not every prompt requires all seven.

The slide should remain visually concise even if the presenter notes explain each element.

### S03-08 — Build one structured prompt

**Action:** adapt.

Keep the real ChatGPT capture and source-grounded prompt.

Use it to identify the seven elements that are present and those that are unnecessary.

Do not imply that every element must appear.

### S03-09 — Same framework, different professional work

**Action:** broaden.

Show transfer examples such as:

- email;
- meeting summary;
- report;
- presentation outline.

Emphasize that audience, format, context, constraints, and quality criteria change with the work.

### S03-10 — Role guides; it does not grant authority

**Action:** preserve.

Keep the distinction between:

```text
PERSONA / PERSPECTIVE
```

and:

```text
REAL PROFESSIONAL AUTHORITY
```

### S03-11 — Improve from an observed gap

**Action:** strengthen.

Preserve the iteration loop.

Make correction targeted:

```text
CHECK
    ↓
NAME THE GAP
    ↓
REFINE
    ↓
RECHECK
```

### S03-12 — Direct request: zero-shot

**Action:** preserve and compress.

Explain the technique only after the learner understands when it is useful.

### S03-13 — Examples: one-shot and few-shot

**Action:** preserve.

Keep fictional examples.

Make explicit:

- examples demonstrate desired behavior or format;
- examples must themselves be checked;
- examples do not create new business facts.

The existing example simulation should remain useful.

### S03-14 — Choose the technique for the problem

**Action:** preserve and sharpen.

Use:

```text
CLEAR TASK → DIRECT REQUEST
UNCLEAR FORMAT → EXAMPLE
MISSING CONTEXT → ASK
```

The existing decision visual is already closely aligned.

### S03-15 — Ask before inventing

**Action:** preserve.

Interview prompting should be framed as a response to missing context.

### S03-16 — One question at a time

**Action:** preserve.

Keep the real opening-question capture.

Continue to teach:

```text
UNKNOWN → UNKNOWN
```

rather than:

```text
UNKNOWN → GUESS
```

### S03-17 — Decompose into observable operations

**Action:** preserve.

Keep the distinction between:

- observable work steps;
- private internal reasoning.

The existing steps visual should remain broadly compatible.

### S03-18 — Compare before you reuse

**Action:** strengthen.

Compare alternatives against predefined criteria such as:

- factual support;
- clarity;
- audience fit;
- format;
- constraints.

Then introduce the idea:

```text
VALIDATED VERSION
    ↓
REUSABLE STARTING TEMPLATE
```

Do not imply permanent validity.

### S03-19 — Detect the unsupported claim

**Action:** preserve.

Keep the deliberately unsupported certification/deadline example.

### S03-20 — Correct the specific failure

**Action:** preserve.

Require a targeted revision rather than a generic request to "improve" the answer.

### S03-21 — Build a reusable professional prompt

**Action:** strengthen the existing activity.

Learners define:

- role if useful;
- task;
- context/source;
- audience;
- format;
- constraints;
- quality criteria.

They may represent variable information using placeholders.

They also identify:

- one unknown;
- one verification step;
- the responsible reviewer.

### S03-22 — Critique another prompt

**Action:** strengthen.

Peer review should identify one concrete missing or weak element and propose a targeted correction.

Critique should focus on the task, not the person.

### S03-23 — Evaluate the answer separately

**Action:** strengthen.

The answer should pass checks for:

- factual support;
- audience and format;
- visible unknowns;
- quality criteria;
- responsible human review.

The existing verification visual should be retained or adapted only if necessary.

### S03-24 — Same method with image or document input

**Action:** preserve.

Multimodal input changes the source type, not the professional method.

The model may still:

- misread;
- omit;
- infer;
- fabricate.

A person still checks before use.

### S03-25 — Prompting is part of the professional method

**Action:** refactor conclusion.

End with the program-wide operating framework:

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

S03 owns the **INSTRUCTION** layer in depth but should show how it connects to the larger method.

Transition toward S04:

> Working with documents and information requires the same prompt discipline plus stronger
> source-grounding and verification.

## 9. Timing contract

The current timing envelope should remain unchanged.

| Slide     | Minutes |
| --------- | ------: |
| S03-01    |       1 |
| S03-02    |       2 |
| S03-03    |       2 |
| S03-04    |       2 |
| S03-05    |       3 |
| S03-06    |       2 |
| S03-07    |       3 |
| S03-08    |       2 |
| S03-09    |       3 |
| S03-10    |       2 |
| S03-11    |       3 |
| S03-12    |       2 |
| S03-13    |       2 |
| S03-14    |       3 |
| S03-15    |       2 |
| S03-16    |       2 |
| S03-17    |       2 |
| S03-18    |       3 |
| S03-19    |       4 |
| S03-20    |       3 |
| S03-21    |       4 |
| S03-22    |       3 |
| S03-23    |       2 |
| S03-24    |       2 |
| S03-25    |       1 |
| **Total** |  **60** |

The existing sequence totals remain:

```text
S03-01..04 = 7 minutes
S03-05..10 = 15 minutes
S03-11..16 = 14 minutes
S03-17..20 = 12 minutes
S03-21..25 = 12 minutes
```

## 10. Existing visual-impact assessment

The current S03 visual system contains nine mapped visual slides.

### S03-05 — workflow Mermaid

Current role:

```text
TASK + SOURCE
    ↓
GROUNDED PROMPT
    ↓
DRAFT
    ↓
CHECK
    ↓
APPROVAL
```

**Expected treatment:** preserve or make only a small semantic adjustment if the revised wording
requires it.

### S03-08 — real ChatGPT capture

Current role:

- real ChatGPT exchange;
- fictional cooperative source;
- structured source-grounded prompt.

**Expected treatment:** preserve.

The revised teaching notes should use the capture to identify practical prompt elements without
claiming that every one of the seven elements is required.

### S03-13 — example simulation

Current role:

- fictional input/output examples.

**Expected treatment:** preserve.

### S03-14 — technique-selection Mermaid

Current role:

```text
FACTS AVAILABLE?
FORMAT CLEAR?
ASK / DIRECT REQUEST / EXAMPLE
```

**Expected treatment:** preserve.

It already aligns strongly with the desired professional decision model.

### S03-16 — interview capture

Current role:

- real ChatGPT opening question;
- fictional cocoa-cooperative exercise.

**Expected treatment:** preserve.

### S03-17 — decomposition Mermaid

Current role:

```text
RECORD
    ↓
FLAG GAPS
    ↓
DRAFT
    ↓
STAFF REVIEW
    ↓
HUMAN DECISION
```

**Expected treatment:** preserve or generalize only if necessary.

### S03-19 — unsupported-output simulation

Current role:

- deliberately unsupported certification and deadline.

**Expected treatment:** preserve.

### S03-20 — revision simulation

Current role:

- targeted correction;
- revised fictional draft.

**Expected treatment:** preserve.

### S03-23 — verification Mermaid

Current role:

```text
FACTS
    ↓
AUDIENCE + FORMAT
    ↓
UNKNOWNS
    ↓
REVIEWER
    ↓
HUMAN REVIEW
```

**Expected treatment:** preserve or extend only if necessary to reflect quality criteria.

No visual should be regenerated merely because surrounding wording changes.

## 11. Animation impact

The current S03 animation plan is derived from the maintained teaching sources.

Current baseline:

```text
25 animated slides
52 clicks
155 shape effects
```

These counts are **not** a fixed curriculum requirement.

If the professional-fusion refactor changes the number of projected rows, the expected animation
counts must be recalculated from the updated sources and the test expectation updated accordingly.

The required invariants are:

- 25 slides;
- 60 minutes;
- bilingual structural alignment;
- animation content matching the maintained sources;
- no extra teaching content introduced only by animation.

## 12. Professional prompt model

The core S03 model should become:

```text
RESULT NEEDED
    ↓
ROLE?              optional where useful
TASK
CONTEXT
AUDIENCE
FORMAT
CONSTRAINTS
QUALITY CRITERIA
    ↓
DRAFT
    ↓
EVALUATE
    ↓
REFINE
    ↓
VERIFY
    ↓
HUMAN USE / APPROVAL
```

The seven prompt elements sit inside a larger professional process.

This distinction matters because:

```text
GOOD PROMPT
```

does not automatically mean:

```text
GOOD ANSWER
```

and:

```text
GOOD ANSWER
```

does not automatically mean:

```text
AUTHORIZED TO USE
```

## 13. Reusable-template model

For repeated work, learners should understand the difference between:

```text
ONE-OFF PROMPT
```

and:

```text
REUSABLE PROMPT TEMPLATE
```

A reusable template may contain placeholders such as:

```text
ROLE: [role if useful]
TASK: [task]
CONTEXT: [approved facts or source]
AUDIENCE: [audience]
FORMAT: [format]
CONSTRAINTS: [limits]
QUALITY: [acceptance criteria]
```

Before reuse, the person still checks:

```text
IS THE SOURCE CURRENT?
IS THE AUDIENCE THE SAME?
ARE THE CONSTRAINTS STILL VALID?
ARE THE QUALITY CRITERIA STILL APPROPRIATE?
IS THE INFORMATION AUTHORIZED FOR THIS TOOL?
```

S03 introduces reuse.

S05 will later place reusable prompts inside a full workflow.

## 14. Professional transfer requirement

The Soubré case remains the common exercise because it provides a source small enough to verify.

However, the instructor should explicitly transfer the prompt framework to other work.

At minimum, the session should mention examples such as:

```text
EMAIL
MEETING SUMMARY
REPORT
PRESENTATION OUTLINE
CUSTOMER RESPONSE
PROJECT UPDATE
OPERATIONAL CHECKLIST
```

The transfer question is:

> Which elements of the prompt change when the work, audience, or source changes?

This is more valuable than memorizing one cooperative prompt.

## 15. Scope boundaries

S03 must not imply:

- a precise prompt guarantees truth;
- adding a role gives authority;
- an example is automatically correct;
- asking the model to verify itself is independent verification;
- decomposition reveals private model reasoning;
- repeated generation produces evidence;
- a reusable prompt remains valid forever;
- a multimodal input proves authenticity;
- an AI-generated recommendation authorizes a professional decision.

S03 may teach how to improve instructions.

It must preserve the distinction between instruction quality and evidence quality.

## 16. Acceptance criteria for the future refactor

The S03 fusion should be considered correctly implemented when:

1. both languages retain exactly 25 slides;
2. both languages retain exactly 60 minutes;
3. slide identifiers and durations remain aligned;
4. the public session title aligns with the professional curriculum;
5. Slide 01 retains IBM/Coursera attribution and AI-generation disclosure;
6. the seven-element practical prompt framework appears early;
7. the framework is presented as optional components rather than mandatory syntax;
8. the session distinguishes prompt design from output verification;
9. source-constrained prompting remains central to the Soubré exercise;
10. zero-shot and few-shot techniques remain conceptually correct;
11. interview prompting preserves unknown information as unknown;
12. decomposition remains limited to observable work steps;
13. alternative formulations are compared using explicit criteria;
14. iteration is tied to an observed gap;
15. reusable prompt templates are introduced;
16. at least one transfer example goes beyond the cooperative;
17. fictional, anonymized, public, or authorized information remains the activity boundary;
18. consequential approval remains human;
19. existing visuals are reused unless their semantics no longer match;
20. animation counts are recalculated from the updated sources rather than copied from the old plan;
21. PDF and PPTX derivatives are rebuilt and independently verified;
22. PDF visual QA is completed;
23. both animated PowerPoint decks receive human review;
24. the 60-minute delivery receives a timed rehearsal;
25. Course 03 French canonical review remains explicitly documented if still pending.

## 17. Implementation order

The recommended sequence is:

```text
S03 FUSION AUDIT
        ↓
S03 BILINGUAL CONTENT CONTRACT
        ↓
EN / FR TEACHING SOURCES
        ↓
VISUAL SEMANTIC AUDIT
        ↓
VISUAL UPDATES ONLY IF REQUIRED
        ↓
ANIMATION EXPECTATION UPDATE IF REQUIRED
        ↓
SOURCE / PRESENTATION TESTS
        ↓
PRODUCTION DOCUMENTATION
        ↓
FULL REPOSITORY GATE
        ↓
PDF + STATIC PPTX
        ↓
VERIFY
        ↓
PDF VISUAL QA
        ↓
ANIMATED PPTX
        ↓
BILINGUAL HUMAN POWERPOINT REVIEW
        ↓
TIMED REHEARSAL
        ↓
FINAL DOCUMENTATION CLOSEOUT
        ↓
MERGE
```

## 18. Audit conclusion

S03 should be **refactored, not replaced**.

Its current strengths are substantial:

- source-constrained prompting;
- direct and example-based prompting;
- interview prompting;
- decomposition;
- iteration;
- alternative comparison;
- deliberate error detection;
- targeted correction;
- multimodal input;
- human approval.

The professional fusion should primarily change the instructional center of gravity from:

```text
A COLLECTION OF PROMPTING TECHNIQUES
```

to:

```text
DEFINE THE RESULT
        ↓
STRUCTURE THE INSTRUCTION
        ↓
CHOOSE A TECHNIQUE FOR A REASON
        ↓
EVALUATE THE DRAFT
        ↓
REFINE THE OBSERVED GAP
        ↓
REUSE WHEN APPROPRIATE
        ↓
VERIFY BEFORE PROFESSIONAL USE
```

That preserves the canonical Course 03 concepts while making the session more reusable in ordinary
professional work and more consistent with the full AI for Everyone professional curriculum.
