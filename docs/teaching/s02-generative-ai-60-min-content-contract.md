# S02 : contrat de contenu bilingue pour une session de 60 minutes

## Informations de production

- **Programme :** IBM AI Foundations for Everyone / Fondements de l’IA pour tous
- **Session :** S02 : Generative AI — Introduction and Applications / IA générative : introduction et applications
- **Durée totale :** 60 minutes
- **Nombre de diapositives :** 26 en français et 26 en anglais
- **Public :** professionnels et apprenants sans prérequis technique ; S01 peut être rappelée en deux minutes
- **Cas fil rouge :** une coopérative cacaoyère fictive et sans nom près de Soubré
- **Statut :** proposition de parcours pédagogique ; les adaptations françaises du cours 02 restent à réviser personnellement avant validation du contenu définitif
- **Principe éditorial :** les trois modules canoniques en français et en anglais restent les documents de référence ; ce contrat sélectionne le parcours de la séance.

## Objectifs observables

À la fin de la séance, une personne peut :

1. distinguer une sortie générée d’une classification ou d’une prévision ;
2. relier un besoin à un format de sortie : texte, image, audio, vidéo, code ou données synthétiques ;
3. examiner un brouillon généré et repérer un fait inventé ou une étape non autorisée ;
4. proposer un usage métier limité, un contrôle humain et un critère d’évaluation.

## Règles communes aux deux langues

1. Les diapositives FR et EN utilisent les mêmes identifiants S02-01 à S02-26, le même ordre, les mêmes durées et les mêmes interactions.
2. Une diapositive développe une seule idée centrale ; le détail reste dans les notes.
3. La coopérative, ses documents, ses données et ses outils sont fictifs. Les démonstrations simulées portent la mention « simulation pédagogique » ou « teaching simulation ».
4. Une demande à un modèle ne l’entraîne pas de nouveau. Un texte plausible ne démontre ni exactitude ni autorisation de publication.
5. Les décisions relatives aux lots, aux paiements, aux inspections et aux certifications restent entre les mains des personnes habilitées.
6. Les exemples évitent les données réelles des membres et ne présentent aucun outil nommé, prix, quota, interface ou chiffre historique comme actuellement vérifié.
7. S02 introduit les sorties et leur évaluation ; S03 abordera en détail les techniques de conception des prompts.

## Répartition du temps

| Séquence                                     | Diapositives    | Minutes |
| -------------------------------------------- | --------------- | ------: |
| Repères et besoin métier                     | S02-01 à S02-06 |      11 |
| Capacités, applications et source de travail | S02-07 à S02-10 |       9 |
| Démonstration textuelle et examen            | S02-11 à S02-15 |      14 |
| Autres médias, code et agents                | S02-16 à S02-21 |      14 |
| Mise en pratique et clôture                  | S02-22 à S02-26 |      12 |
| **Total**                                    | **26**          |  **60** |

---

## S02-01 : Ouverture / Opening

Durée : **1 minute**

### Français

- **Titre :** IA générative : introduction et applications
- **Message principal :** La session passe des notions d’IA à la production de contenus utiles et vérifiables.
- **Contenu visible :**
  - S02 : session de 60 minutes
  - Cas fictif : une coopérative cacaoyère près de Soubré
- **Notes du formateur :** Situer S02 après les fondements de S01. Expliquer que les exemples et captures de la séance sont des simulations pédagogiques, et que les notes complètes restent disponibles séparément.

### English

- **Title:** Generative AI: Introduction and Applications
- **Key message:** This session moves from AI concepts to useful content that people can review.
- **On-slide content:**
  - S02: 60-minute session
  - Fictional case: a cocoa cooperative near Soubré
- **Facilitator notes:** Position S02 after the AI fundamentals session. Explain that the examples and screens are teaching simulations and that the full reference notes remain available separately.

## S02-02 : Objectifs / Objectives

Durée : **2 minutes**

### Français

- **Titre :** Quatre gestes pour utiliser la génération
- **Message principal :** On choisit une sortie, on produit un brouillon, puis on vérifie son adéquation au besoin.
- **Contenu visible :**
  - Distinguer générer, classer et prévoir
  - Choisir une sortie adaptée au besoin
  - Vérifier faits, droits et limites
  - Définir la décision humaine
- **Notes du formateur :** Présenter ces quatre gestes comme les critères de réussite de la séance. Préciser que l’objectif n’est pas de mémoriser une liste de marques ou de modèles.

### English

