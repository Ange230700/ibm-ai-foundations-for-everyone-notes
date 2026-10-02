# Visuels de la séance S01

Les schémas des diapositives 08, 10, 19 et 24 sont définis dans les fichiers `.mmd`. Ils
montrent respectivement les approches complémentaires de l’IA, les modes d’apprentissage, le
travail avec une connexion intermittente et la génération augmentée par récupération.

La diapositive 20 utilise un écran simulé pour illustrer la séparation entre ce que l’assistant
peut faire, ce que l’équipe vérifie et les décisions qui restent humaines.

La diapositive 22 utilise `chat-capture.png`, une capture réelle d’un échange avec ChatGPT
appliqué au scénario fictif de la coopérative. Cette capture illustre un exemple pédagogique et
non un document professionnel déjà validé. Les fichiers `prompt.html` et `prompt.png` restent
une simulation éditable du même type d’usage.

Les fichiers `.html` et `.mmd` constituent les sources éditables. Depuis la racine du dépôt,
exécuter `node.exe --import tsx scripts/generate-s01-visuals.mjs` pour régénérer les PNG et les
SVG avec le navigateur utilisé par Mermaid. Reconstruire ensuite les PPTX, les vérifier et recréer
leurs animations. Les fichiers binaires générés sont conservés dans le dépôt afin que les supports
puissent être reconstruits sans lancer le rendu Mermaid à chaque fois.
