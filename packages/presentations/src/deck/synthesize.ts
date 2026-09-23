import type {
  CodeExample,
  ContentBlock,
  ListBlock,
  MermaidDiagram,
  ModuleContent,
  Section,
  SourceRef,
  TableBlock,
} from '../content/model.js';
import { descendantBlocks, descendantSections } from './content-tree.js';
import { validateDeckResourceCoverage } from './coverage.js';
import { deckSourceRef, type DeckSourceRef, type DeckSpec, type SlideSpec } from './model.js';
import { validateDeckSpec } from './validate.js';

export interface SynthesizeDeckOptions {
  themeId?: string;
  audience?: string;
  purpose?: string;
}

type ResourceBlock = Extract<
  ContentBlock,
  {
    kind: 'diagram' | 'code' | 'table';
  }
>;

const labels = {
  en: {
    objectives: 'Learning objectives',
    objectivesContinued: 'Learning objectives (continued)',
    summary: 'Final summary',
    summaryContinued: 'Final summary (continued)',
    diagram: 'Diagram',
    code: 'Code example',
    table: 'Comparison',
    audience: 'Learners reviewing the program module',
    purpose: 'Present the canonical module as a concise, source-traceable native deck',
    review: 'Review the role of',
  },
  fr: {
    objectives: 'Objectifs d’apprentissage',
    objectivesContinued: 'Objectifs d’apprentissage (suite)',
    summary: 'Résumé final',
    summaryContinued: 'Résumé final (suite)',
    diagram: 'Schéma',
    code: 'Exemple de code',
    table: 'Comparaison',
    audience: 'Apprenants révisant le module du programme',
    purpose: 'Présenter le module canonique sous forme d’un diaporama natif concis et traçable',
    review: 'Examiner le rôle de',
  },
} as const;

const MAX_OBJECTIVES_PER_SLIDE = 8;

const MAX_LIST_VISUAL_LINES_PER_SLIDE = 10;

const MAX_TABLE_ROWS_PER_SLIDE = 10;

const MAX_TABLE_VISUAL_LINES_PER_SLIDE = 20;

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase();
}

function flattenList(block: ListBlock): string[] {
  return block.items.flatMap((item) => [
    ...(item.text ? [item.text] : []),
    ...item.children.flatMap(flattenList),
  ]);
}

function directTextItems(section: Section, limit = Number.POSITIVE_INFINITY): string[] {
  const items: string[] = [];

  for (const block of section.blocks) {
    if (block.kind === 'paragraph' && block.text) {
      items.push(block.text);
    }

    if (block.kind === 'list') {
      items.push(...flattenList(block));
    }

    if (items.length >= limit) {
      break;
    }
  }

  return items.slice(0, limit);
}

function firstText(section: Section):
  | {
      text: string;
      source: SourceRef;
    }
  | undefined {
  for (const block of section.blocks) {
    if (block.kind === 'paragraph' && block.text) {
      return {
        text: block.text,
        source: block.source,
      };
    }

    if (block.kind === 'list') {
      const item = flattenList(block).find(Boolean);

      if (item) {
        return {
          text: item,
          source: block.source,
        };
      }
    }
  }

  for (const child of section.children) {
    const result = firstText(child);

    if (result) {
      return result;
    }
  }

  return undefined;
}

function findSectionContainingItems(
  sections: Section[],
  items: readonly string[],
): Section | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const expected = items.map(normalizeText);

  return descendantSections(sections).find((section) => {
    const actual = new Set(directTextItems(section).map(normalizeText));

    return expected.every((item) => actual.has(item));
  });
}

