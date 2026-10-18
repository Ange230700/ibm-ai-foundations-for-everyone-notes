# S06 — Security, Privacy, and Responsibility — 60-Minute Content Contract

## Status

- **Session:** S06 — Security, Privacy, and Responsibility / Sécurité, confidentialité et responsabilité
- **Curriculum position:** GOVERN
- **Audience:** professionals and learners with no technical prerequisite
- **Duration:** 60 minutes
- **Slide count:** 25 aligned slides in English and 25 in French
- **Central question:** What information and decisions require stronger boundaries?
- **Operational question:** What may I share, what must I verify, and who may approve its use?
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Fusion audit:** `docs/teaching/s06-professional-fusion-audit.md`
- **Audit commit:** `0231470f469656d4f35b182c3a607d85afeb517c`
- **Implementation status:** design contract; teaching sources and exports not yet created
- **Delivery status:** requires implementation checks, visual QA, instructor review, and rehearsal
- **Purpose:** fix the bilingual instructional sequence, fictional facts and rules, activities,
  answer key, timing, provenance, and acceptance criteria before slide implementation.

## 1. Session role and prior learning

S04 establishes whether information is supported. S05 places AI and verification within a workflow.
S06 adds permission to share, permission to use, decision authority, fairness, and escalation.
S07 remains the integrated learner-designed professional workshop.

Reuse S01–S05 skills without reteaching model fundamentals, the capability catalogue, prompt
engineering, document analysis, or workflow design. A correct answer may still be inappropriate to
share or unauthorized to act on.

The session's recurring distinctions are:

- **Evidence:** Is it supported?
- **Permission:** May this information be used here and shared with this recipient?
- **Authority:** Who may approve or carry out the action?

## 2. Learning outcomes

By the end of the session, learners can:

1. identify necessary and unnecessary information in a fictional source packet;
2. apply explicit sharing rules to prepare a limited input;
3. explain why replacing a name does not resolve all identification risks;
4. distinguish evidence, permission, and authority;
5. verify at least three claims against actual supplied sources;
6. identify an unsupported judgment about a person and its possible consequence;
7. assign review, approval, and escalation to the roles specified in the exercise;
8. justify proceeding, revising, or stopping for a particular action.

## 3. Source authority and provenance

Register the following canonical module when implementing S06:

`module_f7aacfe3-c4f7-43f8-a08b-3aa7b461151c`

Sources:

- `courses/01-introduction-to-artificial-intelligence-ai/en/04-issues-concerns-and-ethical-considerations.md`
- `courses/01-introduction-to-artificial-intelligence-ai/fr/04-issues-concerns-and-ethical-considerations.md`

| Canonical contribution                        | Teaching application                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| Privacy, security, and unnecessary disclosure | Input selection and permission checks                    |
| Name removal does not eliminate privacy risk  | Remaining identifying details demonstration              |
| Bias and fairness                             | Challenge a judgment based on a missing record field     |
| Transparency and accountability               | Source references and named responsible roles            |
| Human oversight                               | Separate reviewer, approver, and consequential decisions |
| Hallucinations and verification               | Check causes, values, and approval claims                |
| Governance and incident management            | Explicit fictional rules and reporting route             |
| Continuous monitoring                         | Log a problem and revise a control                       |

The French canonical source's personal-review status remains pending; this contract does not mark it
reviewed. English and French teaching adaptations must be reviewed for aligned meaning.

The colleague-supplied manuscript contributes the practical protection/verification/responsibility
structure and the three-checks-plus-sensitive-information activity. It is not an IBM source.

The packet, rules R1–R8, decision aid, timing, simulated outputs, and rubric below are independent
repository teaching adaptations. No real cooperative procedure, vendor guarantee, or legal duty is
asserted. Do not commit the supplied manuscript or screenshots with the implementation.

## 4. Fixed instructional model

Use a two-moment checklist: **Before sharing / Before using**.

Before sharing, ask about purpose, necessary fields, permission, tool, and remaining identifying
information. Before using, ask about evidence, affected people, recipient, reviewer, approver, and
unresolved issues.

Use three action labels, always tied to a specific action:

| EN                | FR                  | Meaning                                                             |
| ----------------- | ------------------- | ------------------------------------------------------------------- |
| Proceed           | Poursuivre          | The stated conditions for this particular step are met.             |
| Revise            | Corriger            | A known defect can be corrected; then check again.                  |
| Stop and escalate | Arrêter et signaler | Permission, authority, or an incident requires the designated role. |

