# S06 Professional Fusion Audit

## Status

- **Session:** S06 — Security, Privacy, and Responsibility / Sécurité, confidentialité et responsabilité
- **Audience:** professionals and learners with no technical prerequisite
- **Curriculum position:** GOVERN
- **Central question:** What information and decisions require stronger boundaries?
- **Operational question:** What may I share, what must I verify, and who may approve its use?
- **Primary contribution:** confidentiality, authorization, verification, and consequential decisions
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Baseline inspected:** `7781287` on `main`
- **Current implementation:** manifest registers S01–S05; S06 is not registered
- **Content contract and teaching sources:** not yet created
- **Duration proposal:** 60 minutes; to be fixed in the content contract
- **Slide count:** not yet fixed
- **Purpose:** establish provenance, scope, inherited knowledge, practical activities, and acceptance
  criteria before creating the bilingual content contract.

## 1. Place in the curriculum

The program progresses through UNDERSTAND, USE, PROMPT, VERIFY, INTEGRATE, GOVERN, and APPLY.

S04 establishes source-grounded information work. S05 places that work within a reusable process.
S06 asks whether the information, tool, recipient, and proposed action are appropriate and authorized.
S07 remains the integrated professional workshop.

S06 should make governance concrete through ordinary choices before sharing information and before
using an output. It should not become an abstract survey of ethical principles.

## 2. Source and authority boundary

Preserve three distinct layers:

1. Canonical IBM/Coursera concepts in repository course notes.
2. Collaborative professional-practice input from the supplied course manuscript.
3. Independent repository teaching adaptations, including fictional rules and exercises.

The supplied manuscript is design input, not an IBM/Coursera source. Do not add the PDF or screenshots
to the repository as part of this audit. No current law, vendor policy, or real cooperative authority
is established by the exercises.

## 3. Primary canonical provenance

### Course 01 / Module 04 — Issues, Concerns, and Ethical Considerations

**Module ID:** `module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`

**English source:**
`courses/01-introduction-to-artificial-intelligence-ai/en/04-issues-concerns-and-ethical-considerations.md`

**French source:**
`courses/01-introduction-to-artificial-intelligence-ai/fr/04-issues-concerns-and-ethical-considerations.md`

This is the primary source for S06. Its relevant sections support the following adaptations:

| Canonical section                        | S06 application                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Data Privacy and Security                | Limit collection and disclosure; recognize that removing a name is insufficient.          |
| Bias and Fairness                        | Question unsupported judgments about people and uneven evidence quality.                  |
| Transparency and Accountability          | Identify evidence, responsible reviewers, and corrective action.                          |
| Human Oversight                          | Match review and approval to the consequences of the action.                              |
| Hallucinations                           | Check important claims; fluent language does not establish truth.                         |
| Private and Confidential AI Use          | Combine tool safeguards with organizational permission.                                   |
| AI Governance                            | Make rules, responsibilities, review, documentation, and incident response explicit.      |
| Continuous Monitoring                    | Record recurring problems and revise controls when needed.                                |
| Establish Guardrails                     | Express practical constraints as observable rules.                                        |
| Practical Application: cocoa cooperative | Separate evidence organization from lot, grade, payment, and official-document decisions. |

The canonical English notes mark this module complete and reviewed. The French adaptation explicitly
retains a pending personal-review status. This audit does not certify that review as completed.

### Other canonical modules

Course 03 / Module 02 explains that prompting does not guarantee accuracy, fairness, or security.
Use that as continuity with S03; do not add its module ID solely for a reminder.

Course 01 / Module 03 and Course 04 / Module 01 support S05's workflow design. They are not selected
for S06 by default. Register another module only if the final teaching source substantially adapts
its material.

## 4. Collaborative manuscript contribution

Module 6 of the supplied manuscript, pages 8–9, provides three practical strands:

- Protect professional information before giving it to a tool.
- Verify important answers and inspect the actual sources behind references.
- Retain human responsibility for professional use and consequential decisions.