function dedupeSourceRefs(refs: DeckSourceRef[]): DeckSourceRef[] {
  const seen = new Set<string>();

  return refs.filter((ref) => {
    const key = [ref.path, ref.startLine, ref.endLine, ...ref.blockIds].join(':');

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function sectionSourceRefs(section: Section): DeckSourceRef[] {
  return dedupeSourceRefs([
    deckSourceRef(section.source),
    ...descendantBlocks(section.blocks).map((block) => deckSourceRef(block.source)),
    ...section.children.flatMap(sectionSourceRefs),
  ]);
}

function collectResources(section: Section): ResourceBlock[] {
  const direct = descendantBlocks(section.blocks).filter(
    (block): block is ResourceBlock =>
      block.kind === 'diagram' || block.kind === 'code' || block.kind === 'table',
  );

  return [...direct, ...section.children.flatMap(collectResources)];
}

function findContainingSection(sections: Section[], blockId: string): Section | undefined {
  for (const section of sections) {
    if (descendantBlocks(section.blocks).some((block) => block.id === blockId)) {
      return section;
    }

    const nested = findContainingSection(section.children, blockId);

    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function nearbyExplanation(content: ModuleContent, blockId: string, fallback: string): string {
  const section = findContainingSection(content.sections, blockId);

  if (!section) {
    return fallback;
  }

  const index = section.blocks.findIndex(
    (block) =>
      block.id === blockId ||
      (block.kind === 'diagram' && block.diagramId === blockId) ||
      (block.kind === 'code' && block.codeExampleId === blockId),
  );

  const adjacent = [section.blocks[index - 1], section.blocks[index + 1]].find(
    (block) => block?.kind === 'paragraph' && Boolean(block.text),
  );

  if (adjacent?.kind === 'paragraph') {
    return adjacent.text;
  }

  return firstText(section)?.text ?? fallback;
}

interface WeightedGroupOptions<T> {
  maximumItems: number;
  maximumWeight: number;
  weight: (item: T) => number;
}

function estimatedWrappedLines(value: string, charactersPerLine: number): number {
  return value.split(/\r?\n/u).reduce((total, line) => {
    const normalized = line.replace(/\s+/gu, ' ').trim();

    return total + Math.max(1, Math.ceil(normalized.length / charactersPerLine));
  }, 0);
}

function balancedWeightedGroups<T>(items: readonly T[], options: WeightedGroupOptions<T>): T[][] {
  if (items.length === 0) {
    return [];
  }

  const weights = items.map((item) => Math.max(1, options.weight(item)));
  const groups: T[][] = [];
  let current: T[] = [];
  let currentWeight = 0;

  items.forEach((item, index) => {
    const weight = weights[index] ?? 1;

    if (
      current.length > 0 &&
      (current.length >= options.maximumItems || currentWeight + weight > options.maximumWeight)
    ) {
      groups.push(current);
      current = [];
      currentWeight = 0;
    }

    current.push(item);
    currentWeight += weight;
  });

  if (current.length > 0) {
    groups.push(current);
  }

  const uniformWeight = weights.every((weight) => weight === weights[0]);

  if (groups.length > 1 && uniformWeight) {
    const baseSize = Math.floor(items.length / groups.length);
    const extraItems = items.length % groups.length;
    const balanced: T[][] = [];
    let offset = 0;

    for (let index = 0; index < groups.length; index += 1) {
      const size = baseSize + (index < extraItems ? 1 : 0);

      balanced.push(items.slice(offset, offset + size));
      offset += size;
    }

    return balanced;
  }

  return groups;
}

function listGroups(items: readonly string[], maximumItems = 8): string[][] {
  return balancedWeightedGroups(items, {
    maximumItems,
    maximumWeight: MAX_LIST_VISUAL_LINES_PER_SLIDE,
    weight: (item) => estimatedWrappedLines(item, 88),
  });
}

function conceptDensity(section: Section): number {
  const explanation = firstText(section)?.text ?? '';

  return estimatedWrappedLines(section.title, 34) + estimatedWrappedLines(explanation, 48);
}

function maximumConceptsFor(section: Section): number {
  const explanation = firstText(section)?.text ?? '';
  const density = conceptDensity(section);

  if (section.title.length > 110 || explanation.length > 430 || density > 16) {
    return 1;
  }

  if (section.title.length > 65 || explanation.length > 210 || density > 10) {
    return 2;
  }

  return 3;
}

function conceptGroups(sections: readonly Section[]): Section[][] {
  const groups: Section[][] = [];
  let current: Section[] = [];

  for (const section of sections) {
    const proposed = [...current, section];
    const groupLimit = Math.min(...proposed.map(maximumConceptsFor));

    if (current.length > 0 && proposed.length > groupLimit) {
      groups.push(current);
      current = [];
    }

    current.push(section);
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

function tableRowDensity(row: readonly string[], columnCount: number): number {
  const charactersPerLine = Math.max(16, Math.floor(105 / Math.max(1, columnCount)));

  return Math.max(1, ...row.map((cell) => estimatedWrappedLines(cell, charactersPerLine)));
}

function headingFor(source: SourceRef, fallback: string): string {
  return source.headingPath.at(-1) ?? fallback;
}

function conceptSlide(sections: Section[], slideId: string, language: 'en' | 'fr'): SlideSpec {
  const text = labels[language];

  return {
    kind: 'concepts',
    slideId,
    title:
      sections.length === 1
        ? (sections[0]?.title ?? text.summary)
        : sections.map((section) => section.title).join(' · '),
    concepts: sections.map((section) => ({
      title: section.title,
      explanation: firstText(section)?.text ?? `${text.review} ${section.title}.`,
    })),
    sourceRefs: dedupeSourceRefs(sections.flatMap(sectionSourceRefs)),
  };
}

function resourceSlide(
  content: ModuleContent,
  resource: ResourceBlock,
  ordinal: number,
): SlideSpec {
  const text = labels[content.language];

  const slideId = `resource-${String(ordinal).padStart(2, '0')}-${resource.kind}`;

  if (resource.kind === 'diagram') {
    const diagram: MermaidDiagram | undefined = content.diagrams.find(
      (candidate) => candidate.diagramId === resource.diagramId,
    );

    if (!diagram) {
      throw new Error(`Missing diagram ${resource.diagramId}.`);
    }

    return {
      kind: 'diagram',
      slideId,
      title: headingFor(resource.source, text.diagram),
      diagramId: diagram.diagramId,
      explanation: diagram.explanation,
      sourceRefs: [deckSourceRef(diagram.source)],
    };
  }

  if (resource.kind === 'code') {
    const example: CodeExample | undefined = content.codeExamples.find(
      (candidate) => candidate.codeExampleId === resource.codeExampleId,
    );

    if (!example) {
      throw new Error(`Missing code example ${resource.codeExampleId}.`);
    }

    return {
      kind: 'code',
      slideId,
      title: headingFor(example.source, text.code),
      codeExampleId: example.codeExampleId,
      language: example.language,
      code: example.code,
      explanation: nearbyExplanation(content, resource.id, text.code),
      sourceRefs: [deckSourceRef(example.source)],
    };
  }

  const table: TableBlock = resource;

  const [headers = [], ...rows] = table.rows;

  return {
    kind: 'table',
    slideId,
    title: headingFor(table.source, text.table),
    tableId: table.id,
    headers,
    rows,
    explanation: nearbyExplanation(content, table.id, text.table),
    sourceRefs: [deckSourceRef(table.source)],
  };
}

interface DeckBuildState {
  slides: SlideSpec[];
  emittedResources: Set<string>;
  sectionOrdinal: number;
  resourceOrdinal: number;
}

function requireMappedSection(
  content: ModuleContent,
  items: readonly string[],
  section: Section | undefined,
  label: string,
): void {
  if (items.length > 0 && !section) {
    throw new Error(`${content.sourcePath}: could not map canonical ${label} to a source section.`);
  }
}

function resourceIdentity(resource: ResourceBlock): string {
  if (resource.kind === 'diagram') {
    return resource.diagramId;
  }

  if (resource.kind === 'code') {
    return resource.codeExampleId;
  }

  return resource.id;
}

function emitResource(
  content: ModuleContent,
  state: DeckBuildState,
  resource: ResourceBlock,
): void {
  const key = `${resource.kind}:${resourceIdentity(resource)}`;

  if (state.emittedResources.has(key)) {
    return;
  }

  state.emittedResources.add(key);
  state.resourceOrdinal += 1;

  const slide = resourceSlide(content, resource, state.resourceOrdinal);

  if (slide.kind !== 'table') {
    state.slides.push(slide);
    return;
  }

  const continuation = content.language === 'fr' ? '(suite)' : '(continued)';
  const rowGroups = balancedWeightedGroups(slide.rows, {
    maximumItems: MAX_TABLE_ROWS_PER_SLIDE,
    maximumWeight: MAX_TABLE_VISUAL_LINES_PER_SLIDE,
    weight: (row) => tableRowDensity(row, slide.headers.length),
  });

  state.slides.push(
    ...rowGroups.map((rows, index) => ({
      ...slide,
      slideId:
        index === 0 ? slide.slideId : `${slide.slideId}-${String(index + 1).padStart(2, '0')}`,
      title: index === 0 ? slide.title : `${slide.title} ${continuation}`,
      rows,
    })),
  );
}

function appendSectionSlides(
  content: ModuleContent,
  state: DeckBuildState,
  section: Section,
): void {
  state.sectionOrdinal += 1;

  const sectionId = `section-${String(state.sectionOrdinal).padStart(2, '0')}`;
  const directItems = directTextItems(section, 5);

  if (directItems.length > 0) {
    const continuation = content.language === 'fr' ? '(suite)' : '(continued)';

    state.slides.push(
      ...listGroups(directItems).map((items, index) => ({
        kind: 'overview' as const,
        slideId:
          index === 0
            ? `${sectionId}-overview`
            : `${sectionId}-overview-${String(index + 1).padStart(2, '0')}`,
        title: index === 0 ? section.title : `${section.title} ${continuation}`,
        items,
        sourceRefs: sectionSourceRefs(section),
      })),
    );
  }

  const childGroups = conceptGroups(section.children);

  childGroups.forEach((group, groupIndex) => {
    if (group.length === 0) {
      return;
    }

    state.slides.push(
      conceptSlide(
        group,
        `${sectionId}-concepts-${String(groupIndex + 1).padStart(2, '0')}`,
        content.language,
      ),
    );
  });

  for (const resource of collectResources(section)) {
    emitResource(content, state, resource);
  }
}

export function synthesizeDeckSpec(
  content: ModuleContent,
  options: SynthesizeDeckOptions = {},
): DeckSpec {
  const text = labels[content.language];
  const objectivesSection = findSectionContainingItems(content.sections, content.objectives);
  const summarySection = findSectionContainingItems(content.sections, content.summary);

  requireMappedSection(content, content.objectives, objectivesSection, 'objectives');
  requireMappedSection(content, content.summary, summarySection, 'summary');

  const slides: SlideSpec[] = [
    {
      kind: 'title',
      slideId: 'title',
      title: content.title,
      subtitle: `${content.courseId} · ${content.moduleId}`,
      sourceRefs: [deckSourceRef(content.titleSource)],
    },
  ];

  if (content.objectives.length > 0 && objectivesSection) {
    const objectiveGroups = listGroups(content.objectives, MAX_OBJECTIVES_PER_SLIDE);

    objectiveGroups.forEach((items, index) => {
      slides.push({
        kind: 'objectives',
        slideId: index === 0 ? 'objectives' : `objectives-${String(index + 1).padStart(2, '0')}`,
        title: index === 0 ? text.objectives : text.objectivesContinued,
        items,
        sourceRefs: sectionSourceRefs(objectivesSection),
      });
    });
  }

  const excluded = new Set<Section>(
    [objectivesSection, summarySection].filter(
      (section): section is Section => section !== undefined,
    ),
  );
  const state: DeckBuildState = {
    slides,
    emittedResources: new Set<string>(),
    sectionOrdinal: 0,
    resourceOrdinal: 0,
  };

  for (const section of content.sections) {
    if (!excluded.has(section)) {
      appendSectionSlides(content, state, section);
    }
  }

  for (const resource of content.sections.flatMap(collectResources)) {
    emitResource(content, state, resource);
  }

  if (content.summary.length > 0 && summarySection) {
    const summaryGroups = listGroups(content.summary);

    slides.push(
      ...summaryGroups.map((items, index) => ({
        kind: 'summary' as const,
        slideId: index === 0 ? 'summary' : `summary-${String(index + 1).padStart(2, '0')}`,
        title: index === 0 ? text.summary : text.summaryContinued,
        items,
        sourceRefs: sectionSourceRefs(summarySection),
      })),
    );
  }

  const candidate: DeckSpec = {
    schemaVersion: 1,
    status: 'accepted',
    deckId: `${content.courseId}-${content.moduleId}-${content.language}`,
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    title: content.title,
    audience: options.audience ?? text.audience,
    purpose: options.purpose ?? text.purpose,
    themeId: options.themeId ?? 'kraak-consulting-native-v1',
    sourcePath: content.sourcePath,
    sourceSha256: content.sourceSha256,
    moduleContentSha256: content.moduleContentSha256,
    slides,
  };

  const validated = validateDeckSpec(candidate, content);

  validateDeckResourceCoverage(validated, content);

  return validated;
}