Proceeding with input preparation is not permission to send the resulting brief. Revision is not
approval. Human review must allow evidence inspection, challenge, correction, and stopping.

## 5. Fictional scenario and classroom mode

The fictional cocoa cooperative near Soubré needs an internal daily operations brief.

This is a new S06 exercise on **18 October 2026** using **SB-601** and **SB-602**. It does not add facts
or policies to the earlier S05 exercise. Familiar CP-A and Area A labels provide continuity only.

All personal details below are invented. The restricted attachment is shown solely as a classroom
simulation. Learners never need to upload it to a real service. No live AI account, network connection,
real credential, or confidential workplace document is required.

The task is to draft an internal brief from permitted operational facts, then decide whether it can
be circulated. Lot acceptance, grading, storage approval, payments, certificates, and personnel
judgments are outside the task.

## 6. Source packet: exact bilingual facts

### Source A — Operations / Exploitation

**EN:**

```text
Date: 18 October 2026
Collection point: CP-A
Intake paused at 09:10.
Intake resumed at 09:40.
The reason for the pause is not stated.
```

**FR:**

```text
Date : 18 octobre 2026
Point de collecte : CP-A
La réception a été interrompue à 09:10.
La réception a repris à 09:40.
La raison de l'interruption n'est pas précisée.
```

### Source B — Reception / Réception

**EN:**

```text
SB-601 | 18 October 2026 | 540 kg
SB-602 | 18 October 2026 | weight not recorded | needs completion
SB-602 requires staff review because the weight field is missing.
The record does not identify who caused the missing field.
```

**FR:**

```text
SB-601 | 18 octobre 2026 | 540 kg
SB-602 | 18 octobre 2026 | poids non renseigné | à compléter
SB-602 nécessite une vérification par un agent car le poids manque.
Le dossier ne précise pas qui est à l'origine du champ manquant.
```

### Source C — Movement / Mouvement

**EN:**

```text
SB-601 | movement recorded at 12:15 | destination: Area A
Area A is only a destination label in this exercise.
No acceptance, quality, storage approval, or payment decision is supplied.
```

**FR:**

```text
SB-601 | mouvement enregistré à 12:15 | destination : Zone A
Zone A est uniquement un libellé de destination dans cet exercice.
Aucune décision d'acceptation, de qualité, d'autorisation de stockage ou de paiement n'est fournie.
```

### Source D — Restricted attachment / Pièce jointe à accès restreint

**EN:**

```text
Fictional person: Awa Exemple
Linked lot: SB-602
Contact field: [fictional phone placeholder]
Location detail: the only household beside the north footbridge
Private payment note: personal advance requested; no decision recorded
Account secret field: [credential placeholder — not a real secret]
```

**FR:**

```text
Personne fictive : Awa Exemple
Lot associé : SB-602
Coordonnées : [emplacement fictif pour un téléphone]
Localisation : le seul foyer près de la passerelle nord
Note de paiement privée : avance personnelle demandée ; aucune décision enregistrée
Champ de secret de compte : [emplacement pour un identifiant secret — aucun secret réel]
```

The association with SB-602 does not establish responsibility for the missing field. The location
example shows why replacing a name with Person A / Personne A does not necessarily prevent
identification. Removing the entire unnecessary attachment is the correct response under R2.

The placeholders must remain placeholders; do not generate a plausible phone number or credential.

## 7. Fictional rules: policy card

Label the card **Fictional rules for this exercise / Règles fictives de cet exercice**.