- **Title:** Four steps for using generation
- **Key message:** Choose an output, produce a draft, and check whether it meets the need.
- **On-slide content:**
  - Distinguish generating, classifying, and forecasting
  - Choose an output that fits the need
  - Check facts, rights, and limitations
  - Define the human decision
- **Facilitator notes:** Introduce these four steps as the session’s success criteria. Explain that memorizing product or model names is not the aim.

## S02-03 : Rappel de S01 / S01 recap

Durée : **2 minutes**

### Français

- **Titre :** Partir de la tâche, pas de l’outil
- **Message principal :** Une classification, une prévision et une génération répondent à des questions différentes.
- **Contenu visible :**
  - Rapport incomplet ? → classer
  - Volume de collecte à venir ? → estimer
  - Avis aux agents ? → rédiger un brouillon
- **Notes du formateur :** Demander aux participants quelle sortie est attendue dans chaque cas. Mentionner qu’un même système peut prendre en charge plusieurs types de tâches ; la distinction porte ici sur le besoin et la sortie, pas sur une frontière absolue entre produits.

### English

- **Title:** Start with the task, not the tool
- **Key message:** Classification, forecasting, and generation answer different questions.
- **On-slide content:**
  - Incomplete report? → classify
  - Future collection volume? → estimate
  - Notice to staff? → draft text
- **Facilitator notes:** Ask participants what output each task needs. A single system may perform several tasks; this distinction concerns the request and output, not an absolute division between products.

## S02-04 : Situation de la coopérative / Cooperative situation

Durée : **2 minutes**

### Français

- **Titre :** Une consigne de réception à communiquer
- **Message principal :** Le travail commence par un besoin opérationnel et une source définie pour l’exercice.
- **Contenu visible :**
  - Coopérative fictive près de Soubré
  - Besoin : rappeler les champs d’un dossier de réception
  - Public : agents de terrain, puis producteurs membres
  - Point de départ : une consigne fictive fournie pour la démonstration
- **Notes du formateur :** Reprendre le cas partagé avec S01. Ne pas présenter la consigne inventée de la séance comme une règle d’une coopérative réelle ou une obligation réglementaire. Aucune donnée de membre ou de lot réel n’est montrée.

### English

- **Title:** Communicating a lot-intake instruction
- **Key message:** The work begins with an operational need and an exercise source.
- **On-slide content:**
  - Fictional cooperative near Soubré
  - Need: remind staff of intake-record fields
  - Audiences: field agents, then member producers
  - Starting point: a fictional instruction supplied for this demonstration
- **Facilitator notes:** Return to the case shared with S01. Do not present the invented instruction as a real cooperative rule or legal requirement. No real member or lot data is shown.

## S02-05 : Discriminer ou générer / Classify or generate

Durée : **2 minutes**

### Français

- **Titre :** Même dossier, deux sorties
- **Message principal :** Détecter un champ manquant n’est pas la même tâche que rédiger un message.
- **Contenu visible :**
  - Entrée : un dossier de réception fictif
  - Sortie A : « à compléter » → classement
  - Sortie B : explication aux agents → génération
- **Notes du formateur :** Montrer que la classification répond à une question définie, alors que la génération propose du contenu. Le statut automatique ne valide ni la qualité du lot ni une certification ; un agent vérifie le dossier.

### English

- **Title:** One record, two outputs
- **Key message:** Flagging a missing field and drafting an explanation are different tasks.
- **On-slide content:**
  - Input: a fictional intake record
  - Output A: “needs completion” → classification
  - Output B: explanation for staff → generation
- **Facilitator notes:** Classification answers a defined question; generation proposes content. An automatic label does not approve a lot’s quality or certification. A staff member reviews the record.

## S02-06 : Entraînement et demande / Training and request

Durée : **2 minutes**

### Français

- **Titre :** Ce que fait le modèle pendant la séance
- **Message principal :** Le modèle utilise des régularités déjà apprises et la demande fournie pour produire un brouillon.
- **Contenu visible :**
  - Entraînement antérieur → capacités du modèle
  - Consigne de l’exercice → sortie proposée
  - Examen humain → correction ou abandon
- **Notes du formateur :** Utiliser un schéma en trois étapes. Une nouvelle demande ne réentraîne pas le modèle. Ne pas promettre que le système connaît les procédures internes s’il ne les reçoit pas dans un dispositif autorisé.

### English

- **Title:** What the model does during the session
- **Key message:** The model uses previously learned patterns and the supplied request to propose a draft.
- **On-slide content:**
  - Earlier training → model capability
  - Exercise request → proposed output
  - Human review → correction or rejection
