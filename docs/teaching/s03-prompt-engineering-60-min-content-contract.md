# S03 Professional Bilingual 60-Minute Content Contract

## Production information

- **Program:** AI for Everyone — Professional Curriculum
- **Session:** S03 — Designing Effective Prompts / Concevoir de bons prompts
- **Total duration:** 60 minutes in each language
- **Slide count:** 25 English slides and 25 French slides
- **Audience:** professionals and learners with no technical prerequisite
- **Anchor case:** a fictional unnamed cocoa cooperative near Soubré
- **Curriculum position:** PROMPT
- **Parent curriculum:** `docs/teaching/ai-for-everyone-professional-curriculum.md`
- **Fusion audit:** `docs/teaching/s03-professional-fusion-audit.md`
- **Canonical learning source:** Course 03 — Generative AI: Prompt Engineering Basics
- **Status:** professional-fusion content contract; bilingual teaching-source implementation pending
- **Open source-review item:** the French canonical Course 03 adaptations still await personal review

## Session purpose

S03 teaches learners how to translate a bounded professional need into an instruction that can be
executed, evaluated, improved, and reused.

The session does not teach prompting as a collection of tricks.

Its central professional sequence is:

```text
RESULT NEEDED
    ↓
STRUCTURE THE PROMPT
    ↓
GENERATE A DRAFT
    ↓
EVALUATE
    ↓
REFINE
    ↓
REUSE OR ADAPT
    ↓
VERIFY BEFORE USE
```

The session also preserves the canonical technique progression:

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

## Observable objectives

By the end of the session, a learner can:

1. structure a professional prompt using relevant elements from role, task, context, audience,
   format, constraints, and quality criteria;
2. choose a direct request, examples, questions, or decomposition for a stated reason;
3. evaluate an output against its source, intended audience, constraints, and quality criteria;
4. refine a prompt in response to an observed gap rather than simply regenerating;
5. turn a useful prompt into a reusable starting template while preserving human verification.

## Source attribution and AI transparency

- **Original learning source:** IBM's _AI Foundations for Everyone_ Specialization on Coursera,
  including Course 03 — _Generative AI: Prompt Engineering Basics_.
- **Professional-practice input:** the collaborative course manuscript summarized in the parent
  curriculum and S03 fusion audit contributes practical prompt structure, iterative improvement,
  and reusable-template patterns.
- **AI generation:** the teaching session is generated with AI as an independent repository
  adaptation.
- **Cover requirement:** Slide 01 in both languages must display compact IBM/Coursera attribution
  and disclose that the independent teaching adaptation is generated with AI.
- The resulting teaching materials are not official IBM or Coursera course materials and do not
  imply their endorsement.

## Common rules for both languages

1. English and French use identifiers S03-01 through S03-25 with identical durations, activity
   structure, and learning intent.
2. Each slide carries one primary teaching idea; detailed explanations, edge cases, and
   facilitation prompts belong in presenter notes.
3. The seven-element framework is a practical checklist, not mandatory prompt syntax. A task may
   require only the elements that materially improve the instruction.
4. The seven prompt elements are **role, task, context, audience, format, constraints, and quality
   criteria**.
5. Human review is not one of the seven prompt elements. It belongs to the broader professional
   workflow surrounding the generated result.
6. A better prompt does not guarantee a true, safe, complete, or professionally authorized answer.
7. The fictional intake source is limited to: record **lot ID, date, and weight**; if a field is
   missing, mark the record **“needs completion” / « à compléter »**, then have a staff member
   review it. No other rule is supplied.
8. No threshold, deadline, certification, grade, payment rule, acceptance decision, or other
   business rule may be invented from the fictional source.
9. A role or persona may guide perspective, vocabulary, or tone. It does not grant organizational,
   regulatory, professional, or factual authority.
10. Zero-shot, one-shot, and few-shot describe what examples are supplied in the current prompt;
    they do not describe or modify the model's training history.
11. Interview prompting may gather missing context. An unavailable answer remains unknown.
12. Decomposition refers to observable work steps and checkable outputs; it must not be presented
    as access to private model reasoning.
13. An example inside a prompt may illustrate a desired format or behavior, but the example itself
    must be checked.
14. Iteration must respond to an observed gap: identify the gap, change the instruction, and
    evaluate again.
15. A reusable prompt template is a starting point, not a permanently valid procedure.
16. Exercises use fictional, anonymized, public, or explicitly authorized information. Real
    confidential information is not required.
17. Generated drafts do not approve lots, payments, certifications, publications, or other
    consequential professional decisions.
18. Asking a model to evaluate its own output is not independent verification.
19. Multimodal input adds another source to inspect; it does not prove authenticity.
20. S03 introduces prompt reuse, while detailed workflow integration remains primarily S05 and
    detailed security governance remains primarily S06.

## Seven-element practical prompt framework

A professional prompt may specify:

1. **Role** — a useful perspective or operating context where this adds value.
2. **Task** — what the system should produce or accomplish.
3. **Context** — relevant facts, background, approved sources, and known unknowns.
4. **Audience** — the person or group who will receive or use the result.
5. **Format** — the requested structure or type of output.
6. **Constraints** — limits such as language, tone, length, exclusions, and permitted information.
7. **Quality criteria** — the conditions that make the result useful enough to review or use.