| ID  | English rule                                                                                                                                                                                                                              | Règle française                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Tool A is permitted only for drafting this internal brief from the operational facts in A–C. All live tool use is simulated in class.                                                                                                     | L'outil A est autorisé uniquement pour préparer ce brief interne à partir des faits opérationnels A–C. Toute utilisation d'outil est simulée en classe.                                                                                                                  |
| R2  | Source D and its personal, location, payment, and secret fields must not enter Tool A or the brief. Replacing a name does not authorize the remaining fields.                                                                             | La source D et ses données personnelles, de localisation, de paiement et de secret ne doivent entrer ni dans l'outil A ni dans le brief. Remplacer un nom n'autorise pas les autres champs.                                                                              |
| R3  | Preserve missing information. Do not infer causes, responsibility, approval, quality, or payment decisions.                                                                                                                               | Conserver les informations manquantes comme telles. Ne pas déduire de cause, de responsabilité, d'approbation, de qualité ou de décision de paiement.                                                                                                                    |
| R4  | The staff reviewer checks the draft against A–C and records corrections. The reviewer may return or stop the draft.                                                                                                                       | L'agent vérificateur contrôle le brouillon à partir de A–C et consigne les corrections. Il peut renvoyer ou bloquer le brouillon.                                                                                                                                        |
| R5  | The operations lead approves circulation to the internal operations team. Approval of the brief does not approve lots, storage, payments, certificates, or personnel decisions.                                                           | Le responsable des opérations approuve la diffusion à l'équipe interne des opérations. Cette approbation ne vaut pas décision sur les lots, le stockage, les paiements, les certificats ou le personnel.                                                                 |
| R6  | External sharing and new recipients require an explicit decision from the operations lead before sending. Existing internal approval does not extend to them.                                                                             | Tout partage externe ou nouveau destinataire exige une décision explicite du responsable des opérations avant l'envoi. L'approbation interne ne s'y étend pas.                                                                                                           |
| R7  | Unclear input permission goes to the information owner. If restricted information has already been shared, stop further sharing and notify the information owner, who coordinates the response. Do not assume deletion reverses exposure. | En cas de doute sur l'autorisation d'une donnée, consulter le responsable des informations. Si une donnée restreinte a déjà été partagée, arrêter tout nouveau partage et le prévenir ; il coordonne la réponse. Ne pas supposer que la suppression annule l'exposition. |
| R8  | Record the issue, correction, reviewer, approval state, and unresolved questions in the restricted internal review record. Do not copy Source D into that record; refer to its source label only.                                         | Consigner le problème, la correction, le vérificateur, l'état d'approbation et les questions ouvertes dans le suivi interne à accès restreint. Ne pas y recopier D ; utiliser uniquement son libellé.                                                                    |

These are teaching permissions, not a technical description of Tool A or a general data classification
standard. Tool A has no claimed retention, training, isolation, encryption, or deletion guarantees.
The named roles are fictional roles, not claims about the real cooperative or ANADER.

## 8. Input-preparation activity and answer key

Allow five minutes within slides 09–10: three minutes individual marking and two minutes guided
comparison. Learners use retain, remove, replace, or ask; justify choices with rule IDs.

| Input                                                    | Expected action                            | Reason                                                              |
| -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| A: date, point, pause and restart times, missing cause   | Retain                                     | Task-relevant and permitted by R1; preserve unknown cause under R3. |
| B: lot IDs, date, weight, missing field, review status   | Retain                                     | Permitted operational facts; do not infer blame.                    |
| C: movement time and destination label                   | Retain                                     | Permitted; destination does not prove approval.                     |
| D: person, contact, location, payment note, secret field | Remove all of D                            | R2 excludes the attachment regardless of name replacement.          |
| Any proposed new field with unclear permission           | Ask the information owner before inclusion | R7; uncertainty is not permission.                                  |

Retaining the lot IDs is specific to R1 in this fictional exercise. Do not teach that all real lot IDs
are anonymous or suitable for unrestricted sharing.

Expected input: A–C only, with source labels and the instruction to preserve unknowns. Exclude D
entirely. The correct choice need not use all four action labels.

## 9. Bounded prompt: reference, not a new prompting lesson

**EN:**

```text
Prepare a short internal operations brief using only Sources A–C below.
Use three sections: Operations, Recorded lots, Follow-up and unknowns.
Preserve dates, times, lot IDs, units, and missing information.
Do not infer causes, blame, approval, quality, or payment decisions.
Label the result: Draft — human review and circulation approval required.
[Insert only the permitted A–C operational facts.]
```

**FR:**

```text
Prépare un bref point interne d'exploitation à partir des seules sources A–C ci-dessous.
Utilise trois rubriques : Exploitation, Lots enregistrés, Suivi et inconnues.
Conserve les dates, heures, identifiants de lots, unités et informations manquantes.
Ne déduis aucune cause, faute, approbation, qualité ou décision de paiement.
Indique : Brouillon — vérification humaine et approbation de diffusion requises.
[Insérer uniquement les faits opérationnels autorisés de A–C.]
```

Prompt constraints do not replace information selection, permissions, review, or access controls.

