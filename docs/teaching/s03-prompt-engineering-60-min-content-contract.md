# S03 : contrat de contenu bilingue pour une session de 60 minutes

## Informations de production

- **Programme :** IBM AI Foundations for Everyone / Fondements de l’IA pour tous
- **Session :** S03 : Prompt Engineering Basics / Principes de base de la conception des prompts
- **Durée totale :** 60 minutes dans chaque langue
- **Nombre de diapositives :** 25 en français et 25 en anglais
- **Public :** professionnels et apprenants sans prérequis technique ; S02 est rappelée en deux minutes
- **Cas fil rouge :** une coopérative cacaoyère fictive et sans nom près de Soubré
- **Statut :** proposition de parcours ; les adaptations françaises canoniques du cours 03 attendent encore leur révision personnelle
- **Principe éditorial :** les trois modules canoniques FR et EN restent les documents de référence ; ce contrat sélectionne une activité réalisable en une heure.

## Objectifs observables

À la fin de la séance, une personne peut :

1. construire un prompt avec tâche, contexte, source, public, contraintes et format de sortie ;
2. choisir entre demande directe, exemples et questions préalables selon les informations disponibles ;
3. comparer un brouillon à sa source, relever une invention et affiner la demande ;
4. remettre un brouillon révisé à une personne habilitée en explicitant les inconnues.

## Règles communes aux deux langues

1. Les versions FR et EN ont les identifiants S03-01 à S03-25, les mêmes durées, activités et critères de réussite.
2. Une diapositive porte une idée principale ; les formulations longues et les relances vont dans les notes du formateur.
3. La coopérative, la consigne, les réponses et les écrans sont fictifs. Toute sortie fabriquée porte « simulation pédagogique » ou « teaching simulation » ; elle n’est pas présentée comme la réponse observée d’un modèle.
4. Dans l’exercice, la consigne de réception est uniquement : relever **identifiant du lot, date et poids** ; si un champ manque, marquer le dossier « à compléter » et demander une vérification par un agent. Aucun seuil, délai, paiement, grade ou certificat n’est fourni.
5. Un rôle attribué au modèle, un exemple, une décomposition ou une consigne de vérification peuvent guider la sortie ; aucun de ces procédés ne garantit l’exactitude, la sécurité ou l’autorité professionnelle.
6. Aucun dossier membre réel n’est soumis à un service public pendant la démonstration. Une personne habilitée vérifie et approuve tout message avant diffusion ; les décisions sur les lots et les paiements lui appartiennent.
7. « Sans exemple » et « avec exemples » décrivent le contenu du prompt, sans changer les poids du modèle. Les étapes demandées servent à organiser les contrôles observables, sans prétendre révéler un raisonnement interne privé.

## Répartition du temps

| Séquence                                      | Diapositives    | Minutes |
| --------------------------------------------- | --------------- | ------: |
| Besoin et source de l’exercice                | S03-01 à S03-04 |       7 |
| Construire puis améliorer un prompt           | S03-05 à S03-10 |      15 |
| Choisir exemples, entretien et étapes         | S03-11 à S03-16 |      14 |
| Comparer les options et préparer une pratique | S03-17 à S03-20 |      12 |
| Pratique, contrôle et conclusion              | S03-21 à S03-25 |      12 |
| **Total**                                     | **25**          |  **60** |

---

## S03-01 : Ouverture / Opening

Durée : **1 minute**

### Français

- **Titre :** S03 : concevoir un prompt qui se vérifie
- **Message principal :** Une demande précise prépare un brouillon vérifiable, jamais une décision automatique.
- **Contenu visible :** Session de 60 minutes · même coopérative fictive près de Soubré · un message aux agents de réception.
- **Notes du formateur :** Présenter S03 comme une suite de S02. Les écrans éventuels seront simulés et la rédaction d’un message ne remplacera pas sa validation.

### English

- **Title:** S03: designing a prompt that can be checked
- **Key message:** A precise request prepares a reviewable draft, never an automatic decision.
- **On-slide content:** 60-minute session · same fictional cocoa cooperative near Soubré · one message for intake staff.
- **Facilitator notes:** Connect S03 to S02. Any screens are simulations, and drafting a notice never replaces its approval.

## S03-02 : Résultats attendus / Intended outcomes

