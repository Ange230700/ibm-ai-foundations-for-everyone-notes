import type { ContentBlock, ModuleContent } from '../content/model.js';
import { descendantBlocks, descendantSections } from './content-tree.js';
import type { DeckSourceRef, DeckSpec, SlideSpec } from './model.js';

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string,
): void {
  const allowed = new Set(allowedKeys);

  const unknown = Object.keys(value).filter((key) => !allowed.has(key));

  if (unknown.length > 0) {
    throw new Error(`${label} contains unknown properties: ${unknown.join(', ')}.`);
  }
}

function collectSourceBlockIds(content: ModuleContent): Set<string> {
  const result = new Set<string>();

  result.add(content.titleSource.blockId);

  for (const section of descendantSections(content.sections)) {
    result.add(section.source.blockId);

    for (const block of descendantBlocks(section.blocks)) {
      result.add(block.id);
    }
  }

  return result;
}

function validateSourceRef(input: unknown, blockIds: Set<string>, label: string): DeckSourceRef {
  assertObject(input, label);

  assertExactKeys(
    input,
    ['path', 'heading', 'headingPath', 'blockIds', 'startLine', 'endLine'],
    label,
  );

  if (
    typeof input.path !== 'string' ||
    typeof input.heading !== 'string' ||
    !Array.isArray(input.headingPath) ||
    !input.headingPath.every((item) => typeof item === 'string') ||
    !Array.isArray(input.blockIds) ||
    input.blockIds.length === 0 ||
    !input.blockIds.every((item) => typeof item === 'string') ||
    typeof input.startLine !== 'number' ||
    typeof input.endLine !== 'number'
  ) {
    throw new Error(`${label} has invalid source-reference fields.`);
  }

  if (input.startLine <= 0 || input.endLine < input.startLine) {
    throw new Error(`${label} has invalid source line bounds.`);
  }

  for (const blockId of input.blockIds) {
    if (!blockIds.has(blockId)) {
      throw new Error(`${label} references unknown block ${blockId}.`);
    }
  }

  return input as unknown as DeckSourceRef;
}

const baseSlideKeys = ['kind', 'slideId', 'title', 'sourceRefs'] as const;

const slideKeys: Record<SlideSpec['kind'], readonly string[]> = {
  title: [...baseSlideKeys, 'subtitle'],
  objectives: [...baseSlideKeys, 'items', 'leadIn'],
  overview: [...baseSlideKeys, 'items'],
  concepts: [...baseSlideKeys, 'concepts'],
  diagram: [...baseSlideKeys, 'diagramId', 'explanation'],
  table: [...baseSlideKeys, 'tableId', 'headers', 'rows', 'explanation'],
  code: [...baseSlideKeys, 'codeExampleId', 'language', 'code', 'explanation'],
  summary: [...baseSlideKeys, 'items'],
};

function validateSlideIdentity(
  input: unknown,
  blockIds: Set<string>,
  index: number,
): {
  value: Record<string, unknown>;
  kind: SlideSpec['kind'];
  label: string;
} {
  const label = `slides[${index}]`;

  assertObject(input, label);

  if (typeof input.kind !== 'string' || !(input.kind in slideKeys)) {
    throw new Error(`${label}.kind is not supported.`);
  }

  const kind = input.kind as SlideSpec['kind'];

  assertExactKeys(input, slideKeys[kind], label);

  if (
    typeof input.slideId !== 'string' ||
    !input.slideId.trim() ||
    typeof input.title !== 'string' ||
    !input.title.trim()
  ) {
    throw new Error(`${label} must contain non-empty slideId and title fields.`);
  }

  if (!Array.isArray(input.sourceRefs) || input.sourceRefs.length === 0) {
    throw new Error(`${label} must retain at least one source reference.`);
  }

  input.sourceRefs.forEach((source, sourceIndex) =>
    validateSourceRef(source, blockIds, `${label}.sourceRefs[${sourceIndex}]`),
  );

  return {
    value: input,
    kind,
    label,
  };
}

function validateStringItems(value: unknown, label: string): void {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string' && item.trim().length > 0)
  ) {
    throw new Error(`${label} must be an array of non-empty strings.`);
  }
}

function validateTitleSlide(value: Record<string, unknown>, label: string): void {
  if (typeof value.subtitle !== 'string') {
    throw new TypeError(`${label}.subtitle must be a string.`);
  }
}

function validateObjectivesSlide(value: Record<string, unknown>, label: string): void {
  validateStringItems(value.items, `${label}.items`);

  if (value.leadIn !== undefined && typeof value.leadIn !== 'string') {
    throw new TypeError(`${label}.leadIn must be a string.`);
  }
}

function validateConceptsSlide(value: Record<string, unknown>, label: string): void {
  const valid =
    Array.isArray(value.concepts) &&
    value.concepts.length > 0 &&
    value.concepts.every((concept) => {
      if (concept === null || typeof concept !== 'object' || Array.isArray(concept)) {
        return false;
      }

      const record = concept as Record<string, unknown>;
      const keys = Object.keys(record).sort((left, right) => left.localeCompare(right));

      return (
        keys.join(',') === 'explanation,title' &&
        typeof record.title === 'string' &&
        record.title.trim().length > 0 &&
        typeof record.explanation === 'string' &&
        record.explanation.trim().length > 0
      );
    });

  if (!valid) {
    throw new TypeError(
      `${label}.concepts must contain only non-empty title and explanation strings.`,
    );
  }
}

