# Protéger les informations dans un travail assisté par l’IA

## Pourquoi l’exactitude ne suffit pas

Un brouillon assisté par l’IA peut être exact tout en restant dangereux à utiliser. Avant de transmettre des informations à un outil, de diffuser un brouillon ou d’agir sur une recommandation, il faut répondre à trois questions distinctes. L’affirmation est-elle étayée par une source appropriée ? Ces informations peuvent-elles être utilisées dans cet outil et pour cet usage ? La personne qui prend ou approuve la décision suivante en a-t-elle l’autorité ?

Ces contrôles répondent à des risques différents. La vérification des sources peut révéler une affirmation inventée ou déformée, mais elle n’autorise pas la divulgation d’informations confidentielles. L’autorisation de préparer un brief interne ne signifie pas qu’un destinataire externe peut le recevoir. Un vérificateur peut repérer une erreur sans avoir le pouvoir d’approuver un paiement, une décision de stockage ou une autre action opérationnelle.

Les notions de vie privée, d’équité, de transparence, de responsabilité, de supervision humaine et de gestion continue des risques sont adaptées du contenu canonique du cours IBM indiqué ci-dessous. Le workflow et le cas fictif de ce document sont des adaptations pédagogiques indépendantes ; ils ne décrivent ni une politique d’IBM ni les contrôles d’un service d’IA réel.

## Trois questions à traiter séparément

| Contrôle     | Question                                                                     | Éléments à vérifier                                                       |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Sources      | L’affirmation est-elle étayée et ses limites sont-elles conservées ?         | Une source identifiée, un champ traçable et toute incertitude indiquée    |
| Autorisation | Ces informations peuvent-elles être utilisées par cet outil pour cet usage ? | Une règle applicable, un responsable habilité et un destinataire autorisé |
| Autorité     | Qui peut vérifier, approuver, envoyer ou agir ?                              | Un rôle défini et une décision consignée pour l’action concernée          |

Conservez ces contrôles séparés dans les échanges et les dossiers. Un « oui » dans une colonne ne remplace pas les autres. Si l’autorisation n’est pas claire, arrêtez-vous avant tout partage et consultez le responsable des informations. Si une donnée restreinte a déjà été partagée, interrompez toute nouvelle diffusion et prévenez ce responsable ; ne supposez pas que la suppression d’une copie annule l’exposition.

## Conserver ce que la source ne précise pas

Considérons ce dossier fictif d’exercice. La source A indique que la réception au point CP-A a été interrompue à 09:10 le 18 octobre 2026, puis a repris à 09:40. Elle n’en précise pas la raison. La source B indique 540 kilogrammes pour le lot SB-601. Elle précise que le poids du lot SB-602 n’est pas renseigné et qu’une vérification est nécessaire, sans identifier l’origine du champ manquant. La source C consigne un mouvement de SB-601 à 12:15 vers la Zone A. Elle ne fournit aucune décision d’acceptation, de qualité, d’autorisation de stockage ou de paiement.

Un résumé interne prudent pourrait indiquer :

> Le 18 octobre 2026, la réception au point CP-A a été interrompue à 09:10 puis a repris à 09:40 ; la raison n’est pas précisée. La source B indique 540 kg pour SB-601 et signale que le poids de SB-602 manque et doit être vérifié. La source C consigne le mouvement de SB-601 à 12:15 vers la Zone A, qui est uniquement un libellé de destination. Le dossier ne précise pas l’origine du champ manquant et n’approuve aucune décision concernant un lot, le stockage, la qualité ou le paiement.

La formulation est volontairement limitée. Elle sépare les observations, les inconnues et les décisions. Elle ne transforme ni un champ vide en accusation, ni une destination en approbation, ni une explication plausible en fait. Cette précaution est importante lorsqu’un système génératif peut produire des détails convaincants mais non étayés par les documents fournis.

## Protéger les informations tout au long du workflow

La minimisation des données commence par la tâche : n’inclure que les informations nécessaires à l’usage autorisé. Retirer un nom ne garantit pas à lui seul qu’une personne ne soit plus identifiable ; la combinaison d’un lieu, d’un rôle et d’autres détails peut encore la désigner. Les informations commerciales confidentielles doivent également être protégées, même si elles n’identifient personne. Dans l’exercice, toute une pièce jointe restreinte est exclue. Son contenu ne doit apparaître ni dans l’outil, ni dans le brief, ni dans le suivi de vérification.

Suivez une séquence de contrôle au lieu de traiter la génération comme une approbation :

1. Définir l’objectif, les données minimales nécessaires, l’outil autorisé et les destinataires prévus.
2. Exclure les informations restreintes ou inutiles avant la rédaction. En cas de doute, demander une décision avant tout partage.
3. Vérifier chaque affirmation importante à partir des sources admises. Conserver les valeurs manquantes, les incertitudes et l’attribution.
4. Demander au vérificateur désigné de consigner les corrections et de renvoyer ou d’arrêter tout brouillon non étayé.
5. Obtenir l’approbation requise pour la diffusion concernée. Distinguer l’autorisation de diffuser un brief de l’approbation d’une décision opérationnelle.
6. Consigner les questions ouvertes et l’état d’approbation dans le dossier restreint approprié ; tout partage externe nécessite une décision explicite distincte.

La supervision humaine n’est utile que si le vérificateur peut examiner les preuves, corriger ou arrêter le résultat et distinguer son rôle de contrôle de l’autorité d’approuver l’action suivante. Demander à quelqu’un de « vérifier l’IA » sans temps, sans accès aux sources ni possibilité d’arrêt ne constitue pas un contrôle suffisant.

## La gouvernance se poursuit après le brouillon

L’équité, la vie privée, la transparence, la responsabilité, la fiabilité et la supervision humaine doivent être prises en compte tout au long du cycle de vie d’un système d’IA. Dans un workflow professionnel, cela consiste à définir les responsabilités et les usages autorisés, contrôler les sorties et leurs effets, prévoir une procédure de correction, surveiller les nouveaux risques et réviser ou arrêter le processus si nécessaire. La vérification d’un document ne prouve pas que tous les usages ultérieurs sont sûrs.

Le cours présente des cadres de gouvernance et de gestion des risques, notamment le NIST AI Risk Management Framework et l’EU AI Act, comme exemples de références externes. Ce document pédagogique n’évalue pas les obligations juridiques actuelles et ne détermine pas les règles applicables à une organisation ou à un territoire. Ces questions nécessitent une analyse qualifiée et à jour.

## Attribution et limites de révision

Les notions d’IA responsable de ce document sont une adaptation rédigée à partir du cours 01, module 04, « Issues, Concerns, and Ethical Considerations », de la spécialisation Coursera _AI Foundations for Everyone_ d’IBM, en anglais et en français. La source pédagogique professionnelle indépendante est S06, « Security, Privacy, and Responsibility ». Les exemples CP-A, les lots et les règles sont des éléments fictifs maintenus avec S06 ; ils ne constituent ni des faits IBM canoniques, ni des dossiers réels de coopérative, ni une politique professionnelle. La longueur, l’organisation et les exemples explicatifs sont adaptés, et non copiés de diapositives ou de notes d’animation.

Des contrôles automatiques peuvent vérifier l’identité des sources, le Markdown pris en charge, l’intégrité du texte et la pagination du PDF. La préservation du sens, de l’attribution et des réserves appropriées exige toujours une révision éditoriale humaine.
