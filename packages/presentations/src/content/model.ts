export interface SourceRef {
  path: string;
  headingPath: string[];
  blockId: string;
  startLine: number;
  endLine: number;
}

export interface InlineRun {
  text: string;
  strong?: boolean;
  emphasis?: boolean;
  code?: boolean;
}

export interface ParagraphBlock {
  kind: 'paragraph';
  id: string;
  text: string;
  inlines?: InlineRun[];
  source: SourceRef;
}

export interface ListItemContent {
  text: string;
  inlines?: InlineRun[];
  children: ListBlock[];
  blocks?: ContentBlock[];
}

export interface ListBlock {
  kind: 'list';
  id: string;
  ordered: boolean;
  start?: number;
  items: ListItemContent[];
  source: SourceRef;
}

export interface TableBlock {
  kind: 'table';
  id: string;
  align: Array<'left' | 'right' | 'center' | null>;
  rows: string[][];
  cellInlines?: InlineRun[][][];
  source: SourceRef;
}

export interface QuoteBlock {
  kind: 'blockquote';
  id: string;
  blocks: ContentBlock[];
  source: SourceRef;
}

export interface DiagramReferenceBlock {
  kind: 'diagram';
  id: string;
  diagramId: string;
  source: SourceRef;
}

export interface CodeReferenceBlock {
  kind: 'code';
  id: string;
  codeExampleId: string;
  source: SourceRef;
}

export type ContentBlock =
  ParagraphBlock | ListBlock | TableBlock | DiagramReferenceBlock | CodeReferenceBlock | QuoteBlock;

export interface Section {
  id: string;
  depth: number;
  title: string;
  inlines?: InlineRun[];
  headingPath: string[];
  blocks: ContentBlock[];
  children: Section[];
  source: SourceRef;
}

export interface MermaidDiagram {
  diagramId: string;
  definition: string;
  definitionSha256: string;
  explanation: string;
  explanationInlines?: InlineRun[];
  source: SourceRef;
}

export interface CodeExample {
  codeExampleId: string;
  language: string;
  code: string;
  source: SourceRef;
}

export interface ModuleContent {
  schemaVersion: 1;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  title: string;
  titleSource: SourceRef;
  objectives: string[];
  sections: Section[];
  diagrams: MermaidDiagram[];
  codeExamples: CodeExample[];
  summary: string[];
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
}
