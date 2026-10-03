# S03 — Concevoir de bons prompts

## Métadonnées pédagogiques

- **Programme :** AI for Everyone — Professional Curriculum
- **Session :** S03 — Concevoir de bons prompts
- **Langue :** Français
- **Public :** Professionnels et apprenants sans prérequis technique
- **Durée :** 60 minutes
- **Nombre de diapositives :** 25
- **Cas fil rouge :** une coopérative cacaoyère fictive et sans nom près de Soubré
- **Position dans le parcours :** PROMPT
- **Statut :** source pédagogique de fusion professionnelle ; la révision personnelle des adaptations canoniques françaises du cours 03 reste ouverte
- **Source pédagogique d’origine :** spécialisation _AI Foundations for Everyone_ d’IBM sur Coursera
- **Apport de pratique professionnelle :** curriculum professionnel collaboratif documenté par le contrat de fusion et l’audit
- **Déclaration sur l’IA :** Cette session pédagogique est générée avec l’IA en tant qu’adaptation indépendante du dépôt.
- **Contrat bilingue :** `docs/teaching/s03-prompt-engineering-60-min-content-contract.md`
- **Audit de fusion :** `docs/teaching/s03-professional-fusion-audit.md`

## Sources canoniques

- `courses/03-generative-ai-prompt-engineering-basics/fr/01-prompt-engineering-for-generative-ai.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/02-prompt-engineering-techniques-and-approaches.md`
- `courses/03-generative-ai-prompt-engineering-basics/fr/03-course-quiz-project-and-wrap-up.md`

## Objectif de la session

Transformer un besoin professionnel délimité en consigne claire, choisir une technique de prompting
pour une raison explicite, évaluer la réponse proposée, corriger un écart observé et préserver la
vérification ainsi que la responsabilité humaine avant tout usage professionnel.

## Principes d’animation

1. Partir du résultat professionnel attendu plutôt que de la terminologie du prompting.
2. Présenter rôle, tâche, contexte, public, format, contraintes et critères de qualité comme une
   grille pratique et non comme une syntaxe obligatoire.
3. Garder la source fictive S03-04 visible et conserver toute information inconnue comme inconnue.
4. Distinguer qualité du prompt, fiabilité factuelle et autorisation professionnelle.
5. Utiliser uniquement des informations fictives, anonymisées, publiques ou explicitement
   autorisées dans les activités.
6. Garder les explications et cas limites dans les notes afin que les diapositives restent lisibles.
7. Présenter l’itération comme la correction ciblée d’un écart observé plutôt que comme une
   régénération répétée.
8. Réviser les adaptations canoniques françaises du cours 03 et répéter la séance avant diffusion.

## Diapositive 01 — Concevoir de bons prompts

- **Identifiant:** S03-01
- **Durée:** 1 minute

### Rôle de la diapositive

course-title

### Contenu de la diapositive

S03 · séance de 60 minutes

- Du résultat attendu à une consigne vérifiable
- Coopérative cacaoyère fictive près de Soubré
- Basé sur la spécialisation _AI Foundations for Everyone_ d'IBM sur Coursera
- Adaptation pédagogique indépendante générée avec l’IA

### Notes pédagogiques

**Message à faire retenir:** Un prompt professionnel transforme un besoin de travail en consigne que l'on peut contrôler et améliorer.

Relier directement à S02. S02 montrait ce que l'IA générative peut aider à produire ; S03 se concentre sur la manière de formuler le besoin de travail. Préciser qu'une meilleure consigne ne supprime ni la vérification ni la responsabilité humaine.

## Diapositive 02 — Ce que vous saurez faire

- **Identifiant:** S03-02
- **Durée:** 2 minutes

### Rôle de la diapositive

course-objectives

### Contenu de la diapositive

1. Structurer un prompt professionnel
2. Choisir une technique pour une raison
3. Évaluer la réponse proposée
4. Corriger un écart observé
5. Réutiliser un point de départ validé

### Notes pédagogiques

**Message à faire retenir:** Structurer, choisir, évaluer, corriger et réutiliser.

