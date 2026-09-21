import type { ModuleContent } from '../content/model.js';
import { descendantBlocks, descendantSections } from './content-tree.js';
import type { DeckSpec } from './model.js';

export interface DeckResourceCoverage {
  diagrams: number;
  codeExamples: number;
  tables: number;
}

function assertExactlyOnce(
  resourceType: string,
  expectedIds: readonly string[],
  actualIds: readonly string[],
): void {
  const counts = new Map<string, number>();

  for (const id of actualIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  for (const id of expectedIds) {
    const count = counts.get(id) ?? 0;

    if (count !== 1) {
      throw new Error(
        `Deck resource coverage requires exactly one ${resourceType} slide for ${id}; found ${count}.`,
      );
    }
  }

  const expected = new Set(expectedIds);

  for (const id of actualIds) {
    if (!expected.has(id)) {
      throw new Error(`Deck contains unexpected ${resourceType} resource ${id}.`);
    }
  }
}

export function validateDeckResourceCoverage(
  spec: DeckSpec,
  content: ModuleContent,
): DeckResourceCoverage {
  const expectedDiagrams = content.diagrams.map((diagram) => diagram.diagramId);

  const expectedCode = content.codeExamples.map((example) => example.codeExampleId);

  const expectedTables = descendantSections(content.sections)
    .flatMap((section) => descendantBlocks(section.blocks))
    .filter((block) => block.kind === 'table')
    .map((table) => table.id);

  const actualDiagrams = spec.slides
    .filter((slide) => slide.kind === 'diagram')
    .map((slide) => slide.diagramId);

  const actualCode = spec.slides
    .filter((slide) => slide.kind === 'code')
    .map((slide) => slide.codeExampleId);

  const actualTables = spec.slides
    .filter((slide) => slide.kind === 'table')
    .map((slide) => slide.tableId);

  assertExactlyOnce('diagram', expectedDiagrams, actualDiagrams);

  assertExactlyOnce('code', expectedCode, actualCode);

  assertExactlyOnce('table', expectedTables, actualTables);

  return {
    diagrams: expectedDiagrams.length,
    codeExamples: expectedCode.length,
    tables: expectedTables.length,
  };
}