## 10. Deliberately flawed output: exact bilingual version

Label it **Simulated flawed AI output — not for use / Sortie IA simulée erronée — ne pas utiliser**.
It is a constructed teaching example, not proof that a real upload or incident occurred.

**EN:**

> On 18 October 2026, CP-A intake stopped at 09:10 because of a power outage and resumed at 09:40.
> SB-601 weighed 540 kg and was approved for storage in Area A at 12:15.
> SB-602 has no recorded weight and needs completion. Awa Exemple, from the only household beside
> the north footbridge, is unreliable because the weight is missing. Suspend her payment.
> The brief is approved for immediate circulation to the internal team and an external buyer.

**FR:**

> Le 18 octobre 2026, la réception à CP-A s'est interrompue à 09:10 à cause d'une panne de courant
> et a repris à 09:40. SB-601 pesait 540 kg et a été autorisé au stockage en Zone A à 12:15.
> Le poids de SB-602 n'est pas renseigné et son dossier est à compléter. Awa Exemple, du seul foyer
> près de la passerelle nord, n'est pas fiable puisque le poids manque. Suspendez son paiement.
> Le brief est approuvé pour diffusion immédiate à l'équipe interne et à un acheteur externe.

## 11. Claim-by-claim facilitator key

Keep the full key in teaching notes. Slide 21 shows only the findings needed for debrief.

| Claim or issue                                    | Source or rule | Finding and required response                                                                                                                                                                      |
| ------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date, CP-A, 09:10, 09:40                          | A              | Supported. Keep the values and check their transcription.                                                                                                                                          |
| Power outage                                      | A, R3          | Unsupported cause. Remove; state that the cause is not supplied.                                                                                                                                   |
| SB-601, 540 kg                                    | B              | Supported recorded weight. Keep the unit and lot association.                                                                                                                                      |
| Approved for storage at 12:15                     | C, R3, R5      | C records movement, not approval. Replace with movement to Area A at 12:15.                                                                                                                        |
| SB-602 missing weight and needs completion        | B              | Supported. Keep staff review as the required follow-up.                                                                                                                                            |
| Person's name and household location              | D, R2          | Restricted and unnecessary. Remove both; replacing the name is insufficient.                                                                                                                       |
| Person is unreliable because a field is missing   | B, R3          | Unsupported judgment. Missing data do not establish who caused the gap or the person's reliability. Remove; request record review.                                                                 |
| Suspend payment                                   | C, R3, R5      | Unsupported consequential action outside this brief's authority. Remove; do not act on it. Refer any actual payment request to the operations lead for routing, not for assumed payment authority. |
| Brief approved for immediate internal circulation | R4–R5          | No review or approval record is supplied. Mark draft and hold circulation pending the stated checks.                                                                                               |
| Send to external buyer                            | R6             | No external-sharing authorization exists. Do not send; refer the request to the operations lead.                                                                                                   |

The minimum three substantive checks in learner responses are the cause, movement-versus-approval,
and missing-weight-versus-blame claims. The name/location, payment action, and circulation problems
are additional mandatory safety and authority findings in the integrated activity.

Possible consequences of the unsupported judgment include reputational harm and an unjustified
payment interruption. These are possible harms, not events asserted to have occurred.

## 12. Corrected draft: facilitator reference

Both versions must remain marked as drafts; correctness alone does not confer permission to circulate.

**EN:**

> Draft — human review and circulation approval required.
>
> **Operations:** On 18 October 2026, intake at CP-A paused at 09:10 and resumed at 09:40. The cause
> is not stated in Source A.
>
> **Recorded lots:** Source B records 540 kg for SB-601. Source C records its movement to Area A at
> 12:15; no storage approval is supplied.
>
> **Follow-up and unknowns:** SB-602 has no recorded weight and is marked needs completion for staff
> review. The source does not identify who caused the missing field. No payment decision is supplied.

**FR:**

> Brouillon — vérification humaine et approbation de diffusion requises.
>
> **Exploitation :** Le 18 octobre 2026, la réception à CP-A s'est interrompue à 09:10 et a repris à
> 09:40. La cause n'est pas précisée dans la source A.
>
> **Lots enregistrés :** La source B indique 540 kg pour SB-601. La source C indique son déplacement
> vers Zone A à 12:15 ; aucune autorisation de stockage n'est fournie.
>
> **Suivi et inconnues :** Le poids de SB-602 n'est pas renseigné et son dossier est à compléter pour
> vérification par un agent. La source ne précise pas qui est à l'origine du champ manquant. Aucune
> décision de paiement n'est fournie.