Its activity asks learners to identify three items to check, sensitive information to remove, and a
decision requiring human validation. Use this as the minimum observable activity pattern.

Qualify its name-replacement example: a replacement label does not establish that remaining details
cannot identify a person. The canonical module already supports this qualification.

## 5. Knowledge inherited without reteaching

- **S01:** capabilities, limitations, and the human role.
- **S02:** drafting, summarizing, organizing, and other workplace uses.
- **S03:** task, context, audience, format, constraints, and iterative improvement.
- **S04:** source support, missing information, conflicting evidence, and verification.
- **S05:** bounded AI tasks, workflow checkpoints, human action, reuse, and measurement.

S06 adds permission, protection, affected people, decision authority, and escalation. A source can be
accurate yet inappropriate to share; an output can be accurate yet unauthorized for publication.

## 6. Essential teaching boundaries

### Before sharing

Learners should identify the purpose, necessary fields, permitted tool, and applicable exercise or
organizational rules. Permission to access a document is not automatically permission to upload it
or disclose it to another recipient.

Teach removal of unnecessary information before cosmetic replacement. For ambiguous permission,
the exercise response is to pause and consult the named responsible role.

Do not teach that a private, paid, or organization-branded tool automatically authorizes every input.
Do not invent vendor retention, training, or access guarantees.

### Before using

Separate three checks:

1. **Evidence:** Is the statement supported by the supplied source?
2. **Permission:** Is this use and recipient allowed under the stated rules?
3. **Authority:** Who can approve or carry out the proposed action?

Asking the same model to confirm its answer is not independent verification. In a classroom exercise,
provide the source excerpt so learners can check support without requiring live browsing.

### Consequences and fairness

Include at least one unsupported judgment about a person or group. Learners should identify the
missing evidence and potential consequence rather than attempt to repair it with a neutrality prompt.

Meaningful oversight requires a reviewer who can inspect evidence, challenge the result, and stop or
correct its use. A ceremonial approval box is insufficient.

### If something goes wrong

Use an explicitly fictional reporting route: stop further sharing or use, notify the designated
responsible role, and follow the stated response procedure. Do not promise that deleting a chat
reverses disclosure, or invent legal reporting deadlines.

## 7. Proposed anchor case

Continue the fictional cocoa cooperative near Soubré with a review of a daily operations brief.
This extends S05's setting; it does not retroactively modify S05's source facts or rules.

The content contract should supply four labelled components:

1. A fictional source packet containing operational facts and unnecessary identifying details.
2. Fictional rules specifying permitted fields, permitted tool, audience, and responsible roles.
3. A deliberately flawed simulated AI output.
4. A learner decision sheet and facilitator answer key.

Suggested flaws include an unnecessary personal detail, an invented operational explanation, a claim
of approval unsupported by the source, and an unfair judgment based on incomplete records.

Every planted flaw must have an answer-key entry connecting the problem to a supplied source or rule,
its consequence, and the required correction or escalation. Do not ask learners to guess policy.

The task is to prepare an internal operational summary. It does not authorize accepting a lot,
assigning a grade, approving a payment, issuing a certificate, or making a personnel decision.

Any roles and permissions needed for the exercise must be explicitly fictional. Do not invent real
ANADER rules, certification requirements, quality thresholds, or cooperative procedures.

## 8. Observable learner work

Learners should produce:

- a field-by-field decision: retain, remove, replace, or request authorization;
- a task-relevant input that follows the supplied rules;
- at least three verification checks tied to source evidence;
- identification of an unsupported judgment and its possible effect;
- identification of an action requiring human authority;
- a final decision: proceed, revise, or stop and escalate, with a reason.

Do not equate removing a name with permission to proceed. A corrected factual claim does not resolve
a separate permission or authority problem.

## 9. Transfer beyond the cooperative

Use a short meeting-follow-up example: an accurate internal note may contain information unsuitable
for an external recipient. Learners identify what can be included and who approves sending it.

A brief personnel-related example may show why incomplete records do not establish poor performance.
Keep it a fictional evidence-and-authority exercise, not employment or legal advice.

