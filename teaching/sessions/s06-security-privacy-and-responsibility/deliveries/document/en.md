# Responsible handling of information in AI-assisted work

## Why accuracy is only one part of responsible use

An AI-assisted draft can be factually accurate and still be unsafe to use. Before information enters a tool, a draft is circulated, or anyone acts on a recommendation, a professional needs to answer three separate questions. Is the claim supported by an appropriate source? Is the information permitted for this tool and purpose? Does the person making or approving the next decision have the authority to do so?

These checks address different risks. Source review can catch invented or distorted claims, but it cannot grant permission to disclose confidential information. Permission to prepare an internal brief does not establish that an external recipient may receive it. A reviewer may identify an error without having authority to approve a payment, storage decision, or other operational action.

The concepts of privacy, fairness, transparency, accountability, human oversight, and continuing risk management are adapted from the canonical IBM course material identified below. The workflow and fictional case in this document are independent teaching adaptations; they do not state IBM policy or describe the controls of any real AI service.

## A three-part decision check

| Check      | Question                                                    | Evidence to look for                                                           |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Evidence   | Is this statement supported, and are its limits preserved?  | A named source, a traceable field, and any stated uncertainty                  |
| Permission | May this information be used in this tool for this purpose? | An applicable rule, an authorized information owner, and an approved recipient |
| Authority  | Who may review, approve, send, or act?                      | A defined role and a recorded decision for the specific action                 |

Keep the checks distinct in records and conversations. A “yes” for one column is not a substitute for the others. If permission is unclear, stop before sharing and consult the information owner. If a restricted item has already been shared, stop further circulation and notify the responsible information owner; do not assume that deleting a copy reverses the exposure.

## Preserve what the source does not say

Consider this fictional exercise packet. Source A records that intake at collection point CP-A paused at 09:10 on 18 October 2026 and resumed at 09:40. It does not state why. Source B records 540 kilograms for lot SB-601. It says that SB-602 has no recorded weight and needs staff review, but does not identify who caused the missing field. Source C records a movement for SB-601 at 12:15 with destination label Area A. It supplies no acceptance, quality, storage-approval, or payment decision.

A careful internal summary could say:

> On 18 October 2026, intake at CP-A paused at 09:10 and resumed at 09:40; the reason is not stated. Source B records 540 kg for SB-601 and identifies a missing weight for SB-602, which requires staff review. Source C records SB-601's movement at 12:15 to Area A, a destination label only. The packet does not establish who caused the missing field or approve a lot, storage, quality, or payment decision.

The wording is deliberately limited. It keeps observations, unknowns, and decisions separate. It does not convert a missing field into blame, a destination into approval, or a plausible explanation into a fact. This is especially important when a fluent generative system can produce details that sound credible but are not supported by the supplied material.

## Protect information throughout the workflow

Data minimization starts with the task: include only information needed for the permitted purpose. Removing a name alone does not guarantee that a person cannot be identified; combinations of location, role, or other details may still point to someone. Confidential business information also deserves protection even when it does not identify an individual. In the exercise, a restricted attachment is excluded in full. Its contents must not be copied into the tool, the brief, or the review record.

Use a controlled sequence rather than treating generation as approval:

1. Define the purpose, the minimum necessary inputs, the permitted tool, and the intended recipients.
2. Exclude restricted or unnecessary information before drafting. Escalate unclear permission before sharing.
3. Check each important statement against the allowed sources. Preserve missing values, uncertainty, and attribution.
4. Have the designated reviewer record corrections and return or stop a draft that is not supported.
5. Obtain the required approval for the specific circulation. Separate approval to circulate a brief from approval of an operational decision.
6. Record unresolved questions and the approval state in the appropriate restricted record; share externally only after a separate explicit decision.

Human review is meaningful only when the reviewer can inspect the evidence, correct or stop the output, and distinguish their review role from the authority to approve the next action. Assigning a person to “check the AI” without time, evidence, or a defined stop option is not an adequate control.

## Governance continues after a draft

Fairness, privacy, transparency, accountability, reliability, and human oversight need attention across an AI system's lifecycle. For a workplace workflow, that means defining responsibilities and permitted uses, checking outputs and impacts, keeping a route for correction, monitoring for new risks, and revising or stopping the process when needed. A successful review of one document is not proof that every later use is safe.

The course material introduces governance and risk-management frameworks, including the NIST AI Risk Management Framework and the EU AI Act, as examples of external references. This teaching document does not assess current legal requirements or decide which rules apply to a particular organization or jurisdiction. Those questions require current, qualified review.

## Attribution and review boundary

The responsible-AI concepts in this document are an authored adaptation of IBM's _AI Foundations for Everyone_ Coursera specialization, Course 01, Module 04, “Issues, Concerns, and Ethical Considerations,” in English and French. The independent professional teaching source is S06, “Security, Privacy, and Responsibility.” The CP-A, lot, and rule examples are fictional teaching material maintained with S06; they are not canonical IBM facts, real cooperative records, or workplace policy. Length, organization, and explanatory examples are intentionally adapted rather than copied from slides or speaker notes.

This document can be checked automatically for source identity, supported Markdown, text integrity, and PDF pagination. Whether the explanations preserve the intended meaning, attribution, and appropriate qualifications still requires human editorial review.
