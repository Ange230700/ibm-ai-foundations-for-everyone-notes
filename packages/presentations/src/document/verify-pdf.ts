import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import type { Nodes, Root, Table } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import type { ModuleContent } from '../content/model.js';
import { validatePdfBytes } from './render-pdf.js';

export interface VerifyModulePdfOptions {
  repositoryRoot: string;
  pdfPath: string;
}

export interface PdfSemanticVerificationRecord {
  schemaVersion: 1;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
  pdfPath: string;
  pdfSha256: string;
  pages: number;
  diagrams: number;
  blocks: {
    expected: number;
    matched: number;
  };
  semanticSha256: string;
}

interface PositionedText {
  str: string;
  x: number;
  y: number;
  height: number;
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PDF artifact must be inside the repository: ${absolutePath}`);
  }

  return value;
}

export function normalizePdfSemanticText(value: string): string {
  return value
    .normalize('NFKC')
    .replaceAll('\u00ad', '')
    .replace(/(\p{L})-\s+(?=\p{L})/gu, '$1-')
    .replace(/\s+/gu, ' ')
    .replace(/\/\s+/gu, '/')
    .replace(/\s([,.;:!?])/gu, '$1')
    .trim();
}

export function stripMermaidFences(markdown: string): {
  markdown: string;
  diagrams: number;
} {
  let diagrams = 0;

  const pattern = /^(`{3,}|~{3,})mermaid[^\r\n]*\r?\n[\s\S]*?^\1[ \t]*$/gmu;

  const stripped = markdown.replace(pattern, () => {
    diagrams += 1;
    return '';
  });

  return {
    markdown: stripped,
    diagrams,
  };
}

function plainText(node: Nodes): string {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
      return node.value;

    case 'image':
    case 'imageReference':
      return node.alt ?? '';

    case 'break':
      return ' ';

    default:
      return 'children' in node ? node.children.map(plainText).join('') : '';
  }
}

function tableBlocks(node: Table): string[] {
  return node.children
    .map((row) => row.children.map((cell) => plainText(cell)).join(' '))
    .map(normalizePdfSemanticText)
    .filter(Boolean);
}

export function semanticBlocksFromMarkdown(markdown: string): string[] {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  const blocks: string[] = [];

  const add = (value: string): void => {
    const normalized = normalizePdfSemanticText(value);

    if (normalized) {
      blocks.push(normalized);
    }
  };

  const visit = (node: Nodes): void => {
    switch (node.type) {
      case 'root':
      case 'blockquote':
      case 'list':
      case 'listItem':
        node.children.forEach(visit);
        return;

      case 'heading':
      case 'paragraph':
        add(plainText(node));
        return;

      case 'table':
        blocks.push(...tableBlocks(node));
        return;

      case 'code':
        if (node.lang?.toLowerCase() !== 'mermaid') {
          add(node.value);
        }
        return;

      case 'definition':
      case 'thematicBreak':
        return;

      case 'html':
        throw new Error('Raw HTML is not supported in PDF semantic verification.');

      default:
        return;
    }
  };

  visit(root as Root);

  return blocks;
}

function positionedText(item: unknown): PositionedText | undefined {
  if (typeof item !== 'object' || item === null || !('str' in item) || !('transform' in item)) {
    return undefined;
  }

  const candidate = item as {
    str?: unknown;
    transform?: unknown;
    height?: unknown;
  };

  if (
    typeof candidate.str !== 'string' ||
    !Array.isArray(candidate.transform) ||
    candidate.transform.length < 6
  ) {
    return undefined;
  }

  const x = Number(candidate.transform[4]);

  const y = Number(candidate.transform[5]);

  const height = Number(candidate.height ?? candidate.transform[3]);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return undefined;
  }

  return {
    str: candidate.str,
    x,
    y,
    height: Number.isFinite(height) ? Math.abs(height) : 0,
  };
}