Equivalent concise wording is acceptable if it preserves facts, exclusions, unknowns, and draft
status. Mentioning that no payment decision is supplied does not authorize importing the private
payment note from D.

## 13. Role and authority map

| Role                     | Permitted exercise action                                           | Boundary                                                                         |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Preparatory staff member | Select A–C and prepare a draft                                      | Cannot approve circulation merely by drafting.                                   |
| Tool A                   | Structure supplied permitted facts                                  | Has no approval or operational decision authority.                               |
| Staff reviewer           | Check sources, correct, return, or stop the draft                   | Review is not circulation approval.                                              |
| Operations lead          | Approve internal circulation; decide requests for new recipients    | Brief approval does not authorize lot, storage, payment, or personnel decisions. |
| Information owner        | Resolve input-permission questions and coordinate incident response | No vendor or legal powers are implied.                                           |

No actual review or approval is supplied in the initial case. Students must not fill those fields as
completed. A learner may play a role during simulation but must label any resulting record simulated.

## 14. Decision branches and incident drill

Use these cases to make the three action labels observable:

| Card | Exact condition                                                                                                                                                   | Expected decision                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A    | Only A–C are selected for the permitted draft task in Tool A.                                                                                                     | Proceed with drafting, not circulation.                                                                      |
| B    | The flawed draft is ready to circulate; no review or approval is recorded.                                                                                        | Revise the defects and hold circulation. Route the corrected draft through R4–R5.                            |
| C    | Someone requests sending the corrected draft to a new external buyer.                                                                                             | Stop that sending action and escalate under R6.                                                              |
| D    | Hypothetical incident: a staff member says they already uploaded D.                                                                                               | Stop further sharing, notify the information owner under R7, and follow the response process.                |
| E    | Separate hypothetical update: the reviewer has checked the corrected draft and the operations lead has approved circulation to the internal operations team only. | Proceed with that internal circulation only; external sharing and consequential actions remain unauthorized. |

Translate conditions without adding permissions. Card E is an explicitly new hypothetical update,
not an approval silently inserted into the initial case.

For Card D, record that D was involved without copying its contents into the review log. Do not
promise recovery by deleting the chat. No real credential or incident is enacted during the lesson.

Monitoring example: if several drafts repeat the movement-to-approval error, record the recurrence,
add that item to the review checklist, and reassess the process. Do not assert that this eliminates
future errors.

## 15. Integrated activity and assessment

Slide 19 gives the task and points to A–D and R1–R8. Slide 20 provides five minutes of individual
work. Slide 21 provides three minutes of debrief. Slide 22 allows two minutes to record the decision
and contrast Card E with the initial case. Together, slides 19–22 occupy twelve minutes.

Learners submit one decision record:

1. Permitted input and excluded source, with rule IDs.
2. Three checked claims, source labels, and required corrections.
3. The sensitive-information issue and the unsupported judgment.
4. The prohibited consequential action and required human roles.
5. Decision for internal circulation now; decision for external sharing now.
6. Required response if Card D occurs.

Use a formative rubric, not a professional certification or compliance score:

| Criterion         | Observable evidence                                                                    |
| ----------------- | -------------------------------------------------------------------------------------- |
| Input protection  | A–C retained as relevant; all of D excluded under R2.                                  |
| Verification      | Cause, storage approval, and blame each checked against the appropriate source.        |
| Fairness          | Missing field distinguished from personal reliability or culpability.                  |
| Authority         | Payment instruction rejected; reviewer and circulation approver distinguished.         |
| Recipient control | Internal circulation held pending review/approval; external sharing referred under R6. |
| Escalation        | Information owner notified for Card D; no claim that deletion guarantees reversal.     |

Mark each criterion **demonstrated** or **revisit**. Revisit a safety-critical error even if other
answers are correct. Give the matching source/rule and invite correction; do not use a numerical
pass mark to hide a restricted-data or unauthorized-action error.

## 16. Professional transfer: meeting follow-up

This separate fictional card supplies all necessary rules:

**EN:** Internal meeting notes contain: launch meeting on 22 October 2026; budget ceiling marked
internal-only; an employee absence reason marked private. For an external scheduling email, the
exercise rule permits only the meeting date. The meeting owner must approve sending; no approval
has yet been supplied.