- **Facilitator notes:** Use a three-step diagram. A new request does not retrain the model. Do not imply it knows internal procedures unless an authorized system supplies them.

## S02-07 : Domaines de sortie / Output types

Durée : **3 minutes**

### Français

- **Titre :** Sept domaines, un critère : la sortie
- **Message principal :** Le cours présente sept familles de contenus générés ; toutes ne demandent pas une démonstration en direct.
- **Contenu visible :**
  - Texte, image, audio, vidéo, code
  - Données synthétiques, mondes virtuels
  - Pour chaque famille : quel résultat examiner ?
- **Notes du formateur :** Donner un exemple bref par famille. Distinguer données synthétiques et données observées, univers virtuel et analyse d’un comportement existant. Réserver les détails des familles de modèles à la documentation de référence.

### English

- **Title:** Seven types of generated output
- **Key message:** The course introduces seven content families; they do not all need a live demonstration.
- **On-slide content:**
  - Text, images, audio, video, code
  - Synthetic data, virtual worlds
  - For each family: what result should we examine?
- **Facilitator notes:** Give one short example per family. Distinguish synthetic from observed data, and a virtual world from analysis of existing behavior. Keep model-family details in the reference material.

## S02-08 : Capacité et application / Capability and application

Durée : **2 minutes**

### Français

- **Titre :** Une capacité devient utile dans un processus
- **Message principal :** Générer du texte est une capacité ; préparer un document revu par une équipe est une application.
- **Contenu visible :**
  - Éducation : brouillon de support → enseignant
  - Développement : code proposé → tests
  - Coopérative fictive : avis préparé → responsable
- **Notes du formateur :** Relier besoin, sortie et contrôle. Les exemples sectoriels du cours illustrent des possibilités ; ils ne prouvent ni déploiement ni gain pour la coopérative.

### English

- **Title:** A capability becomes useful in a workflow
- **Key message:** Generating text is a capability; preparing a team-reviewed document is an application.
- **On-slide content:**
  - Education: draft material → teacher
  - Development: proposed code → tests
  - Fictional cooperative: drafted notice → manager
- **Facilitator notes:** Connect the need, output, and check. The course’s industry examples illustrate possibilities; they do not establish deployment or benefit for the cooperative.

## S02-09 : Choisir la sortie / Choose an output

Durée : **2 minutes**

### Français

- **Titre :** Une campagne, plusieurs formats
- **Message principal :** Le format se choisit selon le public et la preuve nécessaire.
- **Contenu visible :**
  - Agent de terrain → avis textuel
  - Formation interne → visuel ou briefing audio
  - Équipe technique → guide HTML testé
  - Même consigne fictive, contrôles différents
- **Notes du formateur :** Présenter la matrice « public / sortie / vérification ». Un outil audio suppose langue, droits et conditions d’usage adéquats. Un guide HTML est un support statique, pas un système de traçabilité déployé.

### English

- **Title:** One campaign, several formats
- **Key message:** Choose the output format for the audience and the evidence required.
- **On-slide content:**
  - Field agent → text notice
  - Internal training → visual or spoken briefing
  - Technical team → tested HTML guide
  - Same fictional instruction, different checks
- **Facilitator notes:** Show the “audience / output / verification” matrix. Audio requires suitable language support, rights, and usage terms. An HTML guide is a static aid, not a deployed traceability system.

## S02-10 : Source de l’exercice / Exercise source

Durée : **2 minutes**

### Français

- **Titre :** Une consigne fictive et limitée
- **Message principal :** Une source courte permet de vérifier si le brouillon ajoute des faits absents.
- **Contenu visible :**
  - Simulation pédagogique : relever identifiant du lot, date et poids
  - Si un champ manque : dossier « à compléter » et vérification par un agent
  - Aucune règle de paiement, de certification ou de qualité fournie
- **Notes du formateur :** Lire la source à voix haute. Les champs servent uniquement à cet exercice ; ce ne sont ni des seuils réglementaires ni une procédure de coopérative existante. Les participants devront confronter toutes les sorties à ces trois lignes.

### English

- **Title:** A limited, fictional instruction
- **Key message:** A short source makes it possible to detect facts added by a draft.
- **On-slide content:**
  - Teaching simulation: record lot ID, date, and weight
  - If a field is missing: mark “needs completion” and request staff review
  - No payment, certification, or quality rule is supplied
- **Facilitator notes:** Read the source aloud. These fields exist only for the exercise; they are neither regulatory thresholds nor an existing cooperative’s procedure. Participants will compare every output with these three lines.

