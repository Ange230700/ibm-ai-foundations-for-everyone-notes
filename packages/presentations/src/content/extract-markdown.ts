import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';

import { canonicalJson, occurrenceId, sha256, slugify, toPosixPath } from '@coursera-notes/core';
import type { Code, Heading, List, ListItem, Nodes, Parent, Root, Table, TableCell } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import { canonicalSectionIdentity } from './section-role.js';
import type {
  CodeExample,
  ContentBlock,
  DiagramReferenceBlock,
  InlineRun,
  ListBlock,
  ListItemContent,
  MermaidDiagram,
  ModuleContent,
  Section,
  SourceRef,
  TableBlock,
} from './model.js';

export interface ExtractOptions {
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  repositoryRoot: string;
}

function childNodes(node: Nodes): Nodes[] {
  if (!('children' in node) || !Array.isArray(node.children)) {
    return [];
  }

  return (node as unknown as Parent).children as Nodes[];
}

function textFromNode(node: Nodes): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  const children = childNodes(node);

  if (children.length === 0) {
    return '';
  }

  const separator = node.type === 'listItem' || node.type === 'blockquote' ? ' ' : '';

  return children
    .map((child) => textFromNode(child))
    .filter(Boolean)
    .join(separator)
    .replace(/\s+/g, ' ')
    .trim();
}

function inlineRuns(node: Nodes, marks: Omit<InlineRun, 'text'> = {}): InlineRun[] {
  const style = { ...marks };

  if (node.type === 'strong') style.strong = true;
  if (node.type === 'emphasis') style.emphasis = true;
  if (node.type === 'inlineCode') style.code = true;

  if (node.type === 'break') {
    return [{ text: '\n', ...style }];
  }

  if ('value' in node && typeof node.value === 'string') {
    return [{ text: node.value.replace(/\r?\n/g, ' '), ...style }];
  }

  return childNodes(node).flatMap((child) => inlineRuns(child, style));
}

function lineRange(node: Nodes): {
  startLine: number;
  endLine: number;
} {
  if (!node.position) {
    throw new Error(`Markdown AST node ${node.type} has no source position.`);
  }

  return {
    startLine: node.position.start.line,
    endLine: node.position.end.line,
  };
}

function rawFenceBody(source: string, node: Code): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;

  if (start === undefined || end === undefined) {
    throw new Error('Fenced code node has no source offsets.');
  }

  const rawFence = source.slice(start, end);
  const firstLineBreak = rawFence.indexOf('\n');
  const lastLineBreak = rawFence.lastIndexOf('\n');

  if (firstLineBreak < 0 || lastLineBreak <= firstLineBreak) {
    return node.value;
  }

  const bodyEnd = rawFence[lastLineBreak - 1] === '\r' ? lastLineBreak - 1 : lastLineBreak;

  const rawBody = rawFence.slice(firstLineBreak + 1, bodyEnd);

  return rawBody.replaceAll('\r\n', '\n') === node.value.replaceAll('\r\n', '\n')
    ? rawBody
    : node.value;
}

function sourceReference(
  path: string,
  headingPath: string[],
  blockId: string,
  node: Nodes,
): SourceRef {
  return {
    path,
    headingPath,
    blockId,
    ...lineRange(node),
  };
}

function listItemContent(
  item: ListItem,
  path: string,
  headingPath: string[],
  blockId: string,
  appendBlock: (node: Nodes, blocks: ContentBlock[], headingPath: string[]) => void,
): ListItemContent {
  if (item.children.some((child) => child.type !== 'paragraph' && child.type !== 'list')) {
    const blocks: ContentBlock[] = [];

    for (const child of item.children) {
      appendBlock(child, blocks, headingPath);
    }

    return {
      text: blocks
        .filter((block) => block.kind === 'paragraph')
        .map((block) => block.text)
        .join(' '),
      children: blocks.filter((block) => block.kind === 'list'),
      blocks,
    };
  }

  const textualChildren = item.children.filter((child) => child.type !== 'list');

  const text = textualChildren
    .map((child) => textFromNode(child))
    .filter(Boolean)
    .join(' ');

  const children = item.children
    .filter((child): child is List => child.type === 'list')
    .map((child, index) =>
      listBlock(child, path, headingPath, `${blockId}/nested-${index + 1}`, appendBlock),
    );

  const inlines = textualChildren.flatMap((child, index) => [
    ...(index > 0 ? [{ text: ' ' }] : []),
    ...inlineRuns(child),
  ]);

  return {
    text,
    inlines,
    children,
  };
}