Présenter la progression complète. Un « point de départ validé » ne signifie pas une approbation permanente : lors de la réutilisation, il faut encore contrôler la source, le public, les contraintes et le contexte.

## Diapositive 03 — Un meilleur prompt ne garantit pas une réponse vraie

- **Identifiant:** S03-03
- **Durée:** 2 minutes

### Contenu de la diapositive

- S02 montrait volontairement « certifié sous 24 heures »
- La source fictive ne donnait ni certification ni délai
- Une meilleure consigne peut réduire l'ambiguïté
- La réponse proposée reste à contrôler

### Notes pédagogiques

**Message à faire retenir:** La qualité du prompt et la fiabilité factuelle sont deux questions différentes.

Rappeler S02-12. La phrase non fondée était construite pour l'apprentissage. Ne pas laisser entendre qu'un prompt suffisamment détaillé peut empêcher toute erreur.

## Diapositive 04 — Garder la source visible

- **Identifiant:** S03-04
- **Durée:** 2 minutes

### Contenu de la diapositive

- Relever l'identifiant du lot, la date et le poids
- Champ manquant → marquer « à compléter »
- Puis faire vérifier le dossier par un agent
- Aucune autre règle n'est fournie

### Notes pédagogiques

**Message à faire retenir:** La source détermine quelles affirmations peuvent être contrôlées.

Garder cette consigne fictive accessible pendant tout l'exercice. Il ne s'agit ni d'une procédure réelle de coopérative ni d'une réglementation. Une information inconnue reste inconnue.

## Diapositive 05 — Un prompt est une consigne de travail

- **Identifiant:** S03-05
- **Durée:** 3 minutes

### Contenu de la diapositive

- Résultat attendu
- Tâche + contexte + entrée
- Exigences de sortie
- Brouillon → contrôle → correction ou validation

### Notes pédagogiques

**Message à faire retenir:** Un prompt relie le résultat attendu aux informations et exigences nécessaires pour produire un brouillon.

Relier la diapositive aux composantes canoniques du prompt : instruction, contexte, données d'entrée et indicateurs de sortie. Un nouveau prompt modifie le contexte de la génération en cours ; il ne réentraîne pas le modèle.

## Diapositive 06 — Une demande faible laisse des choix implicites

- **Identifiant:** S03-06
- **Durée:** 2 minutes

### Contenu de la diapositive

- Prompt de départ : « Rédige un message sur la réception des lots. »
- Quel résultat faut-il réellement obtenir ?
- Quels faits peut-on utiliser ?
- Qui va le lire et sous quelle forme ?

### Notes pédagogiques

**Message à faire retenir:** « Rédige un message » ne définit pas suffisamment le besoin professionnel.

Faire identifier ce qui manque avant d'afficher le cadre en sept éléments. Ne pas fabriquer une réponse imaginaire au prompt faible.

## Diapositive 07 — Sept éléments pour un prompt utile

- **Identifiant:** S03-07
- **Durée:** 3 minutes

### Contenu de la diapositive

- Rôle + tâche
- Contexte + public
- Format + contraintes
- Critères de qualité

### Notes pédagogiques

**Message à faire retenir:** Utiliser les éléments qui rendent la consigne plus claire et plus facile à évaluer.

Nommer explicitement les sept éléments : rôle, tâche, contexte, public, format, contraintes et critères de qualité. Expliquer qu'il s'agit d'une grille, pas d'une syntaxe obligatoire. Une tâche simple peut ne pas nécessiter de rôle ni tous les autres éléments.

## Diapositive 08 — Construire un prompt structuré

- **Identifiant:** S03-08
- **Durée:** 2 minutes

### Contenu de la diapositive

- Tâche : rédiger un avis bref
- Contexte : utiliser uniquement la consigne S03-04
- Public + format : agents de réception, avis court
- Contrainte + qualité : aucune règle ajoutée ; faits fournis préservés

### Notes pédagogiques

**Message à faire retenir:** Fournir les informations nécessaires à la tâche et limiter explicitement les ajouts non fondés.