## S02-11 : Première demande / First request

Durée : **3 minutes**

### Français

- **Titre :** Demander un avis aux agents
- **Message principal :** Le contexte et la source orientent la première version sans garantir sa justesse.
- **Contenu visible :**
  - Simulation pédagogique : « Rédige un avis de 40 mots aux agents de réception. »
  - « Utilise uniquement la consigne de la diapositive précédente. »
  - « Si une règle manque, signale-le ; n’invente aucun seuil. »
- **Notes du formateur :** Montrer une capture simulée du prompt, étiquetée comme telle. Expliquer simplement tâche, public et source ; les techniques avancées de formulation appartiendront à S03. Utiliser des données fictives, jamais de dossiers membres réels.

### English

- **Title:** Ask for a staff notice
- **Key message:** Context and source material guide a first draft without guaranteeing accuracy.
- **On-slide content:**
  - Teaching simulation: “Draft a 40-word notice for intake staff.”
  - “Use only the instruction on the previous slide.”
  - “If a rule is missing, say so; invent no thresholds.”
- **Facilitator notes:** Show a clearly labelled simulated prompt screen. Explain task, audience, and source at an introductory level; detailed prompting techniques belong in S03. Use fictional data, never real member records.

## S02-12 : Réponse à examiner / Output to inspect

Durée : **3 minutes**

### Français

- **Titre :** Une phrase plausible peut être fausse
- **Message principal :** La fluidité d’un texte ne prouve pas qu’il respecte la source.
- **Contenu visible :**
  - Sortie simulée, volontairement erronée : « Un lot incomplet sera certifié sous 24 heures. »
  - Où cette règle figure-t-elle dans la consigne ?
  - Ne pas publier ce brouillon.
- **Notes du formateur :** Laisser quelques secondes pour repérer l’affirmation inventée. Pointer l’absence de délai et de certification dans la source. Ce texte est un contre-exemple fabriqué pour l’enseignement, pas une réponse réellement obtenue ni une consigne opérationnelle.

### English

- **Title:** A plausible sentence can be wrong
- **Key message:** Fluent wording does not prove that a draft follows its source.
- **On-slide content:**
  - Deliberately wrong simulated output: “An incomplete lot will be certified within 24 hours.”
  - Where does the instruction state this rule?
  - Do not publish this draft.
- **Facilitator notes:** Give participants a few seconds to identify the invented claim. The source supplies neither a deadline nor a certification rule. This is a constructed teaching counterexample, not an observed model response or operational instruction.

## S02-13 : Contrôle du brouillon / Draft review

Durée : **3 minutes**

### Français

- **Titre :** Trois vérifications avant usage
- **Message principal :** La vérification est une étape de travail, pas un geste facultatif après publication.
- **Contenu visible :**
  - Faits : chaque affirmation vient-elle de la source ?
  - Usage : le message répond-il au bon public ?
  - Autorité : qui peut approuver et diffuser ?
- **Notes du formateur :** Faire relever que la phrase de S02-12 échoue au contrôle des faits. Demander qui doit valider la version destinée aux agents. Rappeler qu’aucun dossier privé ne doit être copié dans un modèle public sans procédure approuvée.

### English

- **Title:** Three checks before use
- **Key message:** Review is part of the workflow, not an optional step after publication.
- **On-slide content:**
  - Facts: does every claim come from the source?
  - Use: does the message fit the audience?
  - Authority: who can approve and share it?
- **Facilitator notes:** Point out that the sentence in S02-12 fails the factual check. Ask who should approve a staff notice. Remind participants that private records do not belong in a public model without an approved protection process.

## S02-14 : Version corrigée / Revised draft

Durée : **3 minutes**

### Français

- **Titre :** Revenir aux faits fournis
- **Message principal :** Corriger le brouillon exige de retirer les inventions, pas seulement d’améliorer le style.
- **Contenu visible :**
  - Version d’exercice : « À la réception, relevez l’identifiant du lot, la date et le poids. »
  - « Si un champ manque, marquez le dossier à compléter et demandez une vérification. »
  - Validation par la personne chargée de la procédure avant diffusion
- **Notes du formateur :** Comparer chaque proposition à la consigne fictive de S02-10. La version d’exercice ne fixe ni délai ni résultat de certification. Souligner qu’une correction du modèle demeure un brouillon tant qu’un responsable ne l’a pas approuvée.

### English