**FR:** Les notes internes indiquent : réunion de lancement le 22 octobre 2026 ; plafond budgétaire
réservé à l'interne ; motif d'absence d'un salarié marqué privé. Pour un courriel de planification
externe, la règle de l'exercice autorise uniquement la date. Le responsable de la réunion doit
approuver l'envoi ; aucune approbation n'est encore fournie.

Expected answer: prepare a date-only draft, remove the budget and absence reason, and await the
meeting owner's approval before sending. Accuracy of the internal notes does not authorize sharing
all their content. Do not transfer Tool A permissions automatically to this separate scenario.

## 17. Decision aid and delivery boundary

The checklist is embedded on slide 24 and reproduced in full in its teaching notes. No separate
workbook or handout is added at this stage. Learners can copy its headings into ordinary notes.

### Before sharing / Avant de partager

- Purpose / Objectif
- Necessary fields / Données nécessaires
- Permission and tool / Autorisation et outil
- Remaining identifying details / Éléments encore identifiants

### Before using / Avant d'utiliser

- Evidence and unknowns / Sources et inconnues
- Affected people / Personnes concernées
- Recipient / Destinataire
- Reviewer and approver / Vérificateur et approbateur
- Decision, issue, and follow-up / Décision, problème et suivi

This aid complements S05's Workflow Canvas. It is an independent teaching adaptation, not a named
IBM standard. In S07, learners carry over the permitted-input boundary, evidence checks, authority,
and stop conditions.

## 18. Slide-by-slide bilingual contract

Timing includes explanation, learner action, and transitions. Do not add exercise time on top.

| ID     | EN title                              | FR title                                    | Minutes | Cumulative | Required teaching action or visible result                                                                |
| ------ | ------------------------------------- | ------------------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| S06-01 | Security, Privacy, and Responsibility | Sécurité, confidentialité et responsabilité | 1       | 1          | Title, source attribution, AI-assisted adaptation disclosure.                                             |
| S06-02 | What you will be able to do           | Ce que vous saurez faire                    | 2       | 3          | Protect inputs, check claims, identify authority, justify a decision.                                     |
| S06-03 | From workflow to responsibility       | Du workflow à la responsabilité             | 2       | 5          | Ask whether a correct S05-style brief is automatically permitted to circulate; answer no.                 |
| S06-04 | Three different checks                | Trois contrôles différents                  | 3       | 8          | Evidence, permission, authority; one simple example per check.                                            |
| S06-05 | Necessary does not mean permitted     | Nécessaire ne veut pas dire autorisé        | 3       | 11         | Separate usefulness, input permission, tool permission, and recipient permission.                         |
| S06-06 | Replacing a name is not enough        | Remplacer un nom ne suffit pas              | 3       | 14         | Show D's name and unique household description as a fictional counterexample; remove unnecessary details. |
| S06-07 | Read the rules before sharing         | Lire les règles avant de partager           | 3       | 17         | Introduce R1–R3 and R7, tool A scope, and placeholder-only secret.                                        |
| S06-08 | Our fictional source packet           | Notre dossier fictif                        | 2       | 19         | Introduce A–D; mark D restricted and distinguish S06 from S05 facts.                                      |
| S06-09 | Select the permitted input            | Sélectionner les données autorisées         | 3       | 22         | Individual field selection using retain/remove/replace/ask.                                               |
| S06-10 | Compare your selection                | Comparer votre sélection                    | 3       | 25         | Two-minute feedback plus bounded-prompt reminder; answer is A–C only.                                     |
| S06-11 | Permission can remain unknown         | L'autorisation peut rester inconnue         | 2       | 27         | New unspecified field: consult information owner; no invented permission.                                 |
| S06-12 | Read the simulated draft              | Lire le brouillon simulé                    | 2       | 29         | Display flawed output with warning; learners initially mark concerns.                                     |
| S06-13 | Check the claim against its source    | Comparer l'affirmation à sa source          | 3       | 32         | Demonstrate cause and movement/approval checks with A and C excerpts.                                     |
| S06-14 | A missing field is not a judgment     | Un champ manquant n'est pas un jugement     | 3       | 35         | Use B to challenge blame and identify potential harm.                                                     |
| S06-15 | A reference is not proof              | Une référence n'est pas une preuve          | 2       | 37         | Compare the approval claim to actual C; another model confirmation does not replace evidence.             |
| S06-16 | Review and approval are different     | Vérification et approbation sont distinctes | 3       | 40         | R4–R6 role map; no payment or storage authority inferred.                                                 |
| S06-17 | If information was already shared     | Si une information a déjà été partagée      | 3       | 43         | Hypothetical Card D; apply R7–R8 and avoid a deletion guarantee.                                          |
| S06-18 | Proceed, revise, or escalate          | Poursuivre, corriger ou signaler            | 2       | 45         | Cards A–C; always name the action and its unmet conditions.                                               |
| S06-19 | Your review mission                   | Votre mission de vérification               | 2       | 47         | Explain six-part decision record; display packet and rules reference.                                     |
| S06-20 | Make and justify your decisions       | Décider et justifier                        | 5       | 52         | Independent integrated work; facilitator does not reveal full key.                                        |
| S06-21 | Debrief the risks and corrections     | Examiner les risques et les corrections     | 3       | 55         | Answer key: data, evidence, fairness, authority, recipient.                                               |
| S06-22 | Record the decision and follow-up     | Consigner la décision et le suivi           | 2       | 57         | Initial hold versus Card E internal approval; R8 and recurring-error monitoring.                          |
| S06-23 | Transfer to meeting follow-up         | Transposer au suivi de réunion              | 1       | 58         | Date-only external draft; approval still pending.                                                         |
| S06-24 | Before sharing, before using          | Avant de partager, avant d'utiliser         | 1       | 59         | Reusable checklist and S07 handoff.                                                                       |
| S06-25 | Exit check                            | Vérification finale                         | 1       | 60         | One sentence naming permitted input, a check, approver, and stop condition.                               |