function pageTextInReadingOrder(items: unknown[]): string {
  const positioned: PositionedText[] = [];

  for (const item of items) {
    const position = positionedText(item);

    if (position) {
      positioned.push(position);
    }
  }

  positioned.sort((left, right) => {
    const vertical = right.y - left.y;

    return Math.abs(vertical) > 2 ? vertical : left.x - right.x;
  });

  const lines: Array<{
    y: number;
    height: number;
    items: PositionedText[];
  }> = [];

  for (const item of positioned) {
    const tolerance = Math.max(2, item.height * 0.35);

    const line = lines.find(
      (candidate) => Math.abs(candidate.y - item.y) <= Math.max(tolerance, candidate.height * 0.35),
    );

    if (line) {
      line.items.push(item);

      line.height = Math.max(line.height, item.height);

      continue;
    }

    lines.push({
      y: item.y,
      height: item.height,
      items: [item],
    });
  }

  lines.sort((left, right) => right.y - left.y);

  return lines
    .map((line) => {
      line.items.sort((left, right) => left.x - right.x);

      return line.items.map((item) => item.str).join(' ');
    })
    .join('\n');
}

async function extractPdfText(bytes: Uint8Array): Promise<{
  pages: number;
  text: string;
}> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);

      const content = await page.getTextContent();

      pages.push(pageTextInReadingOrder(content.items));

      page.cleanup();
    }

    return {
      pages: pdf.numPages,
      text: pages.join('\n'),
    };
  } finally {
    await loadingTask.destroy();
  }
}

function withoutPageFurniture(value: string): string {
  return value.replace(/^[ \t]*Page\s+\d+\s*\/\s*\d+[ \t]*$/gmu, '');
}

export async function verifyModulePdf(
  markdown: string,
  content: ModuleContent,
  options: VerifyModulePdfOptions,
): Promise<PdfSemanticVerificationRecord> {
  if (sha256(markdown) !== content.sourceSha256) {
    throw new Error('Canonical Markdown does not match the supplied ModuleContent.');
  }

  const repositoryRoot = resolve(options.repositoryRoot);

  const pdfPath = resolve(options.pdfPath);

  const relativePdfPath = repositoryRelativePath(repositoryRoot, pdfPath);

  const buffer = await readFile(pdfPath);

  validatePdfBytes(buffer, relativePdfPath);

  const pdfSha256 = sha256(buffer);

  const bytes = new Uint8Array(buffer);

  const prepared = stripMermaidFences(markdown);

  if (prepared.diagrams !== content.diagrams.length) {
    throw new Error(
      `Expected ${content.diagrams.length} Mermaid diagrams; found ${prepared.diagrams} in canonical Markdown.`,
    );
  }

  const expectedBlocks = semanticBlocksFromMarkdown(prepared.markdown);

  const extracted = await extractPdfText(bytes);

  const actual = normalizePdfSemanticText(
    withoutPageFurniture(extracted.text).replace(/-[^\S\r\n]*\r?\n[^\S\r\n]*(?=\S)/gu, '-'),
  );

  let cursor = 0;
  let matched = 0;

  for (const [index, block] of expectedBlocks.entries()) {
    const match = actual.indexOf(block, cursor);

    if (match < 0) {
      throw new Error(
        [
          `Semantic PDF mismatch: ${relativePdfPath}`,
          `block=${index + 1}/${expectedBlocks.length}`,
          `expected=${JSON.stringify(block)}`,
        ].join(' | '),
      );
    }

    matched += 1;
    cursor = match + block.length;
  }

  return {
    schemaVersion: 1,
    courseId: content.courseId,
    moduleId: content.moduleId,
    language: content.language,
    sourcePath: content.sourcePath,
    sourceSha256: content.sourceSha256,
    moduleContentSha256: content.moduleContentSha256,
    pdfPath: relativePdfPath,
    pdfSha256,
    pages: extracted.pages,
    diagrams: prepared.diagrams,
    blocks: {
      expected: expectedBlocks.length,
      matched,
    },
    semanticSha256: sha256(expectedBlocks.join('\n')),
  };
}

export function serializePdfSemanticVerification(record: PdfSemanticVerificationRecord): string {
  return canonicalJson(record);
}
