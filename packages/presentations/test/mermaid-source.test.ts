import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  canonicalMermaidSource,
  parseCanonicalModule,
  serializeMermaidSourceManifest,
  writeMermaidSources,
} from '../src/index.js';

const markdown = `# Test Module

## Learning Objectives

- Explain the relationship.

## Concept Map

\`\`\`mermaid
flowchart LR
    A[Input] --> B[Output]
\`\`\`

Explain how input becomes output.

## Final Summary

- Review the relationship.
`;

test('Mermaid source extraction is deterministic', async () => {
  const repositoryRoot = process.cwd();

  const content = parseCanonicalModule(markdown, {
    courseId: 'course_test',
    moduleId: 'module_test',
    language: 'en',
    sourcePath: resolve(repositoryRoot, 'courses/01-test/en/01-test.md'),
    repositoryRoot,
  });

  await mkdir(resolve(repositoryRoot, '.artifacts'), { recursive: true });

  const temporaryRoot = await mkdtemp(resolve(repositoryRoot, '.artifacts', 'mermaid-test-'));

  try {
    const first = await writeMermaidSources(content, {
      repositoryRoot,
      outputRoot: temporaryRoot,
    });

    const second = await writeMermaidSources(content, {
      repositoryRoot,
      outputRoot: temporaryRoot,
    });

    assert.equal(first.diagrams.length, 1);

    assert.equal(serializeMermaidSourceManifest(first), serializeMermaidSourceManifest(second));

    const diagram = first.diagrams[0];

    assert.ok(diagram);

    const bytes = await readFile(resolve(repositoryRoot, diagram.path), 'utf8');

    assert.equal(
      bytes,
      canonicalMermaidSource(
        `flowchart LR
    A[Input] --> B[Output]`,
      ),
    );

    assert.ok(diagram.mmdSha256);
    assert.equal(diagram.definitionSha256, content.diagrams[0]?.definitionSha256);
  } finally {
    await rm(temporaryRoot, {
      recursive: true,
      force: true,
    });
  }
});
