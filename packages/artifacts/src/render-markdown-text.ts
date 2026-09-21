import type { Code, Definition, List, Nodes, Root, Table } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

const labels = {
  en: {
    column: 'Column',
    deleted: 'Deleted',
    diagramSource: 'Diagram source (Mermaid):',
    mermaidDocumentSource: 'Mermaid diagram source',
    uncaptionedImage: 'Uncaptioned image',
  },
  fr: {
    column: 'Colonne',
    deleted: 'Supprimé',
    diagramSource: 'Source du diagramme (Mermaid) :',
    mermaidDocumentSource: 'Source du diagramme Mermaid',
    uncaptionedImage: 'Image sans légende',
  },
} as const;

function definitions(root: Root): Map<string, Definition> {
  const result = new Map<string, Definition>();
  const visit = (node: Nodes) => {
    if (node.type === 'definition' && !result.has(node.identifier))
      result.set(node.identifier, node);
    if ('children' in node) node.children.forEach(visit);
  };
  visit(root);
  return result;
}

export interface RenderMarkdownTextOptions {
  includeLinkDestinations?: boolean;
  documentCodeLabels?: boolean;
  documentTableText?: boolean;
  language?: 'en' | 'fr';
}

type RenderNode = (node: Nodes) => string;

function taskMarker(checked: boolean | null | undefined): string {
  if (checked == null) return '';
  return checked ? '[x] ' : '[ ] ';
}

function indentListLine(line: string, lineIndex: number, marker: string): string {
  if (lineIndex === 0) return marker + line;
  return line ? ' '.repeat(marker.length) + line : '';
}

function renderList(node: List, render: RenderNode): string {
  return node.children
    .map((item, index) => {
      const marker = node.ordered ? `${(node.start ?? 1) + index}. ` : '- ';
      const lines = (taskMarker(item.checked) + render(item)).split('\n');
      return lines.map((line, lineIndex) => indentListLine(line, lineIndex, marker)).join('\n');
    })
    .join(node.spread ? '\n\n' : '\n');
}

function renderCompactTable(rows: string[][], headers: string[], widths: number[]): string {
  const rowText = (row: string[]) =>
    row
      .map((cell, index) => cell.padEnd(widths[index] ?? 0))
      .join('  ')
      .trimEnd();
  return [
    rowText(headers),
    rowText(widths.map((width) => '-'.repeat(width))),
    ...rows.slice(1).map(rowText),
  ].join('\n');
}

function renderTableRecords(rows: string[][], headers: string[], language: 'en' | 'fr'): string {
  const text = labels[language];

  return [
    headers.join(' / '),
    ...rows.slice(1).map((row) =>
      row
        .map((cell, index) => {
          const header = headers[index] || `${text.column} ${index + 1}`;

          return `${header}: ${cell}`;
        })
        .join('\n'),
    ),
  ].join('\n\n');
}

function renderTable(node: Table, render: RenderNode, options: RenderMarkdownTextOptions): string {
  const rows = node.children.map((row) => row.children.map(render));
  if (options.documentTableText)
    return rows
      .map((row) => row.join(' ').trim())
      .filter(Boolean)
      .join('\n');
  const headers = rows[0] ?? [];
  const widths = headers.map((_, index) =>
    Math.max(...rows.map((row) => (row[index] ?? '').length)),
  );
  if (
    widths.reduce((sum, width) => sum + width + 2, 0) <= 100 &&
    rows.every((row) => row.every((cell) => !cell.includes('\n')))
  ) {
    return renderCompactTable(rows, headers, widths);
  }
  return renderTableRecords(rows, headers, options.language ?? 'en');
}

function codeLabel(node: Code, documentCodeLabels = false, language: 'en' | 'fr' = 'en'): string {
  const text = labels[language];

  if (documentCodeLabels) {
    if (node.lang === 'mermaid') return text.mermaidDocumentSource;
    return node.lang ? `Code - ${node.lang}` : 'Code';
  }

  if (node.lang === 'mermaid') return text.diagramSource;
  return node.lang ? `Code (${node.lang}):` : 'Code:';
}

export function renderMarkdownText(
  markdown: string,
  options: RenderMarkdownTextOptions = {},
): string {
  const language = options.language ?? 'en';
  const text = labels[language];
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const refs = definitions(root);
  const renderChildren = (node: Nodes, separator = ''): string =>
    'children' in node ? node.children.map(render).filter(Boolean).join(separator) : '';
  const link = (label: string, url: string, title?: string | null): string => {
    if (options.includeLinkDestinations === false) return label;
    return (label === url ? url : `${label}: ${url}`) + (title ? ` (${title})` : '');
  };

  function render(node: Nodes): string {
    switch (node.type) {
      case 'root':
      case 'blockquote':
      case 'listItem':
        return renderChildren(node, '\n\n');
      case 'text':
        return node.value.replace(/\r?\n/g, ' ');
      case 'inlineCode':
        return node.value;
      case 'strong':
      case 'emphasis':
      case 'tableCell':
        return renderChildren(node);
      case 'delete':
        return `[${text.deleted}: ${renderChildren(node)}]`;
      case 'paragraph':
        return renderChildren(node).replace(/^\u2022\s+/, '- ');
      case 'heading': {
        const title = renderChildren(node);
        const marker = ['=', '-', '~', '^', '"', "'"][node.depth - 1] ?? '-';
        return `${title}\n${marker.repeat([...title].length)}`;
      }
      case 'list':
        return renderList(node, render);
      case 'table':
        return renderTable(node, render, options);
      case 'code':
        return `${codeLabel(node, options.documentCodeLabels, language)}\n${node.value}`;
      case 'link':
        return link(renderChildren(node), node.url, node.title);
      case 'image':
        return link(`[Figure: ${node.alt || text.uncaptionedImage}]`, node.url, node.title);
      case 'linkReference':
      case 'imageReference': {
        const ref = refs.get(node.identifier);
        if (!ref) throw new Error(`Unresolved reference: ${node.identifier}`);
        const label =
          node.type === 'imageReference'
            ? `[Figure: ${node.alt || text.uncaptionedImage}]`
            : renderChildren(node);
        return link(label, ref.url, ref.title);
      }
      case 'definition':
        return '';
      case 'break':
        return '\n';
      case 'thematicBreak':
        return '--------------------';
      default:
        throw new Error(
          `Unsupported TXT source block: ${node.type}; add a semantic renderer before exporting.`,
        );
    }
  }

  return render(root).trim() + '\n';
}

export function validatePlainText(bytes: Uint8Array): string[] {
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return ['TXT must be valid UTF-8.'];
  }
  return [
    ...(!text.trim() ? ['TXT must be non-empty.'] : []),
    ...(text.includes('\0') ? ['TXT must contain no NUL bytes.'] : []),
    ...(text.includes('\r') ? ['TXT must use LF line endings.'] : []),
    ...(!text.endsWith('\n') ? ['TXT must end with a newline.'] : []),
  ];
}