Not every prompt needs all seven elements.

The framework supports better specification. It does not replace verification.

## Program-wide connection

S03 develops the **INSTRUCTION** part of the program's five-question operating framework:

```text
RESULT → CONTEXT → INSTRUCTION → SAFETY → VERIFICATION
```

The learner should understand that a well-written instruction still sits inside a larger
professional process.

## Timing allocation

| Sequence                                          | Slides        | Minutes |
| ------------------------------------------------- | ------------- | ------: |
| Need, source, and professional prompt structure   | S03-01–S03-07 |      15 |
| Structured request, transfer, role, and iteration | S03-08–S03-11 |      10 |
| Technique selection and missing context           | S03-12–S03-16 |      11 |
| Decomposition, comparison, error, and revision    | S03-17–S03-20 |      12 |
| Practice, evaluation, transfer, and conclusion    | S03-21–S03-25 |      12 |
| **Total**                                         | **25 slides** |  **60** |

---

## S03-01 — Opening / Ouverture

Duration: **1 minute**

### English

- **Title:** Designing Effective Prompts
- **Key message:** A professional prompt translates a work need into an instruction that can be
  checked and improved.
- **On-slide content:**
  - S03 · 60-minute session
  - From work result to reviewable instruction
  - Fictional cocoa cooperative near Soubré
  - Based on IBM's _AI Foundations for Everyone_ Specialization on Coursera
  - Independent teaching adaptation generated with AI
- **Facilitator notes:** Connect directly to S02. S02 showed what generative AI can help produce;
  S03 focuses on how to communicate the work requirement. State that a better instruction does
  not remove verification or human responsibility.

### Français

- **Titre :** Concevoir de bons prompts
- **Message principal :** Un prompt professionnel transforme un besoin de travail en consigne que
  l'on peut contrôler et améliorer.
- **Contenu visible :**
  - S03 · séance de 60 minutes
  - Du résultat attendu à une consigne vérifiable
  - Coopérative cacaoyère fictive près de Soubré
  - Basé sur la spécialisation _AI Foundations for Everyone_ d'IBM sur Coursera
  - Adaptation pédagogique indépendante générée avec l'IA
- **Notes du formateur :** Relier directement à S02. S02 montrait ce que l'IA générative peut aider
  à produire ; S03 se concentre sur la manière de formuler le besoin de travail. Préciser qu'une
  meilleure consigne ne supprime ni la vérification ni la responsabilité humaine.

## S03-02 — Intended outcomes / Résultats attendus

Duration: **2 minutes**

### English

- **Title:** What you will be able to do
- **Key message:** Structure, choose, evaluate, refine, and reuse.
- **On-slide content:**
  1. Structure a professional prompt
  2. Choose a technique for a reason
  3. Evaluate the proposed answer
  4. Refine an observed gap
  5. Reuse a validated starting point
- **Facilitator notes:** Preview the complete learning progression. “Validated starting point” does
  not mean permanent approval: the source, audience, constraints, and context must still be checked
  when a prompt is reused.

### Français

- **Titre :** Ce que vous saurez faire
- **Message principal :** Structurer, choisir, évaluer, corriger et réutiliser.
- **Contenu visible :**
  1. Structurer un prompt professionnel
  2. Choisir une technique pour une raison
  3. Évaluer la réponse proposée
  4. Corriger un écart observé
  5. Réutiliser un point de départ validé
- **Notes du formateur :** Présenter la progression complète. Un « point de départ validé » ne
  signifie pas une approbation permanente : lors de la réutilisation, il faut encore contrôler la
  source, le public, les contraintes et le contexte.

## S03-03 — Prompt quality and truth / Qualité du prompt et vérité

Duration: **2 minutes**

### English

- **Title:** A better prompt does not mean a true answer
- **Key message:** Prompt quality and factual reliability are different questions.
- **On-slide content:**
  - S02 deliberately showed “certified within 24 hours”
  - The fictional source supplied no certification or deadline
  - Better instructions can reduce ambiguity
  - The proposed answer still requires checking
- **Facilitator notes:** Recall S02-12. The unsupported sentence was constructed for teaching. Do
  not suggest that a sufficiently detailed prompt can prevent every error.

### Français

- **Titre :** Un meilleur prompt ne garantit pas une réponse vraie
- **Message principal :** La qualité du prompt et la fiabilité factuelle sont deux questions
  différentes.
- **Contenu visible :**
  - S02 montrait volontairement « certifié sous 24 heures »
  - La source fictive ne donnait ni certification ni délai
  - Une meilleure consigne peut réduire l'ambiguïté
  - La réponse proposée reste à contrôler
- **Notes du formateur :** Rappeler S02-12. La phrase non fondée était construite pour
  l'apprentissage. Ne pas laisser entendre qu'un prompt suffisamment détaillé peut empêcher toute
  erreur.

## S03-04 — Exercise source / Source de l'exercice

Duration: **2 minutes**

### English

- **Title:** Keep the source visible
- **Key message:** The source defines which claims can be checked.
- **On-slide content:**
  - Record lot ID, date, and weight
  - Missing field → mark “needs completion”
  - Then have a staff member review the record
  - No other rule is supplied
