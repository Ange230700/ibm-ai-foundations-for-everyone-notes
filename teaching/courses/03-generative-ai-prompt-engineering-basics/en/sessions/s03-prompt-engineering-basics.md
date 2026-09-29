# S03 — Prompt Engineering Basics

## Teaching metadata

- **Program:** AI Foundations for Everyone
- **Session:** S03 — Prompt Engineering Basics
- **Language:** English
- **Audience:** Professionals and learners with no technical prerequisite
- **Duration:** 60 minutes
- **Number of slides:** 25
- **Case study:** an unnamed, fictional cocoa cooperative near Soubré
- **Status:** English teaching draft; the Course 03 French canonical adaptations still await personal review
- **Bilingual contract:** `docs/teaching/s03-prompt-engineering-60-min-content-contract.md`

## Canonical sources

- `courses/03-generative-ai-prompt-engineering-basics/en/01-prompt-engineering-for-generative-ai.md`
- `courses/03-generative-ai-prompt-engineering-basics/en/02-prompt-engineering-techniques-and-approaches.md`
- `courses/03-generative-ai-prompt-engineering-basics/en/03-course-quiz-project-and-wrap-up.md`

## Session objective

Design a request from a defined source, choose a method that fits the available context, review
a draft against the supplied facts, and refer approval to an authorized person. This session can
be delivered without a model account or a live connection.

## Facilitation principles

1. Project one main idea per slide; keep explanations and questions in the teaching notes.
2. Identify the cooperative, exercise instruction, and constructed responses as teaching simulations.
3. Keep the S03-04 source available; infer no deadline, threshold, certification, or payment rule.
4. Fit short oral exchanges and the pair exercise into 60 minutes without requiring a live model.
5. Distinguish a more specific prompt from a factual answer; human review remains essential.
6. Rehearse with a timer, and review the Course 03 French adaptations before final release.

## Slide 01 — S03: designing a prompt that can be checked

- **Identifier:** S03-01
- **Duration:** 1 minute

### Slide Role

course-title

### On-Slide Content

S03: 60-minute session

- Fictional case: a cocoa cooperative near Soubré
- Common task: a notice for intake staff

### Teaching Notes

**Key takeaway:** A precise request prepares a reviewable draft, never an automatic decision.

Welcome learners and connect S03 to the drafts from S02. Say that the cooperative, any screens, and the exercise responses are fictional. A staff notice will still need approval before anyone shares it.

## Slide 02 — Four moves for this session

- **Identifier:** S03-02
- **Duration:** 2 minutes

### Slide Role

course-objectives

### On-Slide Content

- Frame the request and its source
- Choose: direct, example, or questions
- Check facts and unknowns
- Revise and submit for approval

### Teaching Notes

**Key takeaway:** Frame, choose a method, check, and revise: these are the four moves for today.

Introduce the outcomes as actions participants will practice. Ask which move is lost when a draft is shared immediately after generation. Explain that the exercise works on paper without a model service.

## Slide 03 — A plausible sentence, an unsupported claim

- **Identifier:** S03-03
- **Duration:** 2 minutes

### On-Slide Content

- S02: “certified within 24 hours” was written for a teaching exercise
- The supplied source did not support that promise
- Where should we look for evidence before reusing a draft?

### Teaching Notes

**Key takeaway:** A fluent response may still add an unsupported claim.

Recall the deliberately wrong line in S02-12 and invite learners to identify the gap. The deadline and certification claim were a constructed counterexample, not a real policy or an observed model output. A better prompt can reduce ambiguity but cannot guarantee accuracy.

## Slide 04 — A short instruction with clear boundaries

- **Identifier:** S03-04
- **Duration:** 2 minutes

### On-Slide Content

- Teaching simulation: record lot ID, date, and weight
- Missing field: mark “needs completion,” then request staff review
- No other rule is supplied

### Teaching Notes

**Key takeaway:** This fictional instruction is the only factual source for the staff notice.

Read all three lines and keep them visible or accessible for the exercise. These are the same invented facts used in S02-10, not a real cooperative procedure. Point out that no threshold, deadline, payment, grade, or certification rule has been supplied.

## Slide 05 — From task to proposed response

- **Identifier:** S03-05
- **Duration:** 3 minutes

### On-Slide Content

- Task and context
- Input data and output requirements
- Proposal → review → refinement

### Teaching Notes

**Key takeaway:** A prompt supplies a request and enough information to review what comes back.

Connect the rows to module 03.01: instruction, context, input data, and output indicators. Ask which part of S03-04 counts as input data. A new prompt changes the context for this generation; it does not retrain the model.

## Slide 06 — “Write a message” leaves gaps

- **Identifier:** S03-06
- **Duration:** 2 minutes

### On-Slide Content

- Starting prompt: “Write a message about lot intake.”
- Missing: audience, source, and format
- What needs clarifying before drafting?

### Teaching Notes

**Key takeaway:** A vague request leaves both the facts and the audience unspecified.