The final three minutes are a concise transfer and retrieval check, not an additional workshop.
If rehearsal shows overload, reduce facilitator wording or move optional depth into notes; preserve
individual practice and source/rule access. Any later timing change must update both languages.

## 19. Exit check and expected response

Prompt: **For the Soubré exercise, what may enter the tool, what must be checked, who approves
circulation, and when must you stop?**

Question : **Dans l'exercice de Soubré, quelles données peuvent entrer dans l'outil, que faut-il
vérifier, qui approuve la diffusion et quand faut-il arrêter ?**

Example acceptable answer:

> Use only A–C; check claims against their sources; the operations lead approves internal
> circulation after staff review; stop external sharing without authorization or report a D upload
> to the information owner.

French equivalent:

> Utiliser seulement A–C ; vérifier les affirmations dans leurs sources ; le responsable des
> opérations approuve la diffusion interne après vérification par un agent ; arrêter tout partage
> externe non autorisé ou signaler l'envoi de D au responsable des informations.

Accept equivalent phrasing that preserves the four boundaries. This is a formative retrieval check.

## 20. Visual and facilitation contract

Use the existing KRAAK design system and teaching renderer. Preserve footer clearance and readable
projected type; do not shrink dense tables to fit.

Required visuals:

- A three-column evidence/permission/authority comparison on slide 04.
- A before/after information-selection visual on slides 06 and 10.
- Four source cards for A–D, with D's restricted status expressed in words and iconography.
- A source-versus-claim comparison for cause and movement on slide 13.
- A compact role map for preparation, verification, and circulation approval on slide 16.
- A three-outcome decision visual on slide 18 with the affected action identified.
- A two-panel Before sharing / Before using checklist on slide 24.

Never rely on color alone for permission or answer status. Do not depict an AI node approving an
operational decision. Label fictional data and simulated outputs where they appear.

The complete packet and policy card must be available to learners during slide 20. Before class,
the facilitator prepares readable reference extracts from the teaching notes: A–C facts, the D
illustration, and R1–R8. Supply printed extracts or an independently accessible local reference view
so learners can consult them while the response template is projected. This access is a delivery
requirement, not an optional live demonstration. The extracts reproduce existing content; they are
not additional numbered slides, a new workbook, or extra assessed tasks.

Keep answer keys in teaching notes until debrief. The projected slide-20 view contains the response
template and source/rule pointers, not the solutions. Do not compress the complete packet and all
rules into one slide or require learners to remember them from earlier slides. Check reference
legibility and simultaneous access during rehearsal.

## 21. Teaching-note and bilingual alignment contract