Durée : **2 minutes**

### Français

- **Titre :** Quatre gestes pour la séance
- **Message principal :** Concevoir, choisir une technique, vérifier, corriger.
- **Contenu visible :** 1. Cadrer la demande ; 2. choisir direct, exemple ou questions ; 3. contrôler les faits ; 4. proposer une révision.
- **Notes du formateur :** Ces quatre gestes seront évalués sur un exercice court, sans compte ni accès à un service d’IA obligatoire.

### English

- **Title:** Four moves for this session
- **Key message:** Frame, choose a technique, check, and revise.
- **On-slide content:** 1. Frame the request; 2. choose direct, example, or questions; 3. check claims; 4. propose a revision.
- **Facilitator notes:** Assess the four moves through a short exercise that requires no model account or live service.

## S03-03 : Le problème laissé par S02 / The problem from S02

Durée : **2 minutes**

### Français

- **Titre :** Une phrase plausible, un fait absent
- **Message principal :** La réponse de S02 sur une certification « sous 24 heures » était volontairement inventée.
- **Contenu visible :** Consigne fictive → brouillon → phrase sans preuve → contrôle humain ; question : « Où est la source de cette promesse ? »
- **Notes du formateur :** Faire retrouver la phrase erronée de S02-12. Ne pas suggérer qu’un simple meilleur prompt empêche toujours cette erreur.

### English

- **Title:** A plausible sentence, an unsupported claim
- **Key message:** S02’s “certified within 24 hours” line was deliberately fabricated.
- **On-slide content:** Fictional instruction → draft → unsupported line → human check; ask: “Where is the source for this promise?”
- **Facilitator notes:** Recall the incorrect line in S02-12. A stronger prompt can still produce mistakes.

## S03-04 : Source de travail / Exercise source

Durée : **2 minutes**

### Français

- **Titre :** Une consigne brève, des limites nettes
- **Message principal :** Le texte source sert à contrôler chaque affirmation du futur message.
- **Contenu visible :** Simulation pédagogique : relever identifiant du lot, date et poids ; champ manquant → « à compléter », puis vérification par un agent ; aucune autre règle fournie.
- **Notes du formateur :** Reprendre exactement la source fictive de S02-10. Laisser la consigne affichée ou accessible pendant l’exercice ; ce n’est pas une réglementation.

### English

- **Title:** A short instruction with clear boundaries
- **Key message:** The source text lets us check every claim in the proposed notice.
- **On-slide content:** Teaching simulation: record lot ID, date, and weight; missing field → “needs completion”, then staff review; no other rule supplied.
- **Facilitator notes:** Reuse the exact fictional instruction from S02-10. Keep it available during the exercise; it is not a regulation.

## S03-05 : Qu’est-ce qu’un prompt ? / What is a prompt?

Durée : **3 minutes**

### Français

- **Titre :** De la tâche à la réponse
- **Message principal :** Un prompt fournit une demande et, si nécessaire, les données qui la rendent réalisable.
- **Contenu visible :** Tâche + contexte + données d’entrée + sortie attendue → proposition → évaluation et affinage.
- **Notes du formateur :** Montrer les quatre composantes du module 03.01. Une nouvelle demande change le contexte de génération, pas l’entraînement du modèle.

### English

- **Title:** From task to proposed response
- **Key message:** A prompt supplies a request and, where needed, the input that makes it actionable.
- **On-slide content:** Task + context + input data + output requirements → proposal → review and refinement.
- **Facilitator notes:** Present the four components from module 03.01. A new request changes the generation context, not the model’s training.

## S03-06 : Première demande / First request

Durée : **2 minutes**

### Français

- **Titre :** « Rédige un message » laisse des trous
- **Message principal :** Une demande vague ne précise ni destinataire ni faits autorisés.
- **Contenu visible :** « Rédige un message sur la réception des lots. » · Quelles informations le modèle devrait-il utiliser ?
- **Notes du formateur :** Faire nommer oralement public, source et format manquants. La phrase n’est pas une sortie observée ; c’est un prompt de départ construit pour la séance.

### English

- **Title:** “Write a message” leaves gaps
- **Key message:** A vague request omits the audience and the permitted facts.
- **On-slide content:** “Write a message about lot intake.” · What information should the model use?
- **Facilitator notes:** Ask learners to name the missing audience, source, and format. This is a constructed starting prompt, not an observed output.