## 10. Reusable decision aid

Propose a compact checklist with two moments:

- **Before sharing:** purpose, necessary information, permission, tool, remaining identifying details.
- **Before using:** source support, affected people, recipient, reviewer, approver, unresolved issues.

Record the decision and responsible role. Carry this aid into the S07 process alongside S05's workflow
canvas. Whether it becomes a separate handout remains a content-contract decision.

## 11. Candidate learning outcomes

By the end of S06, a learner should be able to:

1. identify unnecessary, personal, confidential, or sensitive information in a fictional packet;
2. apply explicit sharing rules to prepare a limited input;
3. explain why replacing a name does not by itself resolve privacy concerns;
4. distinguish factual verification, permitted use, and approval authority;
5. check important claims against actual source material;
6. recognize an unsupported or unfair judgment affecting a person;
7. assign review, approval, and escalation to stated responsible roles;
8. justify proceeding, revising, or stopping using the supplied evidence and rules.

## 12. Proposed timing envelope

| Minutes | Focus                                                              |
| ------- | ------------------------------------------------------------------ |
| 0–5     | S05 bridge and initial risk identification                         |
| 5–17    | Necessary information, privacy, tool permission, and authorization |
| 17–27   | Guided input preparation and remaining identifying details         |
| 27–37   | Claim verification and unsupported judgments                       |
| 37–45   | Authority, meaningful review, and escalation                       |
| 45–57   | Integrated fictional case and justification                        |
| 57–60   | Transfer, reusable checklist, and exit check                       |

This is a 60-minute design proposal, not a completed rehearsal. Final slide allocation and activity
timing belong in the content contract. Preserve practice time if explanatory material grows.

## 13. Exclusions and optional depth

Keep technical security architecture, permissions configuration, adversarial prompting, quantitative
fairness testing, and detailed regulatory analysis outside the core session.

Regulatory compliance is acknowledged through following applicable organizational rules and referring
questions to competent responsible people. Do not present historical course mentions of NIST or the
EU AI Act as current jurisdiction-specific guidance. Any later legal module requires separately
verified authoritative sources.

Copyright, synthetic-media authenticity, access, and environmental impact are broader canonical
themes. Keep them as optional references unless needed for a selected activity; do not dilute the
core information-and-decision boundary lesson with a comprehensive ethics survey.

The full learner-designed end-to-end process and capstone presentation remain S07 work.

## 14. Proposed provenance registration

If the content contract follows this audit, register only:

`module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`

This audit does not add a manifest entry. Reassess provenance against the actual bilingual sources
before registration. The fictional rules, checklist, timing, and assessment design are repository
adaptations, not named frameworks attributed to IBM.

## 15. Acceptance criteria for the content contract

- Preserve the GOVERN role and the established bilingual title.
- Distinguish canonical concepts, manuscript input, and independent adaptations.
- Cover confidentiality, authorization, verification, fairness, and consequential decisions.
- Provide explicit fictional policy, roles, source facts, and a complete answer key.
- Require observable learner choices rather than vocabulary recall alone.
- Include three checkable claims, a sensitive-data issue, and an authority boundary.
- Include an unfair or unsupported judgment and an escalation decision.
- Preserve unknown information and avoid fabricated operational authority.
- Make clear that a good prompt does not guarantee security or fairness.
- Keep simulations usable without a live AI account or confidential workplace documents.
- Align English and French facts, rules, activities, timing, and expected answers.
- Preserve concise visible slides and fuller teaching notes.
- Define timing, slide count, visuals, transfer activity, and checklist delivery explicitly.
- Require repository verification, visual QA, and instructor review before release.

## 16. Next implementation step

Create the S06 bilingual content contract from this audit, fixing the fictional source packet,
exercise rules, answer key, 60-minute sequence, and slide count before writing teaching sources.

The governing outcome is practical: the learner can explain what may enter the AI step, what must
be checked afterward, who may authorize the action, and when the process must stop.