Ask the group to name the three gaps without imagining a model output. This prompt was constructed for the session. Use their answers to introduce the six practical cues on the next slide.

## Slide 07 — Six elements to frame the request

- **Identifier:** S03-07
- **Duration:** 3 minutes

### On-Slide Content

- Task and audience
- Source and constraints
- Format and human review

### Teaching Notes

**Key takeaway:** An explicit frame makes the proposed answer easier to check.

Map these six cues back to the four prompt components on S03-05. Ask where to place the rule about a missing field. This is a teaching checklist for our example, not a formula that works for every model and task.

## Slide 08 — A request grounded in the source

- **Identifier:** S03-08
- **Duration:** 2 minutes

### On-Slide Content

- “Write a short notice for intake staff.”
- “Use only S03-04: the three fields and staff review.”
- “Invent no threshold or certification rule.”

### Teaching Notes

**Key takeaway:** A structured prompt names the task, audience, source, and boundaries.

Show the capture of a real ChatGPT exchange using the fictional S03-04 instruction. Read the three lines as one example prompt and ask which line restricts the facts. Check that the reply includes the three fields, “needs completion” status, and staff review without adding another rule. This is a new teaching adaptation, not a verbatim quotation from the recorded course or a guarantee of compliance. A person must still compare the draft with the source before use.

## Slide 09 — A notice people can read

- **Identifier:** S03-09
- **Duration:** 3 minutes

### On-Slide Content

- Audience: intake staff
- Tone: plain, respectful English
- Format: two sentences, including what to do if a field is missing

### Teaching Notes

**Key takeaway:** A defined audience and short format make a notice easier to use and review.

Ask learners to simplify one term for a different audience without changing the instruction. Briefly compare an internal staff notice with an explanation for member producers. Two well-shaped sentences could still contain an invented rule.

## Slide 10 — A role guides; it does not certify

- **Identifier:** S03-10
- **Duration:** 2 minutes

### On-Slide Content

- Suggested persona: drafting assistant
- Actual task: prepare a draft
- Actual decision: authorized staff and procedure owner

### Teaching Notes

**Key takeaway:** Assigning a role can frame a response; it does not grant authority.

Explain why “assist the team” grants neither regulatory competence nor access to actual records. Do not delegate crop diagnosis, lot acceptance, or payment decisions. A draft needs the same review regardless of the persona used.

## Slide 11 — Review before rewriting

- **Identifier:** S03-11
- **Duration:** 3 minutes

### On-Slide Content

- Prompt → draft
- Review: facts, audience, and format
- Found gap → targeted change → new review

### Teaching Notes

**Key takeaway:** Iteration should address a gap found against the source or intended use.

Use the invented certification claim from S02 as a specific gap. Ask what to remove and what to check when reading the next version. Retesting the request is not the same as approval by the procedure owner.

## Slide 12 — Zero-shot: the task without a demonstration

- **Identifier:** S03-12
- **Duration:** 2 minutes

### On-Slide Content

- “Using S03-04, list the intake-record fields.”
- No input → output example in this prompt
- Check the answer against S03-04

### Teaching Notes

**Key takeaway:** Zero-shot means the current prompt supplies no sample answer.

Ask learners to name the three expected fields before showing their answers. This term does not mean the model has never been trained. A direct request may fit a simple task, but its result still needs checking.

## Slide 13 — Few-shot: show the format

- **Identifier:** S03-13
- **Duration:** 2 minutes

### On-Slide Content

- EX-01, date missing → “needs completion: date”
- EX-02, weight missing → “needs completion: weight”
- EX-03, ID missing → ?

### Teaching Notes

**Key takeaway:** A few fictional examples can illustrate the desired output structure.

Show the first two pairs and ask learners to complete EX-03: “needs completion: lot ID.” The EX records were made for this exercise and prove nothing about an actual delivery. Examples in a prompt do not update model weights.

## Slide 14 — Add an example for a reason

- **Identifier:** S03-14
- **Duration:** 3 minutes

### On-Slide Content

- Clear task → direct request
- Hard-to-describe format → verified fictional example
- Missing facts → questions before drafting

### Teaching Notes

**Key takeaway:** Choose a prompting method to address what is missing from the task.

Ask which method fits the staff notice and which fits a record that does not identify the missing field. A flawed example can pass an invented rule into a new answer. Questions help reveal the information gap in the second situation.

## Slide 15 — Interview: ask before inventing

- **Identifier:** S03-15
- **Duration:** 2 minutes

### On-Slide Content

- Who is the audience?
- Which field is missing from the fictional record?
- Which approved instruction may I use?

### Teaching Notes

**Key takeaway:** Focused questions gather missing context before a notice is drafted.

Role-play these questions with a volunteer. An answer of “I do not know” remains unknown; do not infer a value from an example. Ask for no actual member data during the role-play.

## Slide 16 — Build an interview request

- **Identifier:** S03-16
- **Duration:** 2 minutes

### On-Slide Content

- “Ask one question at a time.”
- “Mark unavailable answers as unknown.”
- “Summarize confirmed facts before drafting.”

