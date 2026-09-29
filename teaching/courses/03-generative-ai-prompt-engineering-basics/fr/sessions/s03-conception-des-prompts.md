# S03 — Principes de base de la conception des prompts

## Métadonnées pédagogiques

- **Programme :** Fondements de l’IA pour tous
- **Session :** S03 — Principes de base de la conception des prompts
- **Langue :** Français
- **Public :** Professionnels et apprenants sans prérequis technique
- **Durée :** 60 minutes
- **Nombre de diapositives :** 25
- **Cas fil rouge :** une coopérative cacaoyère fictive et sans nom près de Soubré
- **Statut :** source pédagogique française de travail ; révision personnelle des adaptations canoniques du cours 03 encore ouverte
- **Contrat bilingue :** `docs/teaching/s03-prompt-engineering-60-min-content-contract.md`

## Sources canoniques

- `courses/03-generative-ai-prompt-engineering-basics/fr/01-prompt-engineering-for-generative-ai.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/02-prompt-engineering-techniques-and-approaches.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/03-course-quiz-project-and-wrap-up.md`

## Objectif de la session

Concevoir une demande à partir d’une source définie, choisir une technique adaptée au contexte,
vérifier une proposition par rapport aux faits fournis et confier la validation à une personne
habilitée. La séance peut se dérouler entièrement sans compte de modèle ni connexion.

## Principes d’animation

1. Montrer une seule idée principale par diapositive ; garder l’explication et les relances dans les notes.
2. Présenter la coopérative, la consigne et toutes les réponses fabriquées comme des simulations pédagogiques.
3. Conserver sous les yeux la source S03-04 pendant les exercices ; ne pas en déduire de délai, seuil, certification ou paiement.
4. Prévoir de courtes réponses orales et un exercice en binôme dans les 60 minutes, sans démonstration de service obligatoire.
5. Faire distinguer précision du prompt et véracité de la réponse : le contrôle humain reste nécessaire.
6. Réviser l’adaptation française du cours 03 et répéter la séance au chronomètre avant diffusion finale.

## Diapositive 01 — S03 : concevoir un prompt qui se vérifie

- **Identifiant :** S03-01
- **Durée :** 1 minute

### Rôle de la diapositive

course-title

### Contenu de la diapositive

S03 : session de 60 minutes

- Cas fictif : une coopérative cacaoyère près de Soubré
- Fil conducteur : un message aux agents de réception

### Notes pédagogiques

**Message à faire retenir :** Une demande précise prépare un brouillon vérifiable, jamais une décision automatique.

Accueillir et relier S03 aux brouillons de S02. Dire que la coopérative, les captures éventuelles et les réponses d’exercice sont fictives. Annoncer que l’avis aux agents ne sera jamais publié sans validation.

## Diapositive 02 — Quatre gestes pour la séance

- **Identifiant :** S03-02
- **Durée :** 2 minutes

### Rôle de la diapositive

course-objectives

### Contenu de la diapositive

- Cadrer la demande et sa source
- Choisir : direct, exemple ou questions
- Contrôler les faits et les inconnues
- Corriger puis faire valider

### Notes pédagogiques

**Message à faire retenir :** Concevoir, choisir une technique, vérifier et corriger sont les quatre gestes de la séance.

Lire rapidement les quatre objectifs. Demander quel geste manque quand un texte est diffusé immédiatement après sa génération. Rappeler qu’un exercice papier suffit et qu’aucun accès à un service d’IA n’est requis.

## Diapositive 03 — Une phrase plausible, un fait absent

- **Identifiant :** S03-03
- **Durée :** 2 minutes

### Contenu de la diapositive

- S02 : « certifié sous 24 heures » était une phrase fabriquée pour l’exercice
- Aucune source ne confirmait cette promesse
- Où retrouver la preuve avant de reprendre un brouillon ?

### Notes pédagogiques

**Message à faire retenir :** Une réponse fluide peut ajouter un fait sans preuve.

Rappeler la phrase erronée de S02-12 et laisser les participants dire ce qui manque. Le délai et la certification étaient une simulation pédagogique, pas un résultat observé ni une règle réelle. Une meilleure formulation peut réduire l’ambiguïté sans empêcher toute erreur.

## Diapositive 04 — Une consigne brève, des limites nettes

- **Identifiant :** S03-04
- **Durée :** 2 minutes

### Contenu de la diapositive

- Simulation pédagogique : relever identifiant du lot, date et poids
- Champ manquant : dossier « à compléter », puis vérification par un agent
- Aucune autre règle fournie

### Notes pédagogiques

**Message à faire retenir :** Cette consigne fictive est l’unique source de faits pour le message aux agents.

Lire les trois lignes et les garder accessibles pour la suite de l’exercice. Ce sont les mêmes faits inventés pour S02-10 ; ils ne décrivent aucune procédure réelle. Souligner l’absence de seuil, délai, paiement, grade ou certification.