- **Facilitator notes:** Keep this fictional instruction available throughout the exercise. It is
  not a real cooperative procedure or regulation. Unknown information remains unknown.

### Français

- **Titre :** Garder la source visible
- **Message principal :** La source détermine quelles affirmations peuvent être contrôlées.
- **Contenu visible :**
  - Relever l'identifiant du lot, la date et le poids
  - Champ manquant → marquer « à compléter »
  - Puis faire vérifier le dossier par un agent
  - Aucune autre règle n'est fournie
- **Notes du formateur :** Garder cette consigne fictive accessible pendant tout l'exercice. Il ne
  s'agit ni d'une procédure réelle de coopérative ni d'une réglementation. Une information inconnue
  reste inconnue.

## S03-05 — What a professional prompt does / Rôle d'un prompt professionnel

Duration: **3 minutes**

### English

- **Title:** A prompt is a work instruction
- **Key message:** A prompt connects an expected result with the information and requirements needed
  to produce a draft.
- **On-slide content:**
  - Result needed
  - Task + context + input
  - Output requirements
  - Draft → check → refine or approve
- **Facilitator notes:** Connect the slide to the canonical prompt components: instruction, context,
  input data, and output indicators. A new prompt changes the current generation context; it does
  not retrain the model.

### Français

- **Titre :** Un prompt est une consigne de travail
- **Message principal :** Un prompt relie le résultat attendu aux informations et exigences
  nécessaires pour produire un brouillon.
- **Contenu visible :**
  - Résultat attendu
  - Tâche + contexte + entrée
  - Exigences de sortie
  - Brouillon → contrôle → correction ou validation
- **Notes du formateur :** Relier la diapositive aux composantes canoniques du prompt : instruction,
  contexte, données d'entrée et indicateurs de sortie. Un nouveau prompt modifie le contexte de la
  génération en cours ; il ne réentraîne pas le modèle.

## S03-06 — Weak request / Demande faible

Duration: **2 minutes**

### English

- **Title:** A weak request leaves decisions unstated
- **Key message:** “Write a message” does not define enough of the professional need.
- **On-slide content:**
  - Starting prompt: “Write a message about lot intake.”
  - What result is actually needed?
  - Which facts may be used?
  - Who will read it and in what form?
- **Facilitator notes:** Ask learners what is missing before showing the seven-element framework.
  Do not generate an imaginary answer to the weak prompt.

### Français

- **Titre :** Une demande faible laisse des choix implicites
- **Message principal :** « Rédige un message » ne définit pas suffisamment le besoin
  professionnel.
- **Contenu visible :**
  - Prompt de départ : « Rédige un message sur la réception des lots. »
  - Quel résultat faut-il réellement obtenir ?
  - Quels faits peut-on utiliser ?
  - Qui va le lire et sous quelle forme ?
- **Notes du formateur :** Faire identifier ce qui manque avant d'afficher le cadre en sept
  éléments. Ne pas fabriquer une réponse imaginaire au prompt faible.

## S03-07 — Seven-element framework / Cadre en sept éléments

Duration: **3 minutes**

### English

- **Title:** Seven elements for a useful prompt
- **Key message:** Use the elements that make the instruction clearer and easier to evaluate.
- **On-slide content:**
  - Role + task
  - Context + audience
  - Format + constraints
  - Quality criteria
- **Facilitator notes:** Name all seven elements explicitly: role, task, context, audience, format,
  constraints, and quality criteria. Explain that this is a checklist, not mandatory syntax. A
  simple task may not need a role or every other element.

### Français

- **Titre :** Sept éléments pour un prompt utile
- **Message principal :** Utiliser les éléments qui rendent la consigne plus claire et plus facile
  à évaluer.
- **Contenu visible :**
  - Rôle + tâche
  - Contexte + public
  - Format + contraintes
  - Critères de qualité
- **Notes du formateur :** Nommer explicitement les sept éléments : rôle, tâche, contexte, public,
  format, contraintes et critères de qualité. Expliquer qu'il s'agit d'une grille, pas d'une
  syntaxe obligatoire. Une tâche simple peut ne pas nécessiter de rôle ni tous les autres éléments.

## S03-08 — Structured prompt / Prompt structuré

Duration: **2 minutes**

### English

- **Title:** Build one structured prompt
- **Key message:** Supply the information needed for the task and explicitly limit unsupported
  additions.
- **On-slide content:**
  - Task: draft a short staff notice
  - Context: use only the S03-04 instruction
  - Audience + format: intake staff, short notice
  - Constraint + quality: add no rule; preserve the supplied facts
- **Facilitator notes:** Use the real ChatGPT capture based on the fictional cooperative source.
  Identify which framework elements are present. Point out that an explicit role is unnecessary in
  this example. The capture remains a draft to verify, not proof that the prompt guarantees
  compliance.

### Français

- **Titre :** Construire un prompt structuré
- **Message principal :** Fournir les informations nécessaires à la tâche et limiter explicitement
  les ajouts non fondés.
- **Contenu visible :**
  - Tâche : rédiger un avis bref
  - Contexte : utiliser uniquement la consigne S03-04
  - Public + format : agents de réception, avis court
  - Contrainte + qualité : aucune règle ajoutée ; faits fournis préservés