- **Title:** Return to the supplied facts
- **Key message:** Revising a draft means removing inventions, not just improving its style.
- **On-slide content:**
  - Exercise draft: “At intake, record the lot ID, date, and weight.”
  - “If a field is missing, mark the record as needing completion and request review.”
  - The procedure owner approves the notice before release
- **Facilitator notes:** Compare each statement with the fictional instruction in S02-10. The exercise draft supplies no deadline or certification outcome. A corrected model output remains a draft until a responsible person approves it.

## S02-15 : Changer de public / Change the audience

Durée : **2 minutes**

### Français

- **Titre :** Même source, autre formulation
- **Message principal :** Réécrire ou résumer adapte la forme sans ajouter de nouvelles règles.
- **Contenu visible :**
  - Agent : instruction de saisie
  - Producteur membre : explication accessible du dossier incomplet
  - Vérifier la fidélité dans les deux versions
- **Notes du formateur :** Proposer oralement une reformulation pour les membres. Les langues effectivement prises en charge par un outil se vérifient avant usage ; une traduction ne dispense pas d’un contrôle humain. Ne pas ajouter de délai ou de conséquence financière.

### English

- **Title:** Same source, different wording
- **Key message:** Rewriting or summarizing changes the form without adding new rules.
- **On-slide content:**
  - Staff member: data-entry instruction
  - Member producer: accessible explanation of an incomplete record
  - Check both versions against the source
- **Facilitator notes:** Invite a spoken rewording for members. Verify an actual tool’s language support before use; translated content still needs human review. Do not invent a deadline or financial consequence.

## S02-16 : Image et formation / Images for training

Durée : **2 minutes**

### Français

- **Titre :** Un visuel aide, mais peut induire en erreur
- **Message principal :** Une image générée doit être examinée comme un brouillon de communication.
- **Contenu visible :**
  - Demande fictive : une affiche sur les trois champs de réception
  - Vérifier libellés, ordre, symboles et droits
  - Aucun sceau officiel ni résultat d’inspection inventé
- **Notes du formateur :** Distinguer texte-vers-image, modification d’une image et extension de ses bords sans détailler des produits. Une illustration pédagogique ne prouve pas qu’un processus a été exécuté dans le monde réel.

### English

- **Title:** A visual can help or mislead
- **Key message:** Treat a generated image as a communication draft that needs review.
- **On-slide content:**
  - Fictional request: a poster about three intake fields
  - Check labels, order, symbols, and rights
  - No invented official seal or inspection result
- **Facilitator notes:** Distinguish text-to-image, image modification, and extending an image beyond its borders without discussing specific products. A teaching illustration is not evidence of a real-world process.

## S02-17 : Affiche simulée / Simulated poster

Durée : **3 minutes**

### Français

- **Titre :** Que corrigeriez-vous sur cette affiche ?
- **Message principal :** L’évaluation d’un visuel porte aussi sur les mots, les implications et le contexte.
- **Contenu visible :**
  - Simulation pédagogique : affiche de réception fictive
  - Vérifier : identifiant, date, poids
  - Repérer : fausse certification ou information absente
- **Notes du formateur :** Prévoir un visuel d’exercice créé pour la séance et marqué « simulation pédagogique ». Inviter une personne à identifier un élément à conserver et un élément à corriger. Ne pas utiliser une vraie photo de producteur, un logo tiers ou une fausse preuve de conformité.

### English

- **Title:** What would you change on this poster?
- **Key message:** Reviewing a visual also means checking its wording, implications, and context.
- **On-slide content:**
  - Teaching simulation: fictional intake poster
  - Check: lot ID, date, weight
  - Spot: false certification or missing information
- **Facilitator notes:** Prepare an exercise visual specifically for the session and label it “teaching simulation.” Invite one person to name something to keep and something to fix. Do not use a real producer’s photo, third-party logo, or false compliance evidence.

## S02-18 : Audio, vidéo et données / Audio, video, and data

Durée : **2 minutes**

### Français

- **Titre :** Certaines sorties demandent d’autres contrôles
- **Message principal :** Le type de contenu détermine ce qu’il faut vérifier avant diffusion.
- **Contenu visible :**
  - Audio : langue, prononciation, consentement et droits
  - Vidéo : séquence, cohérence et provenance
  - Données synthétiques : utilité et risque de confusion avec des données réelles
- **Notes du formateur :** Donner ces exemples à l’oral sans prétendre disposer d’une démonstration ou de résultats enregistrés. Mentionner brièvement les mondes virtuels comme septième domaine déjà vu en S02-07. Ne pas attribuer une langue ou un droit de réutilisation à un service particulier.

### English