Utiliser la capture réelle de ChatGPT fondée sur la source fictive de la coopérative. Identifier les éléments du cadre présents. Signaler qu'un rôle explicite n'est pas nécessaire ici. La capture reste un brouillon à vérifier et ne prouve pas que le prompt garantit le respect de la consigne.

## Diapositive 09 — Même cadre, autre travail professionnel

- **Identifiant:** S03-09
- **Durée:** 3 minutes

### Contenu de la diapositive

- Courriel → destinataire, objectif, ton
- Compte rendu → notes, décisions, informations manquantes
- Rapport → public, longueur, sources autorisées
- Plan de présentation → objectif, structure, justification des affirmations

### Notes pédagogiques

**Message à faire retenir:** Le cadre reste utile tandis que le contexte, le public, le format et les critères changent.

Il s'agit d'exemples de transfert, pas de nouvelles règles factuelles. Demander quels éléments du prompt changent selon la tâche. La coopérative reste le cas principal de l'exercice sans être le seul contexte professionnel.

## Diapositive 10 — Un rôle oriente ; il ne donne pas d'autorité

- **Identifiant:** S03-10
- **Durée:** 2 minutes

### Contenu de la diapositive

- Rôle : « aider l'équipe de rédaction »
- Utile pour la perspective, le vocabulaire ou le ton
- Ne crée ni faits manquants ni droits d'accès
- La responsabilité humaine ne change pas

### Notes pédagogiques

**Message à faire retenir:** Un rôle peut guider la perspective ou le ton sans créer d'autorité professionnelle.

Distinguer persona et délégation. Ne pas demander au modèle d'accepter un lot, décider un paiement, certifier une qualité, diagnostiquer une culture ou publier une règle opérationnelle.

## Diapositive 11 — Améliorer à partir d'un écart observé

- **Identifiant:** S03-11
- **Durée:** 3 minutes

### Contenu de la diapositive

- Contrôler le brouillon
- Nommer l'écart
- Modifier la consigne
- Générer de nouveau puis recontrôler

### Notes pédagogiques

**Message à faire retenir:** L'itération est utile lorsque la nouvelle consigne répond à un problème précis.

Utiliser l'affirmation non fondée sur la certification comme exemple. Opposer une correction ciblée à la répétition de « améliore le texte ». La deuxième sortie doit encore être vérifiée.

## Diapositive 12 — Demande directe : zero-shot

- **Identifiant:** S03-12
- **Durée:** 2 minutes

### Contenu de la diapositive

- « À partir de S03-04, énumère les champs du dossier. »
- Aucun exemple entrée → sortie fourni
- Les faits attendus viennent de la source
- Le contrôle reste nécessaire

### Notes pédagogiques

**Message à faire retenir:** Utiliser une demande directe lorsque la tâche peut être précisée sans montrer de réponse.

Zero-shot décrit le prompt courant, pas l'historique d'entraînement du modèle. Faire identifier les trois champs attendus dans S03-04 avant de discuter de la réponse.

## Diapositive 13 — One-shot et few-shot : montrer un exemple

- **Identifiant:** S03-13
- **Durée:** 2 minutes

### Contenu de la diapositive

- EX-01 : date absente → « à compléter : date »
- EX-02 : poids absent → « à compléter : poids »
- EX-03 : identifiant du lot absent → ?
- Vérifier chaque exemple avant de l'utiliser

### Notes pédagogiques

**Message à faire retenir:** Des exemples peuvent montrer une structure souhaitée lorsque le format reste difficile à décrire uniquement avec des mots.

Un exemple correspond au one-shot ; plusieurs exemples au few-shot. Les dossiers EX sont fictifs. La formulation attendue pour EX-03 est « à compléter : identifiant du lot ». Les exemples orientent le prompt courant ; ils ne modifient pas les poids du modèle et ne créent pas de règle métier.

## Diapositive 14 — Choisir la technique selon le problème

- **Identifiant:** S03-14
- **Durée:** 3 minutes

### Contenu de la diapositive

- Tâche claire → demande directe
- Format difficile à décrire → exemple vérifié
- Contexte important manquant → questionner d'abord
- Chaque chemin se termine par un contrôle