- **Notes du formateur :** Utiliser la capture réelle de ChatGPT fondée sur la source fictive de la
  coopérative. Identifier les éléments du cadre présents. Signaler qu'un rôle explicite n'est pas
  nécessaire ici. La capture reste un brouillon à vérifier et ne prouve pas que le prompt garantit
  le respect de la consigne.

## S03-09 — Professional transfer / Transfert professionnel

Duration: **3 minutes**

### English

- **Title:** Same framework, different professional work
- **Key message:** The framework stays useful while the context, audience, format, and criteria
  change.
- **On-slide content:**
  - Email → recipient, purpose, tone
  - Meeting summary → notes, decisions, missing information
  - Report → audience, length, approved sources
  - Presentation outline → objective, structure, support for claims
- **Facilitator notes:** These are transfer examples, not new factual rules. Ask which prompt
  elements change from one task to another. The cooperative remains the exercise anchor but is not
  the only professional context.

### Français

- **Titre :** Même cadre, autre travail professionnel
- **Message principal :** Le cadre reste utile tandis que le contexte, le public, le format et les
  critères changent.
- **Contenu visible :**
  - Courriel → destinataire, objectif, ton
  - Compte rendu → notes, décisions, informations manquantes
  - Rapport → public, longueur, sources autorisées
  - Plan de présentation → objectif, structure, justification des affirmations
- **Notes du formateur :** Il s'agit d'exemples de transfert, pas de nouvelles règles factuelles.
  Demander quels éléments du prompt changent selon la tâche. La coopérative reste le cas principal
  de l'exercice sans être le seul contexte professionnel.

## S03-10 — Role and authority / Rôle et autorité

Duration: **2 minutes**

### English

- **Title:** A role guides; it does not grant authority
- **Key message:** A role can guide perspective or tone without creating professional authority.
- **On-slide content:**
  - Role: “assist the drafting team”
  - Useful for perspective, vocabulary, or tone
  - Does not create missing facts or access rights
  - Human responsibility remains unchanged
- **Facilitator notes:** Distinguish persona from delegation. Do not ask the model to accept a lot,
  decide payment, certify quality, diagnose crops, or publish an operational rule.

### Français

- **Titre :** Un rôle oriente ; il ne donne pas d'autorité
- **Message principal :** Un rôle peut guider la perspective ou le ton sans créer d'autorité
  professionnelle.
- **Contenu visible :**
  - Rôle : « aider l'équipe de rédaction »
  - Utile pour la perspective, le vocabulaire ou le ton
  - Ne crée ni faits manquants ni droits d'accès
  - La responsabilité humaine ne change pas
- **Notes du formateur :** Distinguer persona et délégation. Ne pas demander au modèle d'accepter un
  lot, décider un paiement, certifier une qualité, diagnostiquer une culture ou publier une règle
  opérationnelle.

## S03-11 — Targeted iteration / Itération ciblée

Duration: **3 minutes**

### English

- **Title:** Improve from an observed gap
- **Key message:** Iteration is useful when the next instruction responds to a specific problem.
- **On-slide content:**
  - Check the draft
  - Name the gap
  - Change the instruction
  - Generate again and recheck
- **Facilitator notes:** Use the unsupported certification claim as an example. Contrast targeted
  refinement with repeatedly asking “make it better.” The second output still requires review.

### Français

- **Titre :** Améliorer à partir d'un écart observé
- **Message principal :** L'itération est utile lorsque la nouvelle consigne répond à un problème
  précis.
- **Contenu visible :**
  - Contrôler le brouillon
  - Nommer l'écart
  - Modifier la consigne
  - Générer de nouveau puis recontrôler
- **Notes du formateur :** Utiliser l'affirmation non fondée sur la certification comme exemple.
  Opposer une correction ciblée à la répétition de « améliore le texte ». La deuxième sortie doit
  encore être vérifiée.

## S03-12 — Zero-shot / Zero-shot

Duration: **2 minutes**

### English

- **Title:** Direct request: zero-shot
- **Key message:** Use a direct request when the task can be specified without demonstrating an
  answer.
- **On-slide content:**
  - “Using S03-04, list the intake-record fields.”
  - No input → output example supplied
  - Expected facts come from the source
  - Review still applies
- **Facilitator notes:** Zero-shot describes the current prompt, not the model's training history.
  Have learners identify the three expected fields from S03-04 before discussing the response.

### Français

- **Titre :** Demande directe : zero-shot
- **Message principal :** Utiliser une demande directe lorsque la tâche peut être précisée sans
  montrer de réponse.
- **Contenu visible :**
  - « À partir de S03-04, énumère les champs du dossier. »
  - Aucun exemple entrée → sortie fourni
  - Les faits attendus viennent de la source
  - Le contrôle reste nécessaire
- **Notes du formateur :** Zero-shot décrit le prompt courant, pas l'historique d'entraînement du
  modèle. Faire identifier les trois champs attendus dans S03-04 avant de discuter de la réponse.

## S03-13 — Examples / Exemples

Duration: **2 minutes**

### English

- **Title:** One-shot and few-shot: show an example
- **Key message:** Examples can demonstrate a desired structure when words alone leave the format
  ambiguous.