Each slide's notes must contain its purpose, key explanation, source/rule references where relevant,
learner action or expected response, common misconception, transition, and time budget.

Preserve across languages:

- identical S06-01 through S06-25 IDs and ordering;
- identical individual times and 60-minute total;
- identical R1–R8 permissions and role boundaries;
- identical facts, unknowns, invented flaws, corrections, and assessment criteria;
- identical source provenance, attribution, and simulated-data labels;
- the same distinction between an initial missing approval and hypothetical Card E.

| EN                       | FR                             |
| ------------------------ | ------------------------------ |
| Staff reviewer           | Agent vérificateur             |
| Operations lead          | Responsable des opérations     |
| Information owner        | Responsable des informations   |
| Internal operations team | Équipe interne des opérations  |
| Needs completion         | À compléter                    |
| Area A                   | Zone A                         |
| Source support           | Appui dans les sources         |
| Circulation approval     | Approbation de diffusion       |
| Restricted attachment    | Pièce jointe à accès restreint |

Keep CP-A, SB-601, SB-602, 540 kg, 09:10, 09:40, and 12:15 unchanged. Translate dates naturally
without changing them. Do not translate privacy into confidentiality in ways that erase the
protection of identifiable people; explain the difference in notes while retaining the agreed title.

## 22. Attribution, exclusions, and delivery readiness

The first slide visibly states that the session draws in part on IBM's AI Foundations for Everyone
Specialization on Coursera and is an independent AI-assisted teaching adaptation requiring human
review. Do not imply IBM authored the fictional policy or endorsed the deck.

Exclude legal deadlines, jurisdiction-specific compliance advice, vendor-policy claims, technical
security configuration, adversarial prompting labs, numerical fairness testing, and the full S07
capstone. Broader copyright, synthetic-media, access, and environmental themes may remain optional
source references; they are not extra core slides.

Human review must cover source fidelity, EN/FR equivalence, case clarity, authority boundaries,
classroom reference access, readability, and timing. Automated validation does not complete rehearsal
or certify that the deck is ready to teach.

## 23. Implementation and acceptance criteria

Expected future sources:

- `teaching/sessions/s06-security-privacy-and-responsibility/en/session.md`
- `teaching/sessions/s06-security-privacy-and-responsibility/fr/session.md`

Use the repository's existing source schema and artifact commands. Add the manifest entry only when
both teaching sources exist and validate. Use the single canonical module ID in section 3.

The implementation must satisfy all of the following:

1. Exactly 25 slides per language, aligned IDs, and exactly 60 minutes per language.
2. GOVERN remains distinct from S04 verification, S05 workflow design, and S07 application.
3. Source A preserves the date, location label, times, and unknown cause.
4. Source B preserves SB-601 at 540 kg and SB-602's missing weight and review requirement.
5. Source C preserves movement at 12:15 without inferring storage approval.
6. Source D remains fictional, restricted, and excluded from permitted tool input and final brief.
7. No real-looking secret or phone number replaces a placeholder.
8. R1–R8 have matching meaning and stable IDs in both languages.
9. Name replacement is not taught as sufficient protection or authorization.
10. The flawed draft retains all flaws listed in the answer key.
11. Learners check at least the cause, approval, and blame claims against supplied evidence.
12. Restricted detail, unfair judgment, payment action, and recipient problems are explicitly corrected.
13. Initial internal circulation remains pending review and operations-lead approval.
14. External circulation is separately referred under R6.
15. Card E adds only hypothetical internal-circulation approval; no other authority expands.
16. Card D has a concrete reporting route without a deletion or remediation guarantee.
17. The review log follows R8 and does not reproduce restricted contents.
18. The integrated task produces a reviewable decision record and uses the six-criterion formative key.
19. The meeting transfer card preserves its distinct rules and pending approval.
20. Learners can consult source facts and rules during practice without a real AI account.
21. The reusable checklist is embedded; no separate workbook is silently added.
22. Visible attribution, AI-assisted disclosure, and fictional/simulated labels are preserved.
23. Projected content stays concise; full rules, keys, and explanations remain accessible in notes.
24. Repository checks, artifact verification, and visual QA pass before exports are packaged.
25. Instructor review and timed rehearsal are tracked separately from automated checks.

## 24. Governing rule

Protect information before sharing it. Check evidence before using an answer. Keep professional
authority explicit, and stop the action when its conditions are not met.