## S03-07 : Anatomie utile / Useful anatomy

Durée : **3 minutes**

### Français

- **Titre :** Six éléments pour cadrer la demande
- **Message principal :** Une structure explicite donne des critères pour juger le résultat.
- **Contenu visible :** Tâche · public · source · contraintes · format · vérification humaine.
- **Notes du formateur :** Rattacher tâche, contexte, données et indicateurs de sortie aux quatre composantes canoniques. Les six éléments sont une grille pédagogique, non une formule universelle.

### English

- **Title:** Six elements to frame the request
- **Key message:** An explicit structure supplies criteria for reviewing the result.
- **On-slide content:** Task · audience · source · constraints · format · human review.
- **Facilitator notes:** Map these six teaching cues back to the canonical task, context, input, and output indicators. They are a practical checklist, not a universal formula.

## S03-08 : Prompt structuré / Structured prompt

Durée : **2 minutes**

### Français

- **Titre :** Une demande ancrée dans la source
- **Message principal :** Définir ce qui est fourni et ce qui ne peut pas être ajouté.
- **Contenu visible :** « Rédige pour les agents, en français, un avis bref à partir de la consigne S03-04. Cite les trois champs. Si un champ manque, demande la vérification. N’invente ni seuil ni certification. »
- **Notes du formateur :** Montrer la construction du prompt, sans promettre qu’il sera respecté automatiquement. Un exemple de prompt est une nouvelle adaptation pédagogique, pas un extrait littéral du cours.

### English

- **Title:** A request grounded in the source
- **Key message:** Define what has been supplied and what cannot be added.
- **On-slide content:** “Draft a short notice for staff using the S03-04 instruction. Name the three fields. If one is missing, request review. Invent no threshold or certification.”
- **Facilitator notes:** Explain the prompt’s structure without promising automatic compliance. This teaching prompt is newly adapted, not a verbatim course extract.

## S03-09 : Public et format / Audience and format

Durée : **3 minutes**

### Français

- **Titre :** Un avis destiné à être lu
- **Message principal :** Un format bref et un public précis facilitent la révision.
- **Contenu visible :** Destinataire : agents de réception · français simple · deux phrases · garder « à compléter » si le dossier est incomplet.
- **Notes du formateur :** Comparer à un message destiné aux producteurs : le vocabulaire et l’action demandée changeraient. Une limite de longueur ne valide pas les faits.

### English

- **Title:** A notice people can read
- **Key message:** A clear audience and short format make review easier.
- **On-slide content:** Audience: intake staff · plain language · two sentences · retain “needs completion” for an incomplete record.
- **Facilitator notes:** Compare with a producer-facing notice: wording and requested action would change. A length limit does not validate facts.

## S03-10 : Rôle et autorité / Role and authority

Durée : **2 minutes**

### Français

- **Titre :** Le rôle oriente, il ne certifie rien
- **Message principal :** « Tu aides l’équipe » cadre le ton mais ne confère aucune compétence réglementaire.
- **Contenu visible :** Rôle suggéré : aide à la rédaction · décision réelle : agent et responsable habilités.
- **Notes du formateur :** Faire distinguer persona et délégation d’autorité. Ne demander ni diagnostic de culture, ni décision d’acceptation de lot, ni paiement.

### English

- **Title:** A role guides; it does not certify
- **Key message:** “Assist the team” frames the tone but grants no regulatory competence.
- **On-slide content:** Suggested role: drafting assistant · real decision: authorized staff and procedure owner.
- **Facilitator notes:** Distinguish a persona from actual authority. Do not ask it to diagnose crops, accept lots, or decide payments.

## S03-11 : Boucle d’amélioration / Improvement loop

Durée : **3 minutes**

### Français

- **Titre :** Évaluer avant de réécrire
- **Message principal :** L’itération corrige un écart observé avec la source et le besoin.
- **Contenu visible :** Prompt → brouillon → contrôle des faits, du public et du format → correction ciblée → nouveau contrôle.
- **Notes du formateur :** Réutiliser la phrase de certification inventée en S02 : retirer l’affirmation absente de la consigne et retester, puis faire contrôler la nouvelle version par une personne.

