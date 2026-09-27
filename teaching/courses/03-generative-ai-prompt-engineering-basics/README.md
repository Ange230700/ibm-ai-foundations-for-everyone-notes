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

- Français : `fr/sessions/s03-conception-des-prompts.md` — version de travail, 25 diapositives et
  60 minutes, avec notes de présentation.
- Anglais : `en/sessions/s03-prompt-engineering-basics.md` — version de travail, 25 diapositives et
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
