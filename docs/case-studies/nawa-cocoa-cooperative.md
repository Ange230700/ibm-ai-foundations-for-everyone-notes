# Nawa Cocoa Cooperative Case-Study Contract

## Purpose

The Nawa Cocoa Cooperative is the recurring fictional example for the completed modules in Courses
01–03. It connects the course concepts to cocoa production and collection in Côte d’Ivoire without
presenting a real cooperative, deployed product, or measured result.

Recorded course activities, attributed external cases, quiz evidence, and personal reflections keep
their original context. The cooperative is a synthesis layer used to apply the concepts consistently.

## Stable Scenario

- **Organization:** a fictional cocoa cooperative near Soubré in the Nawa region.
- **People:** member producers, field agents, quality technicians, warehouse staff, an operations
  manager, and an elected cooperative board.
- **Work:** producer registration, field visits, lot intake, quality checks, collection planning,
  traceability records, producer communication, and shipment preparation.
- **Equipment:** low-cost phones or tablets and an application that records essential field and lot
  data without connectivity, then synchronizes pending records later.
- **Data:** member and farm records, field observations, lot identifiers, weights, quality results,
  collection history, warehouse movements, approved procedures, and shipment documents.
- **Operating constraints:** intermittent connectivity or electricity, limited technical staff,
  seasonal workload, multilingual communication needs, and strict evidence requirements for
  traceability and certification.

## AI Boundary

The proposed assistant may:

- classify field reports and route them for review;
- flag incomplete or unusual lot records;
- estimate collection volumes from historical and current operational data;
- summarize warehouse, field, and traceability information;
- draft producer notices, staff checklists, and internal reports;
- help interpret a bean, leaf, label, or document image when a suitable multimodal model is
  available; and
- retrieve approved procedures and explain the evidence behind a recommendation.

The proposed assistant must not:

- diagnose a crop disease or replace an agronomist;
- accept or reject a cocoa lot;
- assign a final quality grade or certification status;
- determine a producer’s payment;
- submit an official certificate or shipment record; or
- invent measurements, traceability events, regulatory requirements, or inspection results.

## Offline and Online Responsibilities

The core application records field visits and lot events locally, queues updates, and synchronizes
when a connection returns. Cached rules may identify missing fields or duplicate identifiers while
offline. Features that require a remote generative model wait for connectivity or use an explicitly
supported on-device model. The case study never assumes that every AI capability runs offline.

## Evaluation Rules

The modules may propose measures such as incomplete records, duplicate identifiers, reconciliation
time, report preparation time, forecast error, staff corrections, or the share of generated drafts
accepted after review. These are evaluation criteria, not achieved results.

## Bilingual Terms

| English                | French                 |
| ---------------------- | ---------------------- |
| Nawa Cocoa Cooperative | Coopérative Cacao Nawa |
| member producer        | producteur membre      |
| field agent            | agent de terrain       |
| quality technician     | technicien qualité     |
| lot intake             | réception du lot       |
| traceability record    | donnée de traçabilité  |
| collection forecast    | prévision de collecte  |
| human review           | validation humaine     |

## Module Map

| Course and module | Cooperative lens                                                            |
| ----------------- | --------------------------------------------------------------------------- |
| 01.01             | Narrow, generative, and augmented intelligence in cooperative work          |
| 01.02             | Machine learning, NLP, computer vision, edge processing, and cloud services |
| 01.03             | Adoption, agents, RAG, workforce change, and operational measures           |
| 01.04             | Privacy, fairness, transparency, security, governance, and human oversight  |
| 02.01             | Discriminative and generative AI capabilities                               |
| 02.02             | Selecting text, image, audio, and code tools for a defined operational need |
| 02.03             | Combining generated text, imagery, and HTML in a reviewed training project  |
| 03.01             | Prompt components, constraints, evaluation, and refinement                  |
| 03.02             | Interview, few-shot, decomposition, multimodal, and comparison techniques   |
| 03.03             | A final prompt workflow for traceability and lot-review communication       |

## Context References

These sources ground the Côte d’Ivoire context without supplying performance claims for the
fictional cooperative:

- Coffee-Cocoa Council of Côte d’Ivoire, sustainable and traceable cocoa:
  <https://conseilcafecacao.ci/index.php?id=1489&option=com_k2&view=item>
- World Bank, digital phytosanitary certification for cocoa trade in Côte d’Ivoire:
  <https://blogs.worldbank.org/en/trade/digital-certification-makes-cocoa-traders-cote-divoire-more-competitive>