- **On-slide content:**
  - EX-01: date missing → “needs completion: date”
  - EX-02: weight missing → “needs completion: weight”
  - EX-03: lot ID missing → ?
  - Check every example before using it
- **Facilitator notes:** One example is one-shot; several examples are few-shot. The EX records are
  fictional. Expected EX-03 wording is “needs completion: lot ID.” Examples guide the current
  prompt; they do not alter model weights or create business rules.

### Français

- **Titre :** One-shot et few-shot : montrer un exemple
- **Message principal :** Des exemples peuvent montrer une structure souhaitée lorsque le format
  reste difficile à décrire uniquement avec des mots.
- **Contenu visible :**
  - EX-01 : date absente → « à compléter : date »
  - EX-02 : poids absent → « à compléter : poids »
  - EX-03 : identifiant du lot absent → ?
  - Vérifier chaque exemple avant de l'utiliser
- **Notes du formateur :** Un exemple correspond au one-shot ; plusieurs exemples au few-shot. Les
  dossiers EX sont fictifs. La formulation attendue pour EX-03 est « à compléter : identifiant du
  lot ». Les exemples orientent le prompt courant ; ils ne modifient pas les poids du modèle et ne
  créent pas de règle métier.

## S03-14 — Technique selection / Choix de la technique

Duration: **3 minutes**

### English

- **Title:** Choose the technique for the problem
- **Key message:** Use a prompting technique because it addresses a specific uncertainty.
- **On-slide content:**
  - Clear task → direct request
  - Hard-to-describe format → checked example
  - Missing important context → ask first
  - Every path still ends in review
- **Facilitator notes:** Use the existing decision diagram. Ask learners which approach fits the
  staff notice and which fits a fictional record where the missing field has not been identified.

### Français

- **Titre :** Choisir la technique selon le problème
- **Message principal :** Utiliser une technique de prompting parce qu'elle répond à une
  incertitude précise.
- **Contenu visible :**
  - Tâche claire → demande directe
  - Format difficile à décrire → exemple vérifié
  - Contexte important manquant → questionner d'abord
  - Chaque chemin se termine par un contrôle
- **Notes du formateur :** Utiliser le diagramme de décision existant. Demander quelle approche
  convient à l'avis aux agents et laquelle convient à un dossier fictif dont le champ manquant n'a
  pas encore été identifié.

## S03-15 — Interview prompting / Prompting en entretien

Duration: **2 minutes**

### English

- **Title:** Ask before inventing
- **Key message:** Missing context can trigger focused questions instead of unsupported completion.
- **On-slide content:**
  - Who is the audience?
  - Which field is missing?
  - Which approved instruction may be used?
  - “I don't know” remains unknown
- **Facilitator notes:** Explain interview prompting as a way to collect context, not as a way to
  make uncertain information true. Use no real member or customer data.

### Français

- **Titre :** Demander avant d'inventer
- **Message principal :** Un contexte manquant peut déclencher des questions ciblées plutôt qu'un
  ajout non fondé.
- **Contenu visible :**
  - Quel est le public ?
  - Quel champ manque ?
  - Quelle consigne approuvée peut être utilisée ?
  - « Je ne sais pas » reste une inconnue
- **Notes du formateur :** Présenter le prompting en entretien comme une méthode de collecte de
  contexte, pas comme un moyen de rendre vraie une information incertaine. N'utiliser aucune donnée
  réelle de membre ou de client.

## S03-16 — One question at a time / Une question à la fois

Duration: **2 minutes**

### English

- **Title:** Gather context one question at a time
- **Key message:** Separate confirmed information from information that is still missing.
- **On-slide content:**
  - Ask one question at a time
  - Mark unavailable information as unknown
  - Summarize confirmed facts
  - Draft only from what is confirmed
- **Facilitator notes:** Use the real ChatGPT opening-question capture from the fictional exercise.
  The capture demonstrates the first question, not proof of a correct final answer. If the answer
  is unavailable, keep it unknown.

### Français

- **Titre :** Recueillir le contexte une question à la fois
- **Message principal :** Séparer les informations confirmées de celles qui manquent encore.
- **Contenu visible :**
  - Poser une question à la fois
  - Marquer l'information indisponible comme inconnue
  - Résumer les faits confirmés
  - Rédiger seulement à partir de ce qui est confirmé
- **Notes du formateur :** Utiliser la capture de la première question réelle de ChatGPT dans
  l'exercice fictif. La capture montre la première question, pas la preuve d'une réponse finale
  correcte. Si la réponse n'est pas disponible, la conserver comme inconnue.

## S03-17 — Decomposition / Décomposition

Duration: **2 minutes**

### English

- **Title:** Decompose into observable operations
- **Key message:** A multi-step task is easier to inspect when the work products are explicit.
- **On-slide content:**
  1. Record supplied fields
  2. Flag missing information
  3. Draft the provisional notice
  4. Submit it for staff review
- **Facilitator notes:** These are observable work steps, not hidden model reasoning. Each step can
  be compared with the source and may still fail. Human decision-making remains outside the model.

### Français

- **Titre :** Décomposer en opérations observables
- **Message principal :** Une tâche en plusieurs étapes est plus facile à contrôler lorsque les
  résultats intermédiaires sont explicites.