### Teaching Notes

**Key takeaway:** An interview separates confirmed answers from missing information.

The capture shows the request and ChatGPT’s first question, not an answer. Reply “I do not know” aloud, then separate confirmed facts from the unknown field. The notice should stay general or await verification instead of naming a specific missing field. An interview collects context; it does not make a model inherently reliable.

## Slide 17 — Split the observable checks

- **Identifier:** S03-17
- **Duration:** 2 minutes

### On-Slide Content

1. List supplied fields
2. Flag missing ones
3. Draft a provisional notice
4. Send it to authorized staff for review

### Teaching Notes

**Key takeaway:** Explicit workflow steps make a complex task easier to inspect.

Ask when the authorized staff member intervenes. These are observable tasks and results, not a request for a model's private reasoning. Each step can fail and requires a check against available evidence.

## Slide 18 — Two phrasings, the same facts

- **Identifier:** S03-18
- **Duration:** 3 minutes

### On-Slide Content

- Option A: note for staff
- Option B: very short reminder
- Compare: accuracy, clarity, tone, length

### Teaching Notes

**Key takeaway:** Compare alternatives using criteria stated before choosing a version.

Ask which criterion rules out a draft that adds an unsupported deadline. A model ranking its own branches or candidate texts is not an independent reviewer. Staff may prefer clearer wording only after the facts check out.

## Slide 19 — Spot the invented claim

- **Identifier:** S03-19
- **Duration:** 4 minutes

### On-Slide Content

- Teaching simulation: “Enter the lot, date, and weight.”
- “Incomplete lots are certified within 24 hours.”
- Which part is absent from S03-04?

### Teaching Notes

**Key takeaway:** Every claim should be traceable to the fictional instruction.

Allow one minute of reading and one minute of pair discussion. The second sentence invents certification and a deadline; the first should say “lot ID.” Ask for a spoken correction before moving to the revision prompt. Do not attribute this constructed counterexample to a live AI service.

## Slide 20 — Revise the specific gap

- **Identifier:** S03-20
- **Duration:** 3 minutes

### On-Slide Content

- “Remove deadline and certification: neither is in S03-04.”
- “Add no new rules. Name the three fields.”
- “If a field is missing, request staff review.”

### Teaching Notes

**Key takeaway:** A useful revision names unsupported facts and asks for another source check.

Have participants propose a new message with the three fields and “needs completion” status. Compare it with S03-04 even when the revision request sounds strict enough. The new text remains a draft until an authorized person approves it.

## Slide 21 — Write a prompt people can revise

- **Identifier:** S03-21
- **Duration:** 4 minutes

### On-Slide Content

- 2 min: write task, audience, source, format, and limits
- 1 min: choose direct, example, or interview
- 1 min: exchange and flag an unknown

### Teaching Notes

**Key takeaway:** Each pair writes a request another person can inspect.

Display or hand out S03-04 and the S03-23 checklist before starting the timer. If no model is available, have pairs write a human-created simulated response for critique. Circulate to catch actual records, invented deadlines, and certification claims.

## Slide 22 — Give useful feedback on a prompt

- **Identifier:** S03-22
- **Duration:** 3 minutes

### On-Slide Content

- Is the source named?
- What happens when a field is missing?
- Does the format fit staff?
- Who approves the notice?

### Teaching Notes

**Key takeaway:** Useful feedback identifies a missing element and a targeted improvement.

Invite two pairs to share one change each. Ask them where they would place it in the prompt; avoid assessing any real intake record. Use the final seconds to introduce the checks that apply to the response itself.

## Slide 23 — The response must pass four checks

- **Identifier:** S03-23
- **Duration:** 2 minutes

### On-Slide Content

- Are the facts in S03-04?
- Do audience and format fit?
- Are unknowns visible?
- Is the human reviewer identified?

### Teaching Notes

**Key takeaway:** Review a well-written prompt and a fluent answer separately.

Ask which check fails when the text promises certification within 24 hours. The procedure owner can approve a notice after review; a model cannot sign off on a lot decision. This checklist also works for a human-written simulated response.

## Slide 24 — Same method, another input

- **Identifier:** S03-24
- **Duration:** 2 minutes

### On-Slide Content

- Supplied photo or document: extract legible fields
- Unreadable → “unknown”
- A person checks before use

### Teaching Notes

**Key takeaway:** A photo or document provides another source to inspect, not automatic evidence.

Briefly connect module 03.02 multimodal prompts and module 03.03 image prompting. A convincing image does not prove that a label is authentic or that a lot is traceable. A full tool demonstration sits outside this hour.

## Slide 25 — Source before phrasing

- **Identifier:** S03-25
- **Duration:** 1 minute

### On-Slide Content

- Need → source → prompt
- Check → correction → human decision

### Teaching Notes

**Key takeaway:** Choose a method, inspect the output, and revise before a person approves anything.

Ask: “Which facts may I use?” Take one short answer, then close without promising universal behavior from a model. A timed rehearsal is still needed to confirm the 60-minute allocation.