### English

- **Title:** Review before rewriting
- **Key message:** Iteration addresses a gap found against the source and intended use.
- **On-slide content:** Prompt → draft → check facts, audience, and format → targeted change → recheck.
- **Facilitator notes:** Reuse the invented certification line from S02: remove the unsupported claim, retest, then have a person review the new version.

## S03-12 : Sans exemple / Without an example

Durée : **2 minutes**

### Français

- **Titre :** Zero-shot : la tâche sans démonstration
- **Message principal :** Une instruction complète peut être donnée sans exemple de réponse.
- **Contenu visible :** « À partir de S03-04, énumère les champs d’un dossier de réception pour les agents. » · Aucun couple entrée → sortie fourni.
- **Notes du formateur :** Zero-shot décrit le prompt courant, pas l’histoire d’entraînement du modèle. Une demande directe reste soumise à la vérification.

### English

- **Title:** Zero-shot: the task without a demonstration
- **Key message:** A complete instruction may be given without a sample answer.
- **On-slide content:** “Using S03-04, list the intake-record fields for staff.” · No input → output pair supplied.
- **Facilitator notes:** Zero-shot describes the current prompt, not the model’s training history. Review still applies.

## S03-13 : Avec exemple / With an example

Durée : **2 minutes**

### Français

- **Titre :** Few-shot : montrer le format
- **Message principal :** Quelques paires fictives montrent la présentation attendue, sans créer de nouveaux faits.
- **Contenu visible :** « Lot EX-01, date absente → à compléter : date » · « Lot EX-02, poids absent → à compléter : poids » · À traiter : « Lot EX-03, identifiant absent → ? »
- **Notes du formateur :** Lire la réponse attendue : « à compléter : identifiant du lot ». Les exemples EX sont fabriqués pour l’exercice, et la personne vérifie le vrai dossier dans son système autorisé.

### English

- **Title:** Few-shot: show the format
- **Key message:** A few fictional pairs illustrate the expected structure without adding facts.
- **On-slide content:** “Lot EX-01, date missing → needs completion: date” · “Lot EX-02, weight missing → needs completion: weight” · Try: “Lot EX-03, ID missing → ?”
- **Facilitator notes:** Expected text: “needs completion: lot ID.” The EX records are constructed for practice; a person checks the actual record in an approved system.

## S03-14 : Choisir l’exemple / When to add an example

Durée : **3 minutes**

### Français

- **Titre :** Ajouter un exemple pour une raison
- **Message principal :** L’exemple aide surtout si le format de la réponse reste ambigu.
- **Contenu visible :** Tâche claire → demande directe · format difficile à décrire → exemple fictif · faits absents → questions avant rédaction.
- **Notes du formateur :** Faire choisir une approche pour le message aux agents et une pour un dossier incomplet. Un exemple erroné peut transmettre une mauvaise règle ; vérifier chaque démonstration.

### English

- **Title:** Add an example for a reason
- **Key message:** An example is useful when the intended output format is hard to describe.
- **On-slide content:** Clear task → direct request · tricky format → fictional example · missing facts → questions before drafting.
- **Facilitator notes:** Ask learners to choose an approach for the staff notice and an incomplete record. A wrong example can teach a wrong rule; review each demonstration.

## S03-15 : Questions préalables / Questions first

Durée : **2 minutes**

### Français

- **Titre :** Entretien : demander avant d’inventer
- **Message principal :** Quand le contexte manque, poser des questions ciblées avant de rédiger.
- **Contenu visible :** « Quel est le public ? » · « Quel champ manque ? » · « Quelle consigne approuvée puis-je utiliser ? »
- **Notes du formateur :** Une réponse « je ne sais pas » demeure une inconnue. La demande de contexte ne transforme pas une donnée non vérifiée en fait.

### English

- **Title:** Interview: ask before inventing
- **Key message:** When context is missing, gather it with focused questions before drafting.
- **On-slide content:** “Who is the audience?” · “Which field is missing?” · “Which approved instruction may I use?”
- **Facilitator notes:** “I do not know” remains an unknown. Asking for context does not make an unverified value factual.

## S03-16 : Une question à la fois / One question at a time

Durée : **2 minutes**

### Français