- **Contenu visible :**
  1. Relever les champs fournis
  2. Signaler les informations manquantes
  3. Rédiger l'avis provisoire
  4. Le soumettre à un agent pour contrôle
- **Notes du formateur :** Il s'agit d'étapes de travail observables, pas du raisonnement interne
  caché du modèle. Chaque étape peut être comparée à la source et peut encore échouer. La décision
  humaine reste hors du modèle.

## S03-18 — Comparison and reuse / Comparaison et réutilisation

Duration: **3 minutes**

### English

- **Title:** Compare before you reuse
- **Key message:** Define the criteria before choosing a version to keep as a starting point.
- **On-slide content:**
  - Compare factual support
  - Compare clarity and audience fit
  - Compare format and constraints
  - A useful version may become a reusable template
- **Facilitator notes:** A model ranking its own outputs is not independent verification. A version
  can become a reusable starting point only after human review. Reuse must still account for a new
  source, audience, or constraint.

### Français

- **Titre :** Comparer avant de réutiliser
- **Message principal :** Définir les critères avant de choisir une version à conserver comme point
  de départ.
- **Contenu visible :**
  - Comparer le fondement factuel
  - Comparer la clarté et l'adaptation au public
  - Comparer le format et les contraintes
  - Une version utile peut devenir un modèle réutilisable
- **Notes du formateur :** Le classement de ses propres sorties par un modèle n'est pas une
  vérification indépendante. Une version peut devenir un point de départ réutilisable seulement
  après contrôle humain. La réutilisation doit encore tenir compte d'une nouvelle source, d'un
  nouveau public ou d'une nouvelle contrainte.

## S03-19 — Unsupported claim / Affirmation non fondée

Duration: **4 minutes**

### English

- **Title:** Detect the unsupported claim
- **Key message:** Every operational claim in the draft should be traceable to the supplied source.
- **On-slide content:**
  - Teaching simulation: “Enter the lot, date, and weight.”
  - “Incomplete lots are certified within 24 hours.”
  - Which claims are not supported by S03-04?
  - What should the first sentence say more precisely?
- **Facilitator notes:** Allow reading and pair discussion. Certification and the deadline are
  unsupported. “The lot” should be “lot ID.” This deliberately wrong simulation is not the real
  ChatGPT response shown earlier.

### Français

- **Titre :** Repérer l'affirmation non fondée
- **Message principal :** Chaque affirmation opérationnelle du brouillon doit pouvoir être reliée à
  la source fournie.
- **Contenu visible :**
  - Simulation pédagogique : « Saisissez le lot, la date et le poids. »
  - « Les lots incomplets sont certifiés sous 24 heures. »
  - Quelles affirmations ne sont pas fondées sur S03-04 ?
  - Comment préciser la première phrase ?
- **Notes du formateur :** Prévoir un temps de lecture et d'échange en binôme. La certification et
  le délai ne sont pas fondés. « Le lot » doit être précisé en « identifiant du lot ». Cette
  simulation volontairement erronée n'est pas la vraie réponse ChatGPT montrée plus tôt.

## S03-20 — Targeted revision / Révision ciblée

Duration: **3 minutes**

### English

- **Title:** Correct the specific failure
- **Key message:** A useful follow-up names what failed and requests a new checkable version.
- **On-slide content:**
  - Remove deadline and certification
  - Add no rule absent from S03-04
  - Name lot ID, date, and weight
  - Preserve “needs completion” and staff review
- **Facilitator notes:** Compare the revised simulation with S03-04 line by line. The corrected
  result remains a draft until an authorized person reviews it.

### Français

- **Titre :** Corriger l'écart précis
- **Message principal :** Une relance utile nomme ce qui a échoué et demande une nouvelle version
  vérifiable.
- **Contenu visible :**
  - Supprimer délai et certification
  - N'ajouter aucune règle absente de S03-04
  - Citer identifiant du lot, date et poids
  - Conserver « à compléter » et la vérification par un agent
- **Notes du formateur :** Comparer la simulation révisée à S03-04 ligne par ligne. Le résultat
  corrigé reste un brouillon jusqu'au contrôle d'une personne habilitée.

## S03-21 — Reusable professional prompt / Prompt professionnel réutilisable

Duration: **4 minutes**

### English

- **Title:** Build a reusable professional prompt
- **Key message:** Turn the framework into a checkable template for a repeated task.
- **On-slide content:**
  - 2 min: fill the relevant framework elements
  - Use placeholders for information that will change
  - 1 min: choose direct, example, interview, or decomposition
  - 1 min: exchange, flag one unknown, and name one verification step
- **Facilitator notes:** Learners may work from S03-04 or another safe fictional professional task.
  The template may include role, task, context, audience, format, constraints, and quality criteria.
  Not every field must be filled. Require no real confidential data.

### Français

- **Titre :** Construire un prompt professionnel réutilisable
- **Message principal :** Transformer le cadre en modèle contrôlable pour une tâche répétée.
- **Contenu visible :**
  - 2 min : remplir les éléments utiles du cadre
  - Utiliser des variables pour les informations qui changent
  - 1 min : choisir direct, exemple, entretien ou décomposition
  - 1 min : échanger, relever une inconnue et nommer un contrôle