- **Title:** Some outputs need different checks
- **Key message:** The content type determines what must be checked before release.
- **On-slide content:**
  - Audio: language, pronunciation, consent, and rights
  - Video: sequence, consistency, and provenance
  - Synthetic data: utility and the risk of confusing it with observed data
- **Facilitator notes:** Give these examples verbally without claiming a completed demonstration or recorded results. Briefly mention virtual worlds as the seventh output type already seen in S02-07. Do not attribute language support or reuse rights to a specific service.

## S02-19 : Aide au code / Code assistance

Durée : **2 minutes**

### Français

- **Titre :** Le code généré reste une proposition
- **Message principal :** Un programme plausible doit être lu, exécuté et testé avant usage.
- **Contenu visible :**
  - Besoin fictif : afficher une liste de champs obligatoires
  - Sortie possible : HTML statique ou aide au code
  - Vérifier comportement, sécurité et accessibilité
- **Notes du formateur :** Relier l’exemple aux activités de code du cours sans refaire leurs laboratoires ni inventer des résultats. Une suggestion de code ne remplace pas les tests ; un guide HTML n’attribue aucun statut de qualité ou de paiement.

### English

- **Title:** Generated code is still a proposal
- **Key message:** Plausible code must be read, run, and tested before use.
- **On-slide content:**
  - Fictional need: display a list of required fields
  - Possible output: static HTML or code assistance
  - Check behavior, security, and accessibility
- **Facilitator notes:** Connect the example to the course’s coding activities without recreating its labs or inventing their results. A code suggestion does not replace testing; an HTML guide assigns no quality or payment status.

## S02-20 : Tester une page / Test a page

Durée : **3 minutes**

### Français

- **Titre :** La page s’affiche ; est-elle juste ?
- **Message principal :** Une page qui s’ouvre dans le navigateur peut encore contenir une consigne erronée.
- **Contenu visible :**
  - Simulation pédagogique : un guide HTML des trois champs
  - Test technique : le contenu s’affiche et reste lisible
  - Test métier : chaque phrase correspond à la consigne fictive
- **Notes du formateur :** Prévoir une capture simulée du guide, ou une démonstration locale préparée et testée séparément. Vérifier clavier et lisibilité si une vraie page est utilisée. L’affichage dans le navigateur ne valide ni les faits ni la publication.

### English

- **Title:** The page loads; is it correct?
- **Key message:** A page that opens in a browser can still contain a wrong instruction.
- **On-slide content:**
  - Teaching simulation: an HTML guide for three fields
  - Technical check: the content displays and remains readable
  - Business check: every sentence matches the fictional instruction
- **Facilitator notes:** Prepare a simulated guide screen or a locally tested demonstration. Check keyboard access and readability if a real page is used. Browser display does not establish factual correctness or authorize publication.

## S02-21 : Génération et agent / Generation and agents

Durée : **2 minutes**

### Français

- **Titre :** Produire un contenu ou poursuivre un objectif
- **Message principal :** Une interaction de génération et un enchaînement d’actions n’ont pas le même niveau d’autonomie.
- **Contenu visible :**
  - Génération : un brouillon à examiner
  - Système agentique : plusieurs étapes et actions possibles
  - Autorisations et supervision à définir avant toute action
- **Notes du formateur :** Présenter une différence de processus, pas une architecture universelle. Dans la coopérative fictive, aucune automatisation ne peut approuver un lot, modifier un paiement ou transmettre une certification de sa propre initiative.

### English

- **Title:** Produce content or pursue a goal
- **Key message:** A generation request and a sequence of actions have different levels of autonomy.
- **On-slide content:**
  - Generation: a draft for review
  - Agentic system: potentially several steps and actions
  - Set permissions and oversight before any action
- **Facilitator notes:** Describe a process distinction, not a universal architecture. In the fictional cooperative, no automation can approve a lot, change a payment, or submit a certificate on its own initiative.

## S02-22 : Exercice en binôme / Pair exercise

Durée : **4 minutes**

### Français

- **Titre :** Concevoir un usage limité
- **Message principal :** Un bon cas d’usage précise ce qui sera produit et comment une personne le vérifiera.
- **Contenu visible :**
  - Choisir un public : agent, producteur membre ou équipe technique
  - Choisir une sortie : texte, visuel ou guide statique
  - Nommer une source fictive, un risque et un validateur humain
- **Notes du formateur :** Donner deux minutes de discussion, puis deux minutes pour préparer une proposition. Garder la consigne fictive de S02-10 comme seule source métier ; ne pas demander l’usage d’un modèle en direct. Pour une personne seule, réaliser l’exercice individuellement.