- **Titre :** Construire une demande d’entretien
- **Message principal :** Poser les questions nécessaires, puis proposer un brouillon limité aux réponses confirmées.
- **Contenu visible :** « Pose-moi une question à la fois. Si une réponse n’est pas disponible, marque-la comme inconnue. Avant de rédiger, résume les faits confirmés. »
- **Notes du formateur :** Simuler la première question et une réponse inconnue. Éviter de saisir des informations personnelles de membres pendant l’exercice.

### English

- **Title:** Build an interview request
- **Key message:** Ask what is needed, then draft only from confirmed answers.
- **On-slide content:** “Ask one question at a time. Mark unavailable answers as unknown. Summarize confirmed facts before drafting.”
- **Facilitator notes:** Simulate the first question and an unknown answer. Do not enter member personal data during the exercise.

## S03-17 : Travail en étapes / Work in stages

Durée : **2 minutes**

### Français

- **Titre :** Décomposer les contrôles observables
- **Message principal :** Une tâche complexe peut être répartie en vérifications lisibles.
- **Contenu visible :** 1. Relever les champs fournis ; 2. marquer les absences ; 3. rédiger l’avis ; 4. soumettre à l’agent.
- **Notes du formateur :** Il s’agit d’étapes de travail et de traces vérifiables, pas d’une demande de révéler le raisonnement interne du modèle. La sortie doit pouvoir être comparée à la source.

### English

- **Title:** Split the observable checks
- **Key message:** A complex task can be divided into steps a person can inspect.
- **On-slide content:** 1. List supplied fields; 2. flag missing ones; 3. draft the notice; 4. send to staff for review.
- **Facilitator notes:** These are workflow steps and checkable evidence, not a request for hidden model reasoning. Compare the output with the source.

## S03-18 : Options à comparer / Alternatives to compare

Durée : **3 minutes**

### Français

- **Titre :** Deux formulations, mêmes faits
- **Message principal :** Comparer des versions selon des critères explicites, pas selon la seule fluidité.
- **Contenu visible :** Option A : note pour agents · option B : rappel très bref · critères : exactitude, clarté, ton, longueur.
- **Notes du formateur :** Faire voter sur le critère prioritaire. L’exploration en branches ou la comparaison par paires du cours ne constitue pas un contrôle indépendant si le modèle évalue ses propres textes.

### English

- **Title:** Two phrasings, the same facts
- **Key message:** Compare candidates against explicit criteria, not fluency alone.
- **On-slide content:** Option A: staff note · option B: very short reminder · criteria: accuracy, clarity, tone, length.
- **Facilitator notes:** Ask which criterion matters most. Exploring branches or pairwise comparison is not independent review if the model grades its own text.

## S03-19 : Contre-exemple simulé / Simulated counterexample

Durée : **4 minutes**

### Français

- **Titre :** Repérer l’invention
- **Message principal :** La vérification revient à localiser chaque affirmation dans la consigne S03-04.
- **Contenu visible :** Simulation pédagogique : « Saisissez le lot, la date et le poids. Les lots incomplets sont certifiés sous 24 heures. » · Quelle partie est injustifiée ?
- **Notes du formateur :** Accorder une minute de lecture et une minute d’échange. La deuxième phrase invente certification et délai. La première doit également reprendre exactement « identifiant du lot ». Faire corriger le brouillon plutôt que noter sa fluidité.

### English

- **Title:** Spot the invented claim
- **Key message:** Checking means locating every statement in the S03-04 instruction.
- **On-slide content:** Teaching simulation: “Enter the lot, date, and weight. Incomplete lots are certified within 24 hours.” · Which part lacks support?
- **Facilitator notes:** Allow one minute of reading and one minute of discussion. The second sentence invents certification and a deadline. The first should specify “lot ID.” Correct the draft rather than praise its fluency.

## S03-20 : Prompt de correction / Revision request

Durée : **3 minutes**

### Français

- **Titre :** Corriger l’écart précis
- **Message principal :** Une nouvelle demande identifie les faits à retirer et exige un nouveau contrôle.
- **Contenu visible :** « Supprime le délai et la certification : absents de S03-04. N’ajoute aucune règle. Indique les champs et la vérification par un agent. »
- **Notes du formateur :** Faire comparer la version simulée corrigée à la consigne. La correction est un brouillon tant que le responsable ne l’a pas approuvée.