- **Notes du formateur :** Les participants peuvent partir de S03-04 ou d'une autre tâche
  professionnelle fictive et sûre. Le modèle peut inclure rôle, tâche, contexte, public, format,
  contraintes et critères de qualité. Tous les champs ne sont pas obligatoires. N'exiger aucune
  donnée confidentielle réelle.

## S03-22 — Peer critique / Critique par un pair

Duration: **3 minutes**

### English

- **Title:** Critique another prompt
- **Key message:** Useful feedback identifies a concrete weakness and proposes a targeted change.
- **On-slide content:**
  - Is the task clear?
  - Is enough context supplied?
  - Are audience, format, and constraints usable?
  - Can the quality criteria be checked?
- **Facilitator notes:** Have pairs suggest one specific improvement. Review the prompt, not the
  person. If approval or verification is missing from the broader process, name that separately
  rather than pretending it is an eighth prompt element.

### Français

- **Titre :** Critiquer le prompt d'un autre binôme
- **Message principal :** Un retour utile identifie une faiblesse concrète et propose une correction
  ciblée.
- **Contenu visible :**
  - La tâche est-elle claire ?
  - Le contexte fourni est-il suffisant ?
  - Public, format et contraintes sont-ils exploitables ?
  - Les critères de qualité sont-ils vérifiables ?
- **Notes du formateur :** Demander aux binômes de proposer une amélioration précise. Critiquer le
  prompt, pas la personne. Si la validation ou la vérification manque dans le processus global, la
  nommer séparément sans en faire un huitième élément du prompt.

## S03-23 — Output evaluation / Évaluation de la réponse

Duration: **2 minutes**

### English

- **Title:** Evaluate the answer separately
- **Key message:** A well-framed prompt and an acceptable answer require separate checks.
- **On-slide content:**
  - Facts supported by the source?
  - Audience, format, and constraints respected?
  - Unknowns still visible?
  - Quality criteria satisfied?
  - Responsible human reviewer identified?
- **Facilitator notes:** Ask which check fails for the invented certification promise. A model may
  help inspect text, but self-evaluation is not independent verification. The responsible person
  approves professional use.

### Français

- **Titre :** Évaluer la réponse séparément
- **Message principal :** Un prompt bien cadré et une réponse acceptable exigent deux contrôles
  distincts.
- **Contenu visible :**
  - Faits fondés sur la source ?
  - Public, format et contraintes respectés ?
  - Inconnues toujours visibles ?
  - Critères de qualité satisfaits ?
  - Responsable humain de la validation identifié ?
- **Notes du formateur :** Demander quel contrôle échoue pour la promesse de certification
  inventée. Un modèle peut aider à inspecter un texte, mais son auto-évaluation n'est pas une
  vérification indépendante. La personne responsable valide l'usage professionnel.

## S03-24 — Multimodal transfer / Transfert multimodal

Duration: **2 minutes**

### English

- **Title:** Same method with an image or document
- **Key message:** A new input type changes the source, not the need for careful prompting and
  verification.
- **On-slide content:**
  - Supplied image or document → extract only what is readable
  - Unreadable or absent → mark unknown
  - Apply task, context, format, constraints, and criteria
  - Human review before professional use
- **Facilitator notes:** Briefly connect to canonical multimodal prompting. A convincing image does
  not prove authenticity, and extracted text is not automatically accurate.

### Français

- **Titre :** Même méthode avec une image ou un document
- **Message principal :** Un nouveau type d'entrée change la source, pas le besoin d'une consigne
  précise et d'une vérification.
- **Contenu visible :**
  - Image ou document fourni → relever seulement ce qui est lisible
  - Illisible ou absent → marquer comme inconnu
  - Appliquer tâche, contexte, format, contraintes et critères
  - Contrôle humain avant usage professionnel
- **Notes du formateur :** Relier brièvement au prompting multimodal canonique. Une image
  convaincante ne prouve pas son authenticité et le texte extrait n'est pas automatiquement exact.

## S03-25 — Closing / Clôture

Duration: **1 minute**

### English

- **Title:** Prompting is part of the professional method
- **Key message:** Good instruction design supports professional work only when it remains connected
  to context, safety, verification, and human responsibility.
- **On-slide content:**
  - RESULT → CONTEXT → INSTRUCTION
  - SAFETY → VERIFICATION
  - Structure → evaluate → refine → reuse when appropriate
  - Next: work with documents and information
- **Facilitator notes:** Reinforce that S03 develops the instruction layer in depth. Transition to
  S04: working with documents and information requires the same prompt discipline plus stronger
  source-grounding and verification.

### Français

- **Titre :** Le prompting fait partie de la méthode professionnelle
- **Message principal :** Une bonne conception de la consigne aide le travail professionnel
  seulement si elle reste reliée au contexte, à la sécurité, à la vérification et à la
  responsabilité humaine.
- **Contenu visible :**
  - RÉSULTAT → CONTEXTE → INSTRUCTION
  - SÉCURITÉ → VÉRIFICATION
  - Structurer → évaluer → corriger → réutiliser si pertinent
  - Ensuite : travailler avec des documents et des informations
- **Notes du formateur :** Rappeler que S03 approfondit la couche « instruction ». Faire la
  transition vers S04 : travailler avec des documents et des informations demande la même
  discipline de prompting avec un ancrage dans les sources et une vérification plus poussés.