### English

- **Title:** Design a limited use case
- **Key message:** A sound use case names its output and how a person will review it.
- **On-slide content:**
  - Choose an audience: staff, member producers, or technical team
  - Choose an output: text, visual, or static guide
  - Name a fictional source, one risk, and a human reviewer
- **Facilitator notes:** Allow two minutes to discuss and two minutes to prepare an answer. Use the fictional instruction in S02-10 as the only business source; do not require live model access. Solo participants may work individually.

## S02-23 : Mise en commun / Share and assess

Durée : **3 minutes**

### Français

- **Titre :** Besoin, sortie, contrôle
- **Message principal :** Une proposition vaut par la clarté de son contrôle et de sa responsabilité.
- **Contenu visible :**
  - Quel est le besoin ?
  - Quelle sortie est adaptée ?
  - Quel fait sera vérifié, par qui ?
- **Notes du formateur :** Écouter deux réponses courtes, puis reformuler « besoin → sortie → vérification → autorisation ». Corriger toute promesse de certification automatique ou de gain chiffré inventé. Si le temps manque, prendre une réponse et garder l’autre pour la discussion finale.

### English

- **Title:** Need, output, check
- **Key message:** A proposal is only as sound as its review and accountability.
- **On-slide content:**
  - What is the need?
  - Which output fits?
  - What fact will be checked, and by whom?
- **Facilitator notes:** Hear two brief answers, then restate “need → output → review → authorization.” Correct any promise of automatic certification or invented quantitative gain. If time is short, take one answer and reserve the other for the closing discussion.

## S02-24 : Conditions d’usage / Conditions for use

Durée : **2 minutes**

### Français

- **Titre :** Tester la valeur sans inventer des résultats
- **Message principal :** Un essai mesuré permet d’évaluer un usage ; une hypothèse ne constitue pas un bénéfice observé.
- **Contenu visible :**
  - Critères possibles : exactitude, corrections nécessaires, temps de préparation
  - Données protégées et droits vérifiés avant l’essai
  - Décision d’utilisation : équipe responsable
- **Notes du formateur :** Proposer des indicateurs à mesurer lors d’un futur essai, sans leur attribuer de valeur obtenue. Ne pas reprendre les chiffres attribués à des entreprises tierces comme prévision pour la coopérative. Séparer la vérification du contenu de l’autorisation opérationnelle.

### English

- **Title:** Test value without inventing results
- **Key message:** A measured trial can assess a use case; a hypothesis is not an observed benefit.
- **On-slide content:**
  - Possible measures: accuracy, required corrections, preparation time
  - Protect data and check rights before a trial
  - Responsible team decides whether to use the output
- **Facilitator notes:** Suggest measures for a future trial without assigning achieved values. Do not turn numbers attributed to other companies into a forecast for the cooperative. Separate content review from operational authorization.

## S02-25 : Vérification finale / Final check

Durée : **2 minutes**

### Français

- **Titre :** Trois questions pour repartir
- **Message principal :** Une sortie produite par l’IA n’est utilisable qu’après un contrôle adapté.
- **Contenu visible :**
  - Est-ce une classification, une prévision ou une génération ?
  - Quelle source et quel format de sortie conviennent ?
  - Quelle affirmation vérifier avant diffusion ?
- **Notes du formateur :** Faire répondre à voix haute sur l’avis fictif : génération de texte, consigne de S02-10, validation des faits et du droit de diffusion. Réutiliser la phrase inventée de S02-12 comme contre-exemple.

### English

- **Title:** Three questions to take away
- **Key message:** AI-produced output is ready for use only after an appropriate review.
- **On-slide content:**
  - Is this classification, forecasting, or generation?
  - Which source and output format fit?
  - Which claim needs checking before release?
- **Facilitator notes:** Invite spoken answers for the fictional notice: text generation, the instruction in S02-10, and checking facts and sharing rights. Reuse the invented statement in S02-12 as a counterexample.

## S02-26 : Transition vers S03 / Transition to S03

Durée : **1 minute**

### Français

- **Titre :** Prochaine session : concevoir les prompts
- **Message principal :** Le choix d’une sortie précède le travail détaillé sur la formulation des demandes.
- **Contenu visible :**
  - S02 : besoins, formats, vérification
  - S03 : structure, variantes et évaluation des prompts
- **Notes du formateur :** Conclure sans promettre un résultat de modèle ou un outil particulier. Annoncer que S03 partira des brouillons et contrôles de cette séance pour approfondir la conception des demandes.