## Diapositive 05 — De la tâche à la réponse

- **Identifiant :** S03-05
- **Durée :** 3 minutes

### Contenu de la diapositive

- Tâche et contexte
- Données d’entrée et sortie attendue
- Proposition → évaluation → affinage

### Notes pédagogiques

**Message à faire retenir :** Un prompt fournit une demande et les informations nécessaires pour en examiner le résultat.

Relier ces trois lignes aux quatre composantes du module 03.01 : instruction, contexte, données et indicateurs de sortie. Demander ce qui, dans S03-04, constitue une donnée d’entrée. Une nouvelle demande ne réentraîne pas le modèle ; elle change les indications fournies pour cette génération.

## Diapositive 06 — « Rédige un message » laisse des trous

- **Identifiant :** S03-06
- **Durée :** 2 minutes

### Contenu de la diapositive

- Prompt de départ : « Rédige un message sur la réception des lots. »
- Public, source et format absents
- Que faudrait-il préciser avant de rédiger ?

### Notes pédagogiques

**Message à faire retenir :** Une demande vague laisse ouverts les faits et le destinataire.

Faire nommer oralement les trois absences, sans produire de réponse imaginaire du modèle. Il s’agit d’un prompt construit pour la séance. Introduire les six repères pratiques de la diapositive suivante.

## Diapositive 07 — Six éléments pour cadrer la demande

- **Identifiant :** S03-07
- **Durée :** 3 minutes

### Contenu de la diapositive

- Tâche et public
- Source et contraintes
- Format et vérification humaine

### Notes pédagogiques

**Message à faire retenir :** Un cadrage explicite rend la future réponse plus facile à contrôler.

Faire relier les six repères aux quatre composantes vues sur S03-05. Demander où placer la règle « si un champ manque ». Cette liste est une grille pédagogique pour l’exercice, pas une formule valable pour tout modèle et tout métier.

## Diapositive 08 — Une demande ancrée dans la source

- **Identifiant :** S03-08
- **Durée :** 2 minutes

### Contenu de la diapositive

- « Rédige en français un avis bref pour les agents. »
- « Utilise seulement S03-04 : les trois champs et la vérification. »
- « N’invente ni seuil ni certification. »

### Notes pédagogiques

**Message à faire retenir :** Un prompt structuré fixe la tâche, le public, la source et les limites.

Montrer la capture d’un véritable échange avec ChatGPT sur la consigne fictive S03-04. Lire les trois lignes comme un seul prompt de démonstration, puis demander quelle partie limite les faits. Vérifier dans la réponse les trois champs, le statut « à compléter » et le contrôle par un agent ; aucune autre règle ne doit apparaître. Le prompt est une adaptation pédagogique nouvelle, pas une citation littérale du cours ni la garantie d’un texte fidèle. Avant usage, le brouillon devra encore être vérifié.

## Diapositive 09 — Un avis destiné à être lu

- **Identifiant :** S03-09
- **Durée :** 3 minutes

### Contenu de la diapositive

- Public : agents de réception
- Ton : français simple et respectueux
- Format : deux phrases, dont l’action si un champ manque

### Notes pédagogiques

**Message à faire retenir :** Le format et le destinataire rendent le message plus utile et sa lecture plus rapide.

Faire reformuler un mot trop technique pour un public différent, sans changer la consigne. Comparer brièvement un avis interne à une explication aux producteurs membres. Deux phrases correctes en apparence peuvent encore contenir une information inventée.

## Diapositive 10 — Le rôle oriente, il ne certifie rien

- **Identifiant :** S03-10
- **Durée :** 2 minutes

### Contenu de la diapositive

- Persona suggérée : aide à la rédaction
- Mission réelle : préparer un brouillon
- Décision réelle : équipe et responsable habilités

### Notes pédagogiques

**Message à faire retenir :** Attribuer un rôle au modèle change la perspective demandée, pas son autorité.

Expliquer pourquoi « tu aides l’équipe » ne donne ni compétence réglementaire ni accès aux vrais dossiers. Ne lui confier ni diagnostic de culture, ni acceptation d’un lot, ni décision de paiement. Passer à l’évaluation d’un brouillon, quelle que soit la persona choisie.

## Diapositive 11 — Évaluer avant de réécrire

- **Identifiant :** S03-11
- **Durée :** 3 minutes

### Contenu de la diapositive

- Prompt → brouillon
- Contrôle : faits, public et format
- Écart constaté → correction ciblée → nouveau contrôle

### Notes pédagogiques

**Message à faire retenir :** L’itération corrige un écart observé avec la source ou le besoin.

Prendre la certification inventée de S02 comme écart précis. Demander ce qu’il faut retirer, puis ce qu’il faut vérifier à la nouvelle lecture. Retester un prompt ne remplace pas l’approbation du message par le responsable.

