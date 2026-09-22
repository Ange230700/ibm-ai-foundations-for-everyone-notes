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

function grouped<T>(items: readonly T[], size: number): T[][] {
  const groups: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
}

function balancedGroups<T>(items: readonly T[], maximumSize: number): T[][] {
  if (items.length === 0) {
    return [];
  }

  const groupCount = Math.ceil(items.length / maximumSize);
  const baseSize = Math.floor(items.length / groupCount);
  const extraItems = items.length % groupCount;
  const groups: T[][] = [];
  let offset = 0;

  for (let index = 0; index < groupCount; index += 1) {
    const size = baseSize + (index < extraItems ? 1 : 0);

    groups.push(items.slice(offset, offset + size));
    offset += size;
  }

  return groups;
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

  if (slide.kind !== 'table' || slide.rows.length <= 10) {
    state.slides.push(slide);
    return;
  }

  const continuation = content.language === 'fr' ? '(suite)' : '(continued)';
  const rowGroups = balancedGroups(slide.rows, 10);

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
    state.slides.push({
      kind: 'overview',
      slideId: `${sectionId}-overview`,
      title: section.title,
      items: directItems,
      sourceRefs: sectionSourceRefs(section),
    });
  }

  const childGroups = grouped(section.children, 3);

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
    const objectiveGroups = balancedGroups(content.objectives, MAX_OBJECTIVES_PER_SLIDE);

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
    const summaryGroups = balancedGroups(content.summary, 8);

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
    themeId: options.themeId ?? 'default-native-v1',
    sourcePath: content.sourcePath,
    sourceSha256: content.sourceSha256,
    moduleContentSha256: content.moduleContentSha256,
    slides,
  };

  const validated = validateDeckSpec(candidate, content);

  validateDeckResourceCoverage(validated, content);

  return validated;
}
