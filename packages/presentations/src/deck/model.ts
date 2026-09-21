import type { SourceRef } from '../content/model.js';

export interface DeckSourceRef {
  path: string;
  heading: string;
  headingPath: string[];
  blockIds: string[];
  startLine: number;
  endLine: number;
}

interface BaseSlideSpec {
  slideId: string;
  title: string;
  sourceRefs: DeckSourceRef[];
}

export interface TitleSlideSpec extends BaseSlideSpec {
  kind: 'title';
  subtitle: string;
}

export interface ObjectivesSlideSpec extends BaseSlideSpec {
  kind: 'objectives';
  items: string[];
  leadIn?: string;
}

export interface OverviewSlideSpec extends BaseSlideSpec {
  kind: 'overview';
  items: string[];
}

export interface ConceptSlideSpec extends BaseSlideSpec {
  kind: 'concepts';
  concepts: Array<{
    title: string;
    explanation: string;
  }>;
}

export interface DiagramSlideSpec extends BaseSlideSpec {
  kind: 'diagram';
  diagramId: string;
  explanation: string;
}

export interface TableSlideSpec extends BaseSlideSpec {
  kind: 'table';
  tableId: string;
  headers: string[];
  rows: string[][];
  explanation: string;
}

export interface CodeSlideSpec extends BaseSlideSpec {
  kind: 'code';
  codeExampleId: string;
  language: string;
  code: string;
  explanation: string;
}

export interface SummarySlideSpec extends BaseSlideSpec {
  kind: 'summary';
  items: string[];
}

export type SlideSpec =
  | TitleSlideSpec
  | ObjectivesSlideSpec
  | OverviewSlideSpec
  | ConceptSlideSpec
  | DiagramSlideSpec
  | TableSlideSpec
  | CodeSlideSpec
  | SummarySlideSpec;

export interface DeckSpec {
  schemaVersion: 1;
  status: 'accepted';
  deckId: string;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  title: string;
  audience: string;
  purpose: string;
  themeId: string;
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
  slides: SlideSpec[];
}

export function deckSourceRef(source: SourceRef): DeckSourceRef {
  return {
    path: source.path,
    heading: source.headingPath.at(-1) ?? '',
    headingPath: source.headingPath,
    blockIds: [source.blockId],
    startLine: source.startLine,
    endLine: source.endLine,
  };
}