### Notes pédagogiques

**Message à faire retenir:** Utiliser une technique de prompting parce qu'elle répond à une incertitude précise.

Utiliser le diagramme de décision existant. Demander quelle approche convient à l'avis aux agents et laquelle convient à un dossier fictif dont le champ manquant n'a pas encore été identifié.

## Diapositive 15 — Demander avant d'inventer

- **Identifiant:** S03-15
- **Durée:** 2 minutes

### Contenu de la diapositive

- Quel est le public ?
- Quel champ manque ?
- Quelle consigne approuvée peut être utilisée ?
- « Je ne sais pas » reste une inconnue

### Notes pédagogiques

**Message à faire retenir:** Un contexte manquant peut déclencher des questions ciblées plutôt qu'un ajout non fondé.

Présenter le prompting en entretien comme une méthode de collecte de contexte, pas comme un moyen de rendre vraie une information incertaine. N'utiliser aucune donnée réelle de membre ou de client.

## Diapositive 16 — Recueillir le contexte une question à la fois

- **Identifiant:** S03-16
- **Durée:** 2 minutes

### Contenu de la diapositive

- Poser une question à la fois
- Marquer l'information indisponible comme inconnue
- Résumer les faits confirmés
- Rédiger seulement à partir de ce qui est confirmé

### Notes pédagogiques

**Message à faire retenir:** Séparer les informations confirmées de celles qui manquent encore.

Utiliser la capture de la première question réelle de ChatGPT dans l'exercice fictif. La capture montre la première question, pas la preuve d'une réponse finale correcte. Si la réponse n'est pas disponible, la conserver comme inconnue.

## Diapositive 17 — Décomposer en opérations observables

- **Identifiant:** S03-17
- **Durée:** 2 minutes

### Contenu de la diapositive

1. Relever les champs fournis
2. Signaler les informations manquantes
3. Rédiger l'avis provisoire
4. Le soumettre à un agent pour contrôle

### Notes pédagogiques

**Message à faire retenir:** Une tâche en plusieurs étapes est plus facile à contrôler lorsque les résultats intermédiaires sont explicites.

Il s'agit d'étapes de travail observables, pas du raisonnement interne caché du modèle. Chaque étape peut être comparée à la source et peut encore échouer. La décision humaine reste hors du modèle.

## Diapositive 18 — Comparer avant de réutiliser

- **Identifiant:** S03-18
- **Durée:** 3 minutes

### Contenu de la diapositive

- Comparer le fondement factuel
- Comparer la clarté et l'adaptation au public
- Comparer le format et les contraintes
- Une version utile peut devenir un modèle réutilisable

### Notes pédagogiques

**Message à faire retenir:** Définir les critères avant de choisir une version à conserver comme point de départ.

Le classement de ses propres sorties par un modèle n'est pas une vérification indépendante. Une version peut devenir un point de départ réutilisable seulement après contrôle humain. La réutilisation doit encore tenir compte d'une nouvelle source, d'un nouveau public ou d'une nouvelle contrainte.

## Diapositive 19 — Repérer l'affirmation non fondée

- **Identifiant:** S03-19
- **Durée:** 4 minutes

### Contenu de la diapositive

- Simulation pédagogique : « Saisissez le lot, la date et le poids. »
- « Les lots incomplets sont certifiés sous 24 heures. »
- Quelles affirmations ne sont pas fondées sur S03-04 ?
- Comment préciser la première phrase ?

### Notes pédagogiques

**Message à faire retenir:** Chaque affirmation opérationnelle du brouillon doit pouvoir être reliée à la source fournie.

Prévoir un temps de lecture et d'échange en binôme. La certification et le délai ne sont pas fondés. « Le lot » doit être précisé en « identifiant du lot ». Cette simulation volontairement erronée n'est pas la vraie réponse ChatGPT montrée plus tôt.

## Diapositive 20 — Corriger l'écart précis

- **Identifiant:** S03-20
- **Durée:** 3 minutes

### Contenu de la diapositive

- Supprimer délai et certification
- N'ajouter aucune règle absente de S03-04
- Citer identifiant du lot, date et poids
- Conserver « à compléter » et la vérification par un agent

