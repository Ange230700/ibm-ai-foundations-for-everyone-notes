# Cours 02 — IA générative : introduction et applications

Ce dossier adapte les notes canoniques du cours 02 en séances animées par un formateur. Les notes
complètes restent les références :

- `courses/02-generative-ai-introduction-and-applications/fr/`
- `courses/02-generative-ai-introduction-and-applications/en/`

Le contrat pédagogique bilingue de S02 se trouve dans
`docs/teaching/s02-generative-ai-60-min-content-contract.md`. Le scénario suit la
[coopérative cacaoyère fictive près de Soubré](../../../docs/case-studies/cocoa-cooperative-near-soubre.md),
sans nom d’organisation ni résultats réels attribués au cas.

## Sources pédagogiques

- Français : `fr/sessions/s02-introduction-a-l-ia-generative.md` — **version de travail**, 26
  diapositives, 60 minutes.
- Anglais : `en/sessions/s02-generative-ai-introduction.md` — **version de travail**, 26
  diapositives, 60 minutes.

Les deux sources conservent les mêmes identifiants S02-01 à S02-26, l’ordre, les durées, les
interactions et les limites du cas fictif. Elles reprennent respectivement les contenus projetés
du contrat en français et en anglais. Les notes sont adaptées à l’oral plutôt que traduites mot à
mot.

Chaque diapositive comporte un titre de niveau 2, un identifiant S02-nn, une durée, le contenu
projeté et des notes de présentation. Les deux premières déclarent leur rôle de couverture et
d’objectifs. Les éléments de la démonstration non présents dans les notes du cours portent une
mention de simulation pédagogique ; les décisions sensibles restent sous contrôle humain.

## Statut de production

Les trois adaptations canoniques françaises restent en attente de révision personnelle. La source
pédagogique bilingue sert de brouillon pour examiner la sélection des notions et le rythme de la
séance. Le manifeste déclare S02 et la chaîne génère désormais des PDF et PPTX de travail :
`pnpm teaching:artifact build --session=s02`, puis
`pnpm teaching:artifact verify --session=s02`. Les affiches, captures et schémas évoqués dans
les notes sont intégrés aux supports. Les PPTX comprennent quatre schémas par langue. L’anglais
comporte cinq écrans simulés ; le français comporte quatre écrans simulés et un véritable échange
avec ChatGPT sur le cas fictif en S02-11. Les simulations sont générées depuis `teaching/visuals/s02/` avec
`node --import tsx scripts/generate-s02-visuals.mjs` avant la construction des PPTX. Les
simulations sont des exemples fictifs créés pour la séance. La capture originale en français se
trouve à `teaching/visuals/s02/fr/chat-capture.png` et n’est pas réécrite par ce générateur.
La réponse de S02-11 reste un brouillon à vérifier ; le contre-exemple volontairement erroné de
S02-12 n’est pas issu de cet échange.
Sur Windows avec PowerPoint, `pnpm teaching:artifact animate --session=s02` crée une copie
`session-animated.pptx` dans chaque langue. Elle anime les 26 diapositives avec 53 clics et 158
effets sur les textes par langue. Les schémas et captures restent visibles dès l’arrivée sur la
diapositive. La révision visuelle et une répétition chronométrée restent nécessaires avant toute
diffusion définitive.