function validateDiagramSlide(
  value: Record<string, unknown>,
  label: string,
  content: ModuleContent,
): void {
  if (typeof value.diagramId !== 'string') {
    throw new TypeError(`${label}.diagramId must be a string.`);
  }

  const diagramExists = content.diagrams.some(
    (candidate) => candidate.diagramId === value.diagramId,
  );

  if (!diagramExists) {
    throw new Error(`${label} references an unknown diagram.`);
  }

  if (typeof value.explanation !== 'string') {
    throw new TypeError(`${label}.explanation must be a string.`);
  }
}

function canonicalTable(
  content: ModuleContent,
  tableId: string,
): Extract<ContentBlock, { kind: 'table' }> | undefined {
  return descendantSections(content.sections)
    .flatMap((section) => descendantBlocks(section.blocks))
    .find(
      (block): block is Extract<ContentBlock, { kind: 'table' }> =>
        block.kind === 'table' && block.id === tableId,
    );
}

function validateTableSlide(
  value: Record<string, unknown>,
  label: string,
  content: ModuleContent,
): void {
  if (typeof value.tableId !== 'string') {
    throw new TypeError(`${label}.tableId must be a string.`);
  }

  const table = canonicalTable(content, value.tableId);

  if (!table) {
    throw new Error(`${label} references an unknown table.`);
  }

  const [expectedHeaders = [], ...expectedRows] = table.rows;
  const validFields =
    Array.isArray(value.headers) &&
    value.headers.every((cell) => typeof cell === 'string') &&
    Array.isArray(value.rows) &&
    value.rows.every(
      (row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'),
    ) &&
    typeof value.explanation === 'string';

  if (!validFields) {
    throw new TypeError(`${label} has invalid table fields.`);
  }

  const rows = value.rows as string[][];
  const serializedRows = JSON.stringify(rows);
  const matchesCanonicalSlice =
    (rows.length === 0 && expectedRows.length === 0) ||
    expectedRows.some(
      (_, start) =>
        JSON.stringify(expectedRows.slice(start, start + rows.length)) === serializedRows,
    );

  if (JSON.stringify(value.headers) !== JSON.stringify(expectedHeaders) || !matchesCanonicalSlice) {
    throw new Error(`${label} silently changes canonical table content.`);
  }
}

function validateCodeSlide(
  value: Record<string, unknown>,
  label: string,
  content: ModuleContent,
): void {
  if (typeof value.codeExampleId !== 'string') {
    throw new TypeError(`${label}.codeExampleId must be a string.`);
  }

  const example = content.codeExamples.find(
    (candidate) => candidate.codeExampleId === value.codeExampleId,
  );

  if (!example) {
    throw new Error(`${label} references an unknown code example.`);
  }

  if (value.code !== example.code || value.language !== example.language) {
    throw new Error(`${label} silently changes canonical code.`);
  }

  if (typeof value.explanation !== 'string') {
    throw new TypeError(`${label}.explanation must be a string.`);
  }
}

function validateSlide(
  input: unknown,
  content: ModuleContent,
  blockIds: Set<string>,
  index: number,
): SlideSpec {
  const { value, kind, label } = validateSlideIdentity(input, blockIds, index);

  switch (kind) {
    case 'title':
      validateTitleSlide(value, label);
      break;
    case 'objectives':
      validateObjectivesSlide(value, label);
      break;
    case 'overview':
    case 'summary':
      validateStringItems(value.items, `${label}.items`);
      break;
    case 'concepts':
      validateConceptsSlide(value, label);
      break;
    case 'diagram':
      validateDiagramSlide(value, label, content);
      break;
    case 'table':
      validateTableSlide(value, label, content);
      break;
    case 'code':
      validateCodeSlide(value, label, content);
      break;
  }

  return value as unknown as SlideSpec;
}

export function validateDeckSpec(input: unknown, content: ModuleContent): DeckSpec {
  assertObject(input, 'deck spec');

  assertExactKeys(
    input,
    [
      'schemaVersion',
      'status',
      'deckId',
      'courseId',
      'moduleId',
      'language',
      'title',
      'audience',
      'purpose',
      'themeId',
      'sourcePath',
      'sourceSha256',
      'moduleContentSha256',
      'slides',
    ],
    'deck spec',
  );

  if (
    input.schemaVersion !== 1 ||
    input.status !== 'accepted' ||
    input.courseId !== content.courseId ||
    input.moduleId !== content.moduleId ||
    input.language !== content.language ||
    input.sourcePath !== content.sourcePath ||
    input.sourceSha256 !== content.sourceSha256 ||
    input.moduleContentSha256 !== content.moduleContentSha256
  ) {
    throw new Error('Deck spec metadata does not match the extracted canonical module.');
  }

  if (
    typeof input.deckId !== 'string' ||
    !input.deckId.trim() ||
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    typeof input.audience !== 'string' ||
    !input.audience.trim() ||
    typeof input.purpose !== 'string' ||
    !input.purpose.trim() ||
    typeof input.themeId !== 'string' ||
    !input.themeId.trim() ||
    !Array.isArray(input.slides) ||
    input.slides.length === 0
  ) {
    throw new Error('Deck spec has invalid top-level fields.');
  }

  const blockIds = collectSourceBlockIds(content);

  const slides = input.slides.map((slide, index) => validateSlide(slide, content, blockIds, index));

  const slideIds = slides.map((slide) => slide.slideId);

  if (new Set(slideIds).size !== slideIds.length) {
    throw new Error('Deck spec slide IDs must be unique.');
  }

  return {
    ...(input as unknown as DeckSpec),
    slides,
  };
}
