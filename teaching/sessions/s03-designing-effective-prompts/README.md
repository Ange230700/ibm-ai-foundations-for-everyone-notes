# Cours 03 — Principes de base de la conception des prompts

Ce dossier prépare une séance bilingue d’une heure à partir des notes canoniques du cours 03 :

- `courses/03-generative-ai-prompt-engineering-basics/fr/`
- `courses/03-generative-ai-prompt-engineering-basics/en/`

Le [contrat pédagogique S03](../../../docs/teaching/s03-prompt-engineering-60-min-content-contract.md)
fixe **25 diapositives** et **60 minutes** dans chaque langue. Le [cas fil
rouge](../../../docs/case-studies/cocoa-cooperative-near-soubre.md) est celui d’une coopérative
cacaoyère fictive, sans nom, près de Soubré. La consigne d’exercice reprend uniquement les trois
champs et le traitement des dossiers incomplets déjà présentés en S02.

## Sources pédagogiques

- Français : `fr/session.md` — version de travail, 25 diapositives et
  60 minutes, avec notes de présentation.
- Anglais : `en/session.md` — version de travail, 25 diapositives et
  60 minutes, avec notes de présentation.

Le fichier français conserve une idée principale par diapositive. Les éléments projetés restent
brefs ; les notes détaillent les relances, les corrections attendues et les limites des réponses
simulées. La source anglaise conserve les mêmes identifiants, durées, interactions, nombre et
type d’éléments projetés. Les deux premières diapositives déclarent les rôles `course-title` et
`course-objectives` utilisés par la chaîne de présentation.

## Statut de production

Cette source est un **brouillon pédagogique**. Les adaptations françaises canoniques du cours 03
attendent encore leur révision personnelle. Les deux sources sont alignées sur la structure et
sur le contrat, sans remplacer une relecture pédagogique bilingue. S03 est déclaré dans
`manifest.json` : les quatre supports PDF/PPTX bilingues peuvent être générés et vérifiés avec
`pnpm teaching:artifact build --session=s03` et `pnpm teaching:artifact verify --session=s03`.
Leur contrôle visuel et une répétition chronométrée restent à faire. Le contrat de contenu n’est
pas une preuve que la séance réelle tient déjà en 60 minutes.

Les PPTX de travail contiennent quatre diagrammes Mermaid par langue. Chaque langue comporte trois
écrans simulés, une capture d’un véritable échange avec ChatGPT sur la consigne fictive en S03-08
et une capture de la première question de l’entretien en S03-16. La réponse « je ne sais pas » est
un repère à prononcer pendant la séance ; elle n’apparaît pas dans la capture.
Le contre-exemple volontairement erroné en S03-19
n’est pas issu de cet échange. Les sources modifiables des simulations sont dans
`teaching/visuals/s03/`. La capture originale est
`teaching/visuals/s03/<langue>/chat-capture.png` et `interview-capture.png` pour chaque langue. Pour actualiser les simulations, exécuter
`node --import tsx scripts/generate-s03-visuals.mjs`, reconstruire S03, puis vérifier les PPTX.
Ce générateur ne réécrit pas les captures originales.
Les PDF projetés continuent de refléter le contenu textuel des sources pédagogiques.

Sous Windows avec PowerPoint installé, exécuter
`pnpm teaching:artifact animate --session=s03` après la construction des PPTX. La commande
crée `session-animated.pptx` dans chaque dossier de langue, avec 52 clics et 155 effets
répartis sur les 25 diapositives. Les images restent visibles dès l’ouverture des diapositives.
La version non animée et les PDF demeurent disponibles pour la relecture.