### English

- **Title:** Revise the specific gap
- **Key message:** A follow-up request identifies unsupported facts and calls for another check.
- **On-slide content:** “Remove the deadline and certification: neither appears in S03-04. Add no rules. State the fields and staff review.”
- **Facilitator notes:** Compare the simulated revision with the source. The corrected version remains a draft until its owner approves it.

## S03-21 : Exercice en binôme / Pair exercise

Durée : **4 minutes**

### Français

- **Titre :** Écrire un prompt révisable
- **Message principal :** Chaque binôme transforme la consigne en demande contrôlable.
- **Contenu visible :** 2 min : écrire tâche, public, source, format et limite · 1 min : choisir direct, exemple ou entretien · 1 min : échanger et relever une inconnue.
- **Notes du formateur :** Distribuer S03-04 et la grille S03-23. Sans accès à un modèle, faire rédiger un brouillon humain simulé. Aucune donnée personnelle réelle.

### English

- **Title:** Write a prompt people can revise
- **Key message:** Each pair turns the instruction into a request that can be checked.
- **On-slide content:** 2 min: write task, audience, source, format, and limits · 1 min: choose direct, example, or interview · 1 min: exchange and flag an unknown.
- **Facilitator notes:** Supply S03-04 and the S03-23 checklist. Without model access, draft a human-written simulated answer. Use no real personal data.

## S03-22 : Retour du binôme / Pair review

Durée : **3 minutes**

### Français

- **Titre :** Critiquer une demande utilement
- **Message principal :** Un retour utile cite l’élément absent et propose une correction ciblée.
- **Contenu visible :** « Source ? » · « Action si champ manquant ? » · « Format pour les agents ? » · « Qui approuve ? »
- **Notes du formateur :** Deux binômes partagent un seul ajustement chacun. Ne pas demander de produire un verdict sur un lot réel.

### English

- **Title:** Give useful feedback on a prompt
- **Key message:** Useful feedback identifies a missing element and a targeted change.
- **On-slide content:** “Source?” · “What if a field is missing?” · “Format for staff?” · “Who approves?”
- **Facilitator notes:** Have two pairs share one change each. Do not request a decision about a real lot.

## S03-23 : Grille de contrôle / Review checklist

Durée : **2 minutes**

### Français

- **Titre :** La réponse doit passer quatre contrôles
- **Message principal :** Une bonne consigne et une belle réponse restent à vérifier séparément.
- **Contenu visible :** Faits tirés de S03-04 ? · public et format adaptés ? · inconnues visibles ? · personne chargée de la validation identifiée ?
- **Notes du formateur :** Répondre « non » à tout texte qui invente un délai ou une certification. Le responsable du procédé peut approuver une version après vérification, pas le modèle.

### English

- **Title:** The response must pass four checks
- **Key message:** Review the request and the proposed answer separately.
- **On-slide content:** Facts from S03-04? · audience and format fit? · unknowns visible? · reviewer identified?
- **Facilitator notes:** Mark unsupported deadlines or certification as failing the fact check. The procedure owner, not the model, can approve a version after review.

## S03-24 : Transfert à d’autres médias / Transfer to other media

Durée : **2 minutes**

### Français

- **Titre :** Même méthode, autre entrée
- **Message principal :** Une photo d’étiquette ou un document ajoute une source à lire et à vérifier.
- **Contenu visible :** Image fournie → relever seulement les champs lisibles · illisible → « inconnu » · vérification humaine avant usage.
- **Notes du formateur :** Mentionner la multimodalité du module 03.02 et les prompts d’image du module 03.03 sans nouvelle démonstration longue. Ne pas confondre jolie image, véritable étiquette et preuve de traçabilité.

### English

- **Title:** Same method, another input
- **Key message:** A label photo or document adds a source to read and check.
- **On-slide content:** Supplied image → extract only legible fields · unreadable → “unknown” · human review before use.
- **Facilitator notes:** Briefly connect module 03.02 multimodal prompts and module 03.03 image prompting. A convincing image is not a real label or traceability evidence.

## S03-25 : Clôture / Closing

Durée : **1 minute**

### Français