### Notes pédagogiques

**Message à faire retenir:** Une relance utile nomme ce qui a échoué et demande une nouvelle version vérifiable.

Comparer la simulation révisée à S03-04 ligne par ligne. Le résultat corrigé reste un brouillon jusqu'au contrôle d'une personne habilitée.

## Diapositive 21 — Construire un prompt professionnel réutilisable

- **Identifiant:** S03-21
- **Durée:** 4 minutes

### Contenu de la diapositive

- 2 min : remplir les éléments utiles du cadre
- Utiliser des variables pour les informations qui changent
- 1 min : choisir direct, exemple, entretien ou décomposition
- 1 min : échanger, relever une inconnue et nommer un contrôle

### Notes pédagogiques

**Message à faire retenir:** Transformer le cadre en modèle contrôlable pour une tâche répétée.

Les participants peuvent partir de S03-04 ou d'une autre tâche professionnelle fictive et sûre. Le modèle peut inclure rôle, tâche, contexte, public, format, contraintes et critères de qualité. Tous les champs ne sont pas obligatoires. N'exiger aucune donnée confidentielle réelle.

## Diapositive 22 — Critiquer le prompt d'un autre binôme

- **Identifiant:** S03-22
- **Durée:** 3 minutes

### Contenu de la diapositive

- La tâche est-elle claire ?
- Le contexte fourni est-il suffisant ?
- Public, format et contraintes sont-ils exploitables ?
- Les critères de qualité sont-ils vérifiables ?

### Notes pédagogiques

**Message à faire retenir:** Un retour utile identifie une faiblesse concrète et propose une correction ciblée.

Demander aux binômes de proposer une amélioration précise. Critiquer le prompt, pas la personne. Si la validation ou la vérification manque dans le processus global, la nommer séparément sans en faire un huitième élément du prompt.

## Diapositive 23 — Évaluer la réponse séparément

- **Identifiant:** S03-23
- **Durée:** 2 minutes

### Contenu de la diapositive

- Faits fondés sur la source ?
- Public, format et contraintes respectés ?
- Inconnues toujours visibles ?
- Critères de qualité satisfaits ?
- Responsable humain de la validation identifié ?

### Notes pédagogiques

**Message à faire retenir:** Un prompt bien cadré et une réponse acceptable exigent deux contrôles distincts.

Demander quel contrôle échoue pour la promesse de certification inventée. Un modèle peut aider à inspecter un texte, mais son auto-évaluation n'est pas une vérification indépendante. La personne responsable valide l'usage professionnel.

## Diapositive 24 — Même méthode avec une image ou un document

- **Identifiant:** S03-24
- **Durée:** 2 minutes

### Contenu de la diapositive

- Image ou document fourni → relever seulement ce qui est lisible
- Illisible ou absent → marquer comme inconnu
- Appliquer tâche, contexte, format, contraintes et critères
- Contrôle humain avant usage professionnel

### Notes pédagogiques

**Message à faire retenir:** Un nouveau type d'entrée change la source, pas le besoin d'une consigne précise et d'une vérification.

Relier brièvement au prompting multimodal canonique. Une image convaincante ne prouve pas son authenticité et le texte extrait n'est pas automatiquement exact.

## Diapositive 25 — Le prompting fait partie de la méthode professionnelle

- **Identifiant:** S03-25
- **Durée:** 1 minute

### Contenu de la diapositive

- RÉSULTAT → CONTEXTE → INSTRUCTION
- SÉCURITÉ → VÉRIFICATION
- Structurer → évaluer → corriger → réutiliser si pertinent
- Ensuite : travailler avec des documents et des informations

### Notes pédagogiques

**Message à faire retenir:** Une bonne conception de la consigne aide le travail professionnel seulement si elle reste reliée au contexte, à la sécurité, à la vérification et à la responsabilité humaine.

Rappeler que S03 approfondit la couche « instruction ». Faire la transition vers S04 : travailler avec des documents et des informations demande la même discipline de prompting avec un ancrage dans les sources et une vérification plus poussés.