## Diapositive 12 — Zero-shot : la tâche sans démonstration

- **Identifiant :** S03-12
- **Durée :** 2 minutes

### Contenu de la diapositive

- « À partir de S03-04, énumère les champs du dossier. »
- Aucun exemple entrée → sortie dans le prompt
- Réponse à vérifier dans S03-04

### Notes pédagogiques

**Message à faire retenir :** Zero-shot signifie que le prompt courant ne fournit aucun exemple de réponse.

Nommer les trois champs attendus avant de dévoiler la réponse des participants. Ce terme ne signifie pas qu’un modèle n’a jamais été entraîné. La demande directe reste adaptée à une tâche simple, sous réserve de vérification.

## Diapositive 13 — Few-shot : montrer le format

- **Identifiant :** S03-13
- **Durée :** 2 minutes

### Contenu de la diapositive

- EX-01, date absente → « à compléter : date »
- EX-02, poids absent → « à compléter : poids »
- EX-03, identifiant absent → ?

### Notes pédagogiques

**Message à faire retenir :** Quelques exemples fictifs montrent la structure de réponse souhaitée.

Montrer les deux premières paires, puis demander aux participants de compléter EX-03 : « à compléter : identifiant du lot ». Tous les lots EX sont fabriqués pour l’exercice ; ils ne prouvent rien sur une réception réelle. Les exemples ajoutés au prompt ne modifient pas les poids du modèle.

## Diapositive 14 — Ajouter un exemple pour une raison

- **Identifiant :** S03-14
- **Durée :** 3 minutes

### Contenu de la diapositive

- Tâche claire → demande directe
- Format difficile à décrire → exemple fictif vérifié
- Faits absents → questions avant la rédaction

### Notes pédagogiques

**Message à faire retenir :** Le choix de la technique dépend de ce qui manque à la tâche.

Faire choisir une approche pour l’avis aux agents, puis pour un dossier sans indication du champ manquant. Si un exemple contient une règle inventée, le modèle risque de la reprendre. Les questions préalables servent à lever cette seconde incertitude.

## Diapositive 15 — Entretien : demander avant d’inventer

- **Identifiant :** S03-15
- **Durée :** 2 minutes

### Contenu de la diapositive

- Quel est le public ?
- Quel champ manque dans le dossier fictif ?
- Quelle consigne approuvée puis-je utiliser ?

### Notes pédagogiques

**Message à faire retenir :** Poser des questions ciblées permet de recueillir les informations manquantes avant un brouillon.

Mettre les trois questions en scène avec un participant volontaire. Si une réponse est inconnue, elle reste inconnue ; ne pas la déduire d’un exemple. Ne demander aucune donnée personnelle réelle de membre pendant cet échange.

## Diapositive 16 — Construire une demande d’entretien

- **Identifiant :** S03-16
- **Durée :** 2 minutes

### Contenu de la diapositive

- « Pose une question à la fois. »
- « Marque toute réponse indisponible comme inconnue. »
- « Résume les faits confirmés avant de rédiger. »

### Notes pédagogiques

**Message à faire retenir :** L’entretien sépare les réponses confirmées des informations absentes.

Simuler la question « Quel champ manque ? » puis répondre « je ne sais pas ». Dire que la rédaction doit alors rester générale ou attendre une vérification, sans inventer le champ manquant. L’entretien améliore la collecte de contexte, pas la fiabilité intrinsèque du modèle.

## Diapositive 17 — Décomposer les contrôles observables

- **Identifiant :** S03-17
- **Durée :** 2 minutes

### Contenu de la diapositive

1. Relever les champs fournis
2. Marquer les absences
3. Rédiger l’avis provisoire
4. Soumettre à l’agent responsable

### Notes pédagogiques

**Message à faire retenir :** Une tâche complexe devient plus vérifiable lorsque ses étapes de travail sont explicites.

Demander à quel moment intervient la personne responsable. Les étapes portent sur des opérations et résultats observables ; elles ne révèlent aucun raisonnement interne privé du modèle. Chaque étape peut échouer et demande un contrôle.

## Diapositive 18 — Deux formulations, mêmes faits

- **Identifiant :** S03-18
- **Durée :** 3 minutes

### Contenu de la diapositive

- Option A : note pour agents
- Option B : rappel très bref
- Comparer : exactitude, clarté, ton, longueur

### Notes pédagogiques

**Message à faire retenir :** Plusieurs versions se comparent selon des critères annoncés avant le choix.

Demander quel critère est éliminatoire si une option ajoute un délai non fourni. Une comparaison de branches ou un classement produit par le même modèle n’est pas un avis indépendant. Un agent peut préférer une version plus claire seulement si les faits restent corrects.

## Diapositive 19 — Repérer l’invention