function listBlock(
  node: List,
  path: string,
  headingPath: string[],
  blockId: string,
  appendBlock: (node: Nodes, blocks: ContentBlock[], headingPath: string[]) => void,
): ListBlock {
  const block: ListBlock = {
    kind: 'list',
    id: blockId,
    ordered: node.ordered ?? false,
    items: node.children.map((item) =>
      listItemContent(item, path, headingPath, blockId, appendBlock),
    ),
    source: sourceReference(path, headingPath, blockId, node),
  };

  if (node.start !== null && node.start !== undefined) {
    block.start = node.start;
  }

  return block;
}

function tableRows(node: Table): string[][] {
  return node.children.map((row) =>
    row.children.map((cell: TableCell) => textFromNode(cell).replace(/\s+/g, ' ').trim()),
  );
}

function flattenList(block: ListBlock): string[] {
  const values: string[] = [];

  for (const item of block.items) {
    if (item.text) {
      values.push(item.text);
    }

    for (const child of item.children) {
      values.push(...flattenList(child));
    }
  }

  return values;
}

function sectionByIdentity(sections: Section[], identity: string): Section | undefined {
  for (const section of sections) {
    if (canonicalSectionIdentity(section.title) === identity) {
      return section;
    }

    const nested = sectionByIdentity(section.children, identity);

    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function sectionTextItems(section: Section): string[] {
  const items: string[] = [];

  for (const block of section.blocks) {
    if (block.kind === 'paragraph' && block.text) {
      items.push(block.text);
    } else if (block.kind === 'list') {
      items.push(...flattenList(block));
    }
  }

  return items;
}

function attachBlockExplanations(
  blocks: ContentBlock[],
  diagramById: Map<string, MermaidDiagram>,
): void {
  blocks.forEach((block, index) => {
    if (block.kind === 'blockquote') {
      attachBlockExplanations(block.blocks, diagramById);
    }

    if (block.kind === 'list') {
      for (const item of block.items) {
        attachBlockExplanations(item.blocks ?? item.children, diagramById);
      }
    }

    if (block.kind !== 'diagram') {
      return;
    }

    const explanation = blocks[index + 1];

    if (explanation?.kind !== 'paragraph' || !explanation.text) {
      throw new Error(
        `Mermaid diagram ${block.diagramId} must be followed by an explanatory paragraph.`,
      );
    }

    const diagram = diagramById.get(block.diagramId);

    if (diagram) {
      diagram.explanation = explanation.text;

      if (explanation.inlines) {
        diagram.explanationInlines = explanation.inlines;
      }
    }
  });
}

function attachDiagramExplanations(sections: Section[], diagrams: MermaidDiagram[]): void {
  const diagramById = new Map(diagrams.map((diagram) => [diagram.diagramId, diagram]));

  for (const section of sections) {
    attachBlockExplanations(section.blocks, diagramById);
    attachDiagramExplanations(section.children, diagrams);
  }
}

function appendSection(
  node: Heading,
  stack: Section[],
  sections: Section[],
  sourcePath: string,
  modulePrefix: string,
): void {
  if (node.depth === 1) {
    return;
  }

  while (stack.length > 0 && (stack.at(-1)?.depth ?? 0) >= node.depth) {
    stack.pop();
  }

  const sectionTitle = textFromNode(node);
  const parentPath = stack.at(-1)?.headingPath ?? [];
  const headingPath = [...parentPath, sectionTitle];

  const identityHeadingPath = headingPath.map(canonicalSectionIdentity);

  const sectionId =
    `${modulePrefix}/section/` + identityHeadingPath.map((heading) => slugify(heading)).join('/');

  const section: Section = {
    id: sectionId,
    depth: node.depth,
    title: sectionTitle,
    inlines: inlineRuns(node),
    headingPath,
    blocks: [],
    children: [],
    source: sourceReference(sourcePath, headingPath, `${sectionId}/heading`, node),
  };

  const parent = stack.at(-1);

  if (parent) {
    parent.children.push(section);
  } else {
    sections.push(section);
  }

  stack.push(section);
}

function moduleTitle(tree: Root, sourcePath: string): Heading {
  const headings = tree.children.filter(
    (node): node is Heading => node.type === 'heading' && node.depth === 1,
  );

  if (headings.length !== 1) {
    throw new Error(`${sourcePath} must contain exactly one H1; found ${headings.length}.`);
  }

  const heading = headings[0];

  if (!heading) {
    throw new Error(`${sourcePath} has no H1.`);
  }

  return heading;
}

export function parseCanonicalModule(source: string, options: ExtractOptions): ModuleContent {
  const relativeSourcePath = toPosixPath(relative(options.repositoryRoot, options.sourcePath));

  if (relativeSourcePath === '..' || relativeSourcePath.startsWith('../')) {
    throw new Error(`Source must be inside the repository: ${options.sourcePath}`);
  }

  const tree: Root = fromMarkdown(source, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  const titleHeading = moduleTitle(tree, relativeSourcePath);
  const title = textFromNode(titleHeading);

  const sections: Section[] = [];
  const stack: Section[] = [];
  const diagrams: MermaidDiagram[] = [];
  const codeExamples: CodeExample[] = [];
  const occurrenceCounters = new Map<string, number>();

  const modulePrefix = `${options.courseId}/${options.moduleId}`;

  function nextId(kind: string, headingPath: string[]): string {
    const identityHeadingPath = headingPath.map(canonicalSectionIdentity);

    const key = `${kind}:${identityHeadingPath.join('/')}`;

    const ordinal = (occurrenceCounters.get(key) ?? 0) + 1;

    occurrenceCounters.set(key, ordinal);

    return occurrenceId(`${modulePrefix}/${kind}`, identityHeadingPath, ordinal);
  }

  function appendBlock(node: Nodes, blocks: ContentBlock[], headingPath: string[]): void {
    if (node.type === 'blockquote') {
      const blockId = nextId('blockquote', headingPath);
      const children: ContentBlock[] = [];

      for (const child of node.children) {
        appendBlock(child, children, headingPath);
      }

      blocks.push({
        kind: 'blockquote',
        id: blockId,
        blocks: children,
        source: sourceReference(relativeSourcePath, headingPath, blockId, node),
      });

      return;
    }

    if (node.type === 'paragraph') {
      const blockId = nextId('paragraph', headingPath);

      blocks.push({
        kind: 'paragraph',
        id: blockId,
        text: textFromNode(node),
        inlines: inlineRuns(node),
        source: sourceReference(relativeSourcePath, headingPath, blockId, node),
      });

      return;
    }

    if (node.type === 'list') {
      const blockId = nextId('list', headingPath);

      blocks.push(listBlock(node, relativeSourcePath, headingPath, blockId, appendBlock));

      return;
    }

    if (node.type === 'table') {
      const blockId = nextId('table', headingPath);

      const table: TableBlock = {
        kind: 'table',
        id: blockId,
        align: node.align ?? [],
        rows: tableRows(node),
        cellInlines: node.children.map((row) => row.children.map((cell) => inlineRuns(cell))),
        source: sourceReference(relativeSourcePath, headingPath, blockId, node),
      };

      blocks.push(table);
      return;
    }

    if (node.type === 'code') {
      const code = rawFenceBody(source, node);

      if ((node.lang ?? '').toLowerCase() === 'mermaid') {
        const diagramId = nextId('diagram', headingPath);

        const reference: DiagramReferenceBlock = {
          kind: 'diagram',
          id: diagramId,
          diagramId,
          source: sourceReference(relativeSourcePath, headingPath, diagramId, node),
        };

        blocks.push(reference);

        diagrams.push({
          diagramId,
          definition: code,
          definitionSha256: sha256(code),
          explanation: '',
          source: reference.source,
        });

        return;
      }

      const codeExampleId = nextId('code', headingPath);

      const sourceRef = sourceReference(relativeSourcePath, headingPath, codeExampleId, node);

      blocks.push({
        kind: 'code',
        id: codeExampleId,
        codeExampleId,
        source: sourceRef,
      });

      codeExamples.push({
        codeExampleId,
        language: node.lang ?? 'text',
        code,
        source: sourceRef,
      });
    }
  }

  for (const node of tree.children) {
    if (node.type === 'heading') {
      appendSection(node, stack, sections, relativeSourcePath, modulePrefix);

      continue;
    }

    const section = stack.at(-1);

    if (!section) {
      continue;
    }

    appendBlock(node, section.blocks, section.headingPath);
  }

  attachDiagramExplanations(sections, diagrams);

  const objectivesSection = sectionByIdentity(sections, 'learning-objectives');

  const summarySection = sectionByIdentity(sections, 'final-summary');

  if (!objectivesSection || !summarySection) {
    throw new Error(
      `${relativeSourcePath} must contain Learning Objectives/Objectifs d’apprentissage and Final Summary/Synthèse finale sections.`,
    );
  }

  const contentWithoutDigest = {
    schemaVersion: 1 as const,
    courseId: options.courseId,
    moduleId: options.moduleId,
    language: options.language,
    title,
    titleSource: sourceReference(
      relativeSourcePath,
      [title],
      `${modulePrefix}/title`,
      titleHeading,
    ),
    objectives: sectionTextItems(objectivesSection),
    sections,
    diagrams,
    codeExamples,
    summary: sectionTextItems(summarySection),
    sourcePath: relativeSourcePath,
    sourceSha256: sha256(source),
  };

  return {
    ...contentWithoutDigest,
    moduleContentSha256: sha256(canonicalJson(contentWithoutDigest)),
  };
}

export async function extractCanonicalModule(options: ExtractOptions): Promise<ModuleContent> {
  return parseCanonicalModule(await readFile(options.sourcePath, 'utf8'), options);
}
