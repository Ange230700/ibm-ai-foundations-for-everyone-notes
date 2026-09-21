import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { parseCanonicalModule, type Section } from '../src/index.js';

const en = `# Test Module

## Learning Objectives

- Explain the concept.

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Concept] --> B[Related concept]
\`\`\`

Explain the relationship.

## Core Concepts

### Concept 1

#### Definition

A definition.

#### Why it matters

A reason.

#### Example

An example.

#### Common mistake

A mistake.

## Final Summary

- Review the concept.
`;

const fr = `# Module de test

## Objectifs d’apprentissage

- Expliquer le concept.

## Carte conceptuelle

\`\`\`mermaid
flowchart LR
    A[Concept] --> B[Concept associé]
\`\`\`

Expliquer la relation.

## Concepts clés

### Concept 1

#### Définition

Une définition.

#### Pourquoi c’est important

Une raison.

#### Exemple

Un exemple.

#### Erreur fréquente

Une erreur.

## Synthèse finale

- Revoir le concept.
`;

function sectionIds(sections: Section[]): string[] {
  return sections.flatMap((section) => [section.id, ...sectionIds(section.children)]);
}

test('EN and FR canonical modules retain matching structural identities', () => {
  const repositoryRoot = process.cwd();

  const common = {
    courseId: 'course_test',
    moduleId: 'module_test',
    repositoryRoot,
  };

  const english = parseCanonicalModule(en, {
    ...common,
    language: 'en',
    sourcePath: resolve(repositoryRoot, 'courses/01-test/en/01-test.md'),
  });

  const french = parseCanonicalModule(fr, {
    ...common,
    language: 'fr',
    sourcePath: resolve(repositoryRoot, 'courses/01-test/fr/01-test.md'),
  });

  assert.deepEqual(sectionIds(english.sections), sectionIds(french.sections));

  assert.deepEqual(
    english.diagrams.map((diagram) => diagram.diagramId),
    french.diagrams.map((diagram) => diagram.diagramId),
  );

  assert.equal(english.language, 'en');
  assert.equal(french.language, 'fr');

  assert.notEqual(english.sourceSha256, french.sourceSha256);

  assert.notEqual(english.moduleContentSha256, french.moduleContentSha256);
});