- **Titre :** La source avant la formulation
- **Message principal :** Choisir une technique, observer la sortie, corriger, puis confier la validation à la bonne personne.
- **Contenu visible :** Besoin → source → prompt → contrôle → décision humaine.
- **Notes du formateur :** Faire reformuler la première question à se poser : « Quels faits puis-je utiliser ? » Rappeler que la durée réelle sera vérifiée en répétition chronométrée.

### English

- **Title:** Source before phrasing
- **Key message:** Choose a technique, inspect the output, revise, and send it to the right human reviewer.
- **On-slide content:** Need → source → prompt → check → human decision.
- **Facilitator notes:** Ask: “Which facts may I use?” Actual timing still requires a timed rehearsal.

---

## Traçabilité vers les sources canoniques

| Module du cours 03                       | Diapositives principales         |
| ---------------------------------------- | -------------------------------- |
| 01 : composants, itération et persona    | S03-03 à S03-12, S03-19 à S03-23 |
| 02 : exemples, entretien et alternatives | S03-12 à S03-18, S03-21, S03-24  |
| 03 : bilan et application multimodale    | S03-21 à S03-25                  |

- **Sources françaises :** [module 01](../../courses/03-generative-ai-prompt-engineering-basics/fr/01-prompt-engineering-for-generative-ai.md), [module 02](../../courses/03-generative-ai-prompt-engineering-basics/fr/02-prompt-engineering-techniques-and-approaches.md), [module 03](../../courses/03-generative-ai-prompt-engineering-basics/fr/03-course-quiz-project-and-wrap-up.md).
- **English sources:** [module 01](../../courses/03-generative-ai-prompt-engineering-basics/en/01-prompt-engineering-for-generative-ai.md), [module 02](../../courses/03-generative-ai-prompt-engineering-basics/en/02-prompt-engineering-techniques-and-approaches.md), [module 03](../../courses/03-generative-ai-prompt-engineering-basics/en/03-course-quiz-project-and-wrap-up.md).
- **Cas fil rouge / Recurring case:** [coopérative fictive près de Soubré](../case-studies/cocoa-cooperative-near-soubre.md).
- **Transition précédente :** [contrat S02](./s02-generative-ai-60-min-content-contract.md), diapositives S02-10 à S02-14 et S02-26.

## Arbitrages éditoriaux avant production

- Les adaptations françaises du cours 03 indiquent encore « révision personnelle non terminée ». Faire valider le sens et les termes clés par le responsable pédagogique avant une version définitive.
- La consigne fictive S03-04 et les exemples EX-01 à EX-03 sont construits pour la séance ; ce ne sont ni une procédure réelle, ni des sorties de laboratoire Coursera conservées.
- L’activité papier fonctionne sans connexion ou compte de modèle. Une éventuelle capture de prompt ou de réponse sera étiquetée simulation et rapprochée de la consigne.
- Les modèles, marques, interfaces, prix et promesses de performance des notes enregistrées ne servent pas de preuves sur les outils disponibles au moment de la formation.
- Les 60 minutes sont une allocation éditoriale à vérifier à voix haute avec le support projeté, questions et transitions comprises.

## Contenus laissés dans les références ou les notes

- Catalogues de produits, paramètres techniques, syntaxe propre à un modèle et historique des outils.
- Démonstration complète des branches de raisonnement, des tournois de réponses et des cinq laboratoires du module 02.
- Répétition, pondération et exclusions pour l’image, qui dépendent de l’outil et dépassent l’exercice central.
- Quiz, scores, sorties absentes de laboratoires et affirmations de capacité sans vérification indépendante.
- Décisions réelles de qualité, de certification, de paiement ou de publication au nom d’une coopérative.

## Critères d’acceptation du futur support

- 25 diapositives dans chaque langue, dans le même ordre et avec les mêmes durées : **60 minutes** par langue.
- Chaque étape de l’exercice, source, technique choisie et contrôle humain possède un équivalent FR et EN.
- Les faits de la consigne restent identiques à S02-10 ; les simulations sont identifiées comme telles.
- Les notes expliquent les interventions et les transitions ; le texte projeté reste lisible.
- Le support donne le temps d’écrire, d’échanger et de corriger sans obliger à utiliser un modèle en direct.
- Vérification de la mise en page, des notes et de l’animation dans PowerPoint, puis répétition chronométrée avant diffusion.
