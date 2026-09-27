# Visuels de la séance S01

Les schémas des diapositives 08, 10, 20 et 25 sont définis dans les fichiers `.mmd` : ils
montrent respectivement les approches de l’IA, les types d’apprentissage, le travail hors
connexion et la génération augmentée par récupération. Les écrans des diapositives 21 et 23
illustrent une alerte et un échange « demande → brouillon de réponse » ; ils sont **simulés** et
ne reproduisent ni un logiciel en production ni une réponse reçue d’un service d’IA.

Les fichiers `.html` et `.mmd` constituent les sources éditables. Depuis la racine du dépôt,
exécuter `node --import tsx scripts/generate-s01-visuals.mjs` pour régénérer les PNG et les SVG
avec le navigateur utilisé par Mermaid. Reconstruire ensuite les PPTX, les vérifier et recréer
leurs animations. Les fichiers binaires générés sont conservés dans le dépôt afin que les
supports puissent être reconstruits sans lancer le rendu Mermaid à chaque fois.