- **Identifiant :** S03-19
- **Durée :** 4 minutes

### Contenu de la diapositive

- Simulation pédagogique : « Saisissez le lot, la date et le poids. »
- « Les lots incomplets sont certifiés sous 24 heures. »
- Quelle partie ne figure pas dans S03-04 ?

### Notes pédagogiques

**Message à faire retenir :** Toute affirmation doit pouvoir être rapprochée de la consigne fictive.

Laisser une minute de lecture puis une minute d’échange en binôme. La seconde phrase invente certification et délai ; la première devrait préciser « identifiant du lot ». Faire proposer une correction orale avant de passer au prompt de révision. Ce contre-exemple construit pour l’exercice ne provient ni de la capture ChatGPT montrée en S03-08 ni d’un service utilisé en direct.

## Diapositive 20 — Corriger l’écart précis

- **Identifiant :** S03-20
- **Durée :** 3 minutes

### Contenu de la diapositive

- « Supprime délai et certification : absents de S03-04. »
- « N’ajoute aucune règle. Cite les trois champs. »
- « Si un champ manque, demande la vérification par un agent. »

### Notes pédagogiques

**Message à faire retenir :** Une révision utile nomme les erreurs et demande une nouvelle comparaison à la source.

Faire reformuler le nouveau message avec les trois champs et le statut « à compléter ». Lire le résultat à la lumière de S03-04, même si la consigne de correction semble suffisante. Ce texte demeure un brouillon tant que la personne habilitée ne l’a pas validé.

## Diapositive 21 — Écrire un prompt révisable

- **Identifiant :** S03-21
- **Durée :** 4 minutes

### Contenu de la diapositive

- 2 min : écrire tâche, public, source, format et limite
- 1 min : choisir direct, exemple ou entretien
- 1 min : échanger et relever une inconnue

### Notes pédagogiques

**Message à faire retenir :** Chaque binôme construit une demande que quelqu’un d’autre peut contrôler.

Distribuer ou afficher S03-04 et la grille de S03-23 avant de lancer le chronomètre. Si aucun modèle n’est disponible, le binôme rédige lui-même une réponse fictive à critiquer. Circuler pour vérifier l’absence de dossiers réels, de nouveaux délais et de certification.

## Diapositive 22 — Critiquer une demande utilement

- **Identifiant :** S03-22
- **Durée :** 3 minutes

### Contenu de la diapositive

- Source citée ?
- Action si un champ manque ?
- Format adapté aux agents ?
- Responsable de validation identifié ?

### Notes pédagogiques

**Message à faire retenir :** Un retour utile identifie l’élément absent et propose une correction ciblée.

Inviter deux binômes à partager un seul ajustement chacun. Leur demander de montrer où cet ajustement s’insère dans le prompt, sans analyser de dossier réel. Réserver les dernières secondes aux contrôles applicables à la réponse.

## Diapositive 23 — La réponse doit passer quatre contrôles

- **Identifiant :** S03-23
- **Durée :** 2 minutes

### Contenu de la diapositive

- Faits tirés de S03-04 ?
- Public et format adaptés ?
- Inconnues visibles ?
- Responsable de validation identifié ?

### Notes pédagogiques

**Message à faire retenir :** Un prompt bien rédigé et une réponse fluide exigent deux contrôles distincts.

Faire nommer le contrôle qui échoue si le texte promet une certification sous 24 heures. Le responsable de la procédure valide le message après vérification ; le modèle ne signe ni l’avis ni une décision sur un lot. Montrer que la grille sert aussi à examiner une réponse humaine simulée.

## Diapositive 24 — Même méthode, autre entrée

- **Identifiant :** S03-24
- **Durée :** 2 minutes

### Contenu de la diapositive

- Photo ou document fourni : relever les champs lisibles
- Illisible → « inconnu »
- Une personne vérifie avant usage

### Notes pédagogiques

**Message à faire retenir :** Ajouter une image ou un document ajoute une source à examiner, pas une preuve automatique.

Mentionner brièvement le prompt multimodal du module 03.02 et les images du module 03.03. Une belle image ne prouve ni authenticité de l’étiquette ni traçabilité du lot. La démonstration complète des outils reste hors de la séance d’une heure.

## Diapositive 25 — La source avant la formulation

- **Identifiant :** S03-25
- **Durée :** 1 minute

### Contenu de la diapositive

- Besoin → source → prompt
- Contrôle → correction → décision humaine

### Notes pédagogiques

**Message à faire retenir :** Choisir une technique, observer la sortie et corriger précèdent toujours la validation humaine.

Demander : « Quels faits puis-je utiliser ? » Recueillir une réponse courte, puis conclure sans promettre de comportement universel d’un modèle. Noter que l’allocation de 60 minutes doit encore être confirmée par répétition chronométrée.