### English

- **Title:** Next session: designing prompts
- **Key message:** Choosing an output comes before detailed work on phrasing requests.
- **On-slide content:**
  - S02: needs, formats, review
  - S03: prompt structure, alternatives, and evaluation
- **Facilitator notes:** Close without promising an output from a particular model or tool. Explain that S03 will use this session’s drafts and checks to explore how to design requests.

---

## Traçabilité vers les sources canoniques

| Module du cours 02                                                                                 | Diapositives principales                 |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 01 : Introduction et capacités de l’IA générative / Introduction and Capabilities of Generative AI | S02-03 à S02-07, S02-10 à S02-15, S02-25 |
| 02 : Applications et outils de l’IA générative / Applications and Tools of Generative AI           | S02-08 à S02-09, S02-15 à S02-24         |
| 03 : Quiz, projet et bilan du cours / Course Quiz, Project, and Wrap-up                            | S02-17, S02-19 à S02-20, S02-22 à S02-26 |

- **Sources françaises :** [module 01](../../courses/02-generative-ai-introduction-and-applications/fr/01-introduction-and-capabilities-of-generative-ai.md), [module 02](../../courses/02-generative-ai-introduction-and-applications/fr/02-applications-and-tools-of-generative-ai.md), [module 03](../../courses/02-generative-ai-introduction-and-applications/fr/03-course-quiz-project-and-wrap-up.md).
- **English sources:** [module 01](../../courses/02-generative-ai-introduction-and-applications/en/01-introduction-and-capabilities-of-generative-ai.md), [module 02](../../courses/02-generative-ai-introduction-and-applications/en/02-applications-and-tools-of-generative-ai.md), [module 03](../../courses/02-generative-ai-introduction-and-applications/en/03-course-quiz-project-and-wrap-up.md).
- **Cas fil rouge / Recurring case:** [coopérative fictive près de Soubré](../case-studies/cocoa-cooperative-near-soubre.md).

## Revue éditoriale préalable à la production

- Les trois adaptations françaises sont rédigées, mais chacune garde la mention « révision personnelle non terminée ». Leur sens et les termes clés doivent être examinés par le responsable pédagogique avant de considérer ce contrat comme approuvé.
- Les exemples d’interfaces, noms de modèles, tarifs, quotas, performances et projections décrivent des supports enregistrés ; aucun de ces éléments n’est requis pour la démonstration S02.
- Les sorties individuelles des laboratoires et du projet final ne sont pas conservées dans les notes. Les phrases de S02-12 et S02-14, l’affiche S02-17 et la page S02-20 sont donc des **simulations pédagogiques nouvelles**, signalées comme telles dans les deux langues ; elles ne sont pas présentées comme des travaux Coursera exécutés.
- Le projet final est décrit comme facultatif dans la vue d’ensemble du cours. S02-22 est une activité propre à la session, sans prétention de reproduire une évaluation officielle.
- Les chiffres attribués à des entreprises tierces, les détails historiques discutables et les comparaisons de produits restent dans les notes de référence jusqu’à vérification indépendante de leurs sources et de leur période.
- Les données des membres, paiements et inspections sont exclues des exemples destinés à des services publics sans procédure de protection approuvée.

## Contenus réservés aux notes ou à la documentation de référence

- Chronologie détaillée des architectures et familles GAN, VAE, Transformers, diffusion et autorégression
- Formalismes probabilistes `P(X)`, `P(X, Y)` et `P(Y|X)`
- Catalogues de marques, interfaces enregistrées et affirmations sur leur disponibilité
- Projections économiques, mesures attribuées à des tiers et chiffres sans période vérifiée
- Quiz, scores, consignes de soumission et résultats de laboratoires manquants
- Tutoriels détaillés d’image, audio, vidéo, code, ou construction de systèmes agentiques

## Critères d’acceptation du futur support

- 26 diapositives en FR et 26 en EN, dans le même ordre, pour **60 minutes** par langue
- Chaque identifiant, durée, objectif, interaction et décision sensible possède un équivalent bilingue
- Les textes visibles tiennent dans les diapositives ; les notes portent explications et transitions
- Les écrans et réponses simulés sont lisibles et explicitement étiquetés dans les deux langues
- Aucun délai, seuil, résultat mesuré, certification ou politique réelle n’est présenté comme fait établi pour la coopérative fictive
- La mise en pratique comprend une source, un type de sortie, un contrôle des faits et un validateur humain
- La présentation est relue visuellement et répétée avec chronomètre avant diffusion finale
