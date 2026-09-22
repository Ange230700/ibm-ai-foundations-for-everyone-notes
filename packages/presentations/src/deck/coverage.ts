import type { ModuleContent, TableBlock } from '../content/model.js';
import { descendantBlocks, descendantSections } from './content-tree.js';
import type { DeckSpec, TableSlideSpec } from './model.js';

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

function sameRows(left: readonly string[][], right: readonly string[][]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertTableCoverage(
  expectedTables: readonly TableBlock[],
  actualSlides: readonly TableSlideSpec[],
): void {
  const expectedIds = new Set(expectedTables.map((table) => table.id));

  for (const slide of actualSlides) {
    if (!expectedIds.has(slide.tableId)) {
      throw new Error(`Deck contains unexpected table resource ${slide.tableId}.`);
    }
  }

  for (const table of expectedTables) {
    const segments = actualSlides.filter((slide) => slide.tableId === table.id);

    if (segments.length === 0) {
      throw new Error(`Deck resource coverage requires table slides for ${table.id}; found 0.`);
    }

    const [headers = [], ...rows] = table.rows;

    if (segments.some((slide) => !sameRows([slide.headers], [headers]))) {
      throw new Error(`Deck table segments for ${table.id} do not preserve canonical headers.`);
    }

    const actualRows = segments.flatMap((slide) => slide.rows);

    if (!sameRows(actualRows, rows)) {
      throw new Error(`Deck table segments for ${table.id} do not reproduce canonical rows.`);
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
    .filter((block): block is TableBlock => block.kind === 'table');

  const actualDiagrams = spec.slides
    .filter((slide) => slide.kind === 'diagram')
    .map((slide) => slide.diagramId);

  const actualCode = spec.slides
    .filter((slide) => slide.kind === 'code')
    .map((slide) => slide.codeExampleId);

  const actualTables = spec.slides.filter(
    (slide): slide is TableSlideSpec => slide.kind === 'table',
  );

  assertExactlyOnce('diagram', expectedDiagrams, actualDiagrams);

  assertExactlyOnce('code', expectedCode, actualCode);

  assertTableCoverage(expectedTables, actualTables);

  return {
    diagrams: expectedDiagrams.length,
    codeExamples: expectedCode.length,
    tables: expectedTables.length,
  };
}