---

## Canonical-source traceability

| Course 03 area                                  | Primary S03 slides    |
| ----------------------------------------------- | --------------------- |
| Prompt components, context, output, persona     | S03-05–S03-10         |
| Iteration and refinement                        | S03-11, S03-19–S03-20 |
| Zero-shot, one-shot, and few-shot               | S03-12–S03-14         |
| Interview prompting and missing context         | S03-14–S03-16         |
| Task decomposition and alternative formulations | S03-17–S03-18         |
| Evaluation and application                      | S03-18–S03-23         |
| Multimodal prompting                            | S03-24                |
| Wrap-up and transfer                            | S03-21–S03-25         |

Canonical sources remain:

- `courses/03-generative-ai-prompt-engineering-basics/en/01-prompt-engineering-for-generative-ai.md`
- `courses/03-generative-ai-prompt-engineering-basics/en/02-prompt-engineering-techniques-and-approaches.md`
- `courses/03-generative-ai-prompt-engineering-basics/en/03-course-quiz-project-and-wrap-up.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/01-prompt-engineering-for-generative-ai.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/02-prompt-engineering-techniques-and-approaches.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/03-course-quiz-project-and-wrap-up.md`

The fictional anchor case remains documented under:

`docs/teaching/case-studies/cocoa-cooperative-near-soubre.md`

## Professional-practice extensions

The following teaching elements are professional-curriculum extensions rather than automatically
IBM/Coursera source material:

- the seven-element practical prompt framework;
- explicit professional transfer to email, meeting summaries, reports, and presentations;
- reusable prompt-template framing;
- placeholders for repeated tasks;
- explicit distinction between prompt quality, answer quality, and professional authorization;
- the program-wide five-question operating framework.

These extensions derive from the approved professional curriculum design and collaborative
professional-practice input documented in the parent contract and fusion audit.

## Deferred material

S03 intentionally does not provide full treatment of:

- long-document summarization and multi-source comparison — S04;
- end-to-end workflow integration, handoffs, reuse measurement, and value analysis — S05;
- detailed security, privacy, authorization, and sensitive-data governance — S06;
- integrated professional capstone work — S07.

Technical catalogues, model-specific syntax, product inventories, benchmark claims, and historical
tool details remain reference material rather than core 60-minute teaching content.

## Visual implications

The existing visual system should be reused where semantics still match.

Current mapped visual slides are:

- S03-05 — workflow diagram;
- S03-08 — real ChatGPT source-grounded prompt capture;
- S03-13 — fictional example simulation;
- S03-14 — technique-selection diagram;
- S03-16 — real ChatGPT interview-opening capture;
- S03-17 — observable-steps diagram;
- S03-19 — deliberately unsupported draft simulation;
- S03-20 — correction and revised-draft simulation;
- S03-23 — verification diagram.

Visuals must be changed only when their current semantic content no longer supports the revised
slide purpose.

In particular, S03-23 may require adjustment because the professional-fusion contract now makes
quality criteria explicit.

## Animation implications

The current pre-fusion animation baseline is:

```text
25 animated slides
52 clicks
155 shape effects
```

These values are not frozen requirements.

After the bilingual teaching sources are refactored, animation counts must be recalculated from the
actual projected rows and the corresponding test expectation updated if necessary.

The fixed invariants are:

```text
25 slides
60 minutes
bilingual structural alignment
animation content identical to maintained teaching content
```

## Acceptance criteria for implementation

The professional-fusion implementation is accepted only when:

1. English and French contain exactly 25 aligned slides.
2. Each language totals exactly 60 minutes.
3. Slide identifiers and individual durations match across languages.
4. Slide 01 uses the professional-curriculum session title.
5. Slide 01 preserves IBM/Coursera attribution and AI-generation disclosure.
6. The seven-element prompt framework appears before named advanced techniques.
7. The seven elements are role, task, context, audience, format, constraints, and quality criteria.
8. The framework is explicitly described as optional components rather than mandatory syntax.
9. Human review is kept outside the seven prompt elements.
10. The session distinguishes prompt quality from factual reliability.
11. The S03-04 fictional source remains unchanged.
12. No unsupported threshold, deadline, certification, payment, grade, or lot decision is
    introduced.
13. Zero-shot, one-shot, and few-shot terminology remains conceptually accurate.
14. Interview prompting keeps unavailable information unknown.
15. Decomposition uses observable work steps rather than private model reasoning.
16. Technique choice is tied to the problem being solved.
17. Iteration is tied to an observed gap.
18. Quality criteria are explicit before output comparison.
19. A reusable professional prompt template is introduced.
20. Reuse is presented as conditional on renewed context and source checks.
21. Professional transfer extends beyond the cooperative.
22. Exercises require no real confidential data.
23. Human responsibility remains explicit for consequential use.
24. Existing visuals are reused where semantics remain compatible.
25. Animation expectations are recalculated from the implemented teaching sources.
26. PDF and static PPTX artifacts are rebuilt and independently verified.
27. PDF visual QA is completed.
28. Both animated PowerPoint decks receive human slide-show review.
29. A timed delivery rehearsal is completed.
30. The pending personal review of the French canonical Course 03 adaptations remains documented
    until actually completed.
