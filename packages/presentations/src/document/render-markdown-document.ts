import type { Code, Definition, List, ListItem, Nodes, Root, Table, TableRow } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import { slugify } from '@coursera-notes/core';

export interface MarkdownDocumentOptions {
  language: 'en' | 'fr';
  stylesheet: string;
  baseHref?: string;
}

const labels = {
  en: {
    mermaidSource: 'Mermaid diagram source',
    code: 'Code',
    uncaptionedImage: 'Uncaptioned image',
  },
  fr: {
    mermaidSource: 'Source du diagramme Mermaid',
    code: 'Code',
    uncaptionedImage: 'Image sans légende',
  },
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function definitions(root: Root): Map<string, Definition> {
  const result = new Map<string, Definition>();

  const visit = (node: Nodes): void => {
    if (node.type === 'definition' && !result.has(node.identifier)) {
      result.set(node.identifier, node);
    }

    if ('children' in node) {
      node.children.forEach(visit);
    }
  };

  visit(root);

  return result;
}

function plainText(node: Nodes): string {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
      return node.value;

    case 'image':
    case 'imageReference':
      return node.alt ?? '';

    default:
      return 'children' in node ? node.children.map(plainText).join('') : '';
  }
}

type RenderChildren = (node: Nodes, separator?: string) => string;

function renderList(node: List, render: (node: Nodes) => string): string {
  const tag = node.ordered ? 'ol' : 'ul';

  const start =
    node.ordered && node.start != null && node.start !== 1 ? ` start="${node.start}"` : '';

  return `<${tag}${start}>${node.children.map(render).join('')}</${tag}>`;
}

function renderListItem(node: ListItem, renderChildren: RenderChildren): string {
  let task = '';

  if (node.checked != null) {
    const marker = node.checked ? '☑' : '☐';

    task = `<span class="task-marker">${marker}</span> `;
  }

  return `<li>${task}${renderChildren(node)}</li>`;
}

function renderTableRow(
  row: TableRow,
  header: boolean,
  align: Table['align'],
  renderChildren: RenderChildren,
): string {
  const tag = header ? 'th' : 'td';

  return `<tr>${row.children
    .map((cell, index) => {
      const alignment = align?.[index];

      const style = alignment ? ` style="text-align:${alignment}"` : '';

      return `<${tag}${style}>${renderChildren(cell)}</${tag}>`;
    })
    .join('')}</tr>`;
}

function renderTable(node: Table, renderChildren: RenderChildren): string {
  const [head, ...body] = node.children;

  const renderRow = (row: TableRow, header: boolean) =>
    renderTableRow(row, header, node.align, renderChildren);

  return [
    '<div class="table-wrap"><table>',
    head ? `<thead>${renderRow(head, true)}</thead>` : '',
    body.length ? `<tbody>${body.map((row) => renderRow(row, false)).join('')}</tbody>` : '',
    '</table></div>',
  ].join('');
}

function codeLabel(node: Code, language: 'en' | 'fr'): string {
  const text = labels[language];

  if (node.lang?.toLowerCase() === 'mermaid') {
    return text.mermaidSource;
  }

  return node.lang ? `${text.code} - ${node.lang}` : text.code;
}

function renderCode(node: Code, language: 'en' | 'fr'): string {
  const languageClass = node.lang?.replace(/[^a-zA-Z0-9_-]/g, '').trim() ?? '';

  const classAttribute = languageClass ? ` class="language-${languageClass}"` : '';

  return [
    '<figure class="code-block">',
    `<figcaption>${escapeHtml(codeLabel(node, language))}</figcaption>`,
    `<pre><code${classAttribute}>`,
    escapeHtml(node.value),
    '</code></pre>',
    '</figure>',
  ].join('');
}

export function renderMarkdownDocument(markdown: string, options: MarkdownDocumentOptions): string {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  const refs = definitions(root);

  const headingIds = new Map<string, number>();

  const text = labels[options.language];

  const uniqueHeadingId = (node: Nodes): string => {
    const base = slugify(plainText(node)) || 'section';

    const occurrence = (headingIds.get(base) ?? 0) + 1;

    headingIds.set(base, occurrence);

    return occurrence === 1 ? base : `${base}-${occurrence}`;
  };

  const renderChildren = (node: Nodes, separator = ''): string =>
    'children' in node ? node.children.map(render).filter(Boolean).join(separator) : '';

  const renderLink = (label: string, url: string, title?: string | null): string => {
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';

    return `<a href="${escapeHtml(url)}"${titleAttribute}>${label}</a>`;
  };

  function render(node: Nodes): string {
    switch (node.type) {
      case 'root':
        return renderRoot(node);

      case 'text':
        return escapeHtml(node.value.replace(/\r?\n/g, ' '));

      case 'strong':
        return `<strong>${renderChildren(node)}</strong>`;

      case 'emphasis':
        return `<em>${renderChildren(node)}</em>`;

      case 'delete':
        return `<del>${renderChildren(node)}</del>`;

      case 'inlineCode':
        return `<code class="inline-code">${escapeHtml(node.value)}</code>`;

      case 'break':
        return '<br>';

      case 'paragraph': {
        const literalBullet = /^•\s+/.test(plainText(node));

        return `<p${literalBullet ? ' class="literal-bullet"' : ''}>${renderChildren(node)}</p>`;
      }

      case 'heading': {
        const id = uniqueHeadingId(node);

        return `<h${node.depth} id="${id}">${renderChildren(node)}</h${node.depth}>`;
      }

      case 'blockquote':
        return `<blockquote>${renderChildren(node)}</blockquote>`;

      case 'list':
        return renderList(node, render);

      case 'listItem':
        return renderListItem(node, renderChildren);

      case 'table':
        return renderTable(node, renderChildren);

      case 'tableRow':
      case 'tableCell':
        return renderChildren(node);

      case 'code':
        return renderCode(node, options.language);

      case 'link':
        return renderLink(renderChildren(node), node.url, node.title);

      case 'image': {
        const caption = node.alt || text.uncaptionedImage;

        return [
          '<figure class="document-figure">',
          `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(caption)}">`,
          `<figcaption>${escapeHtml(caption)}</figcaption>`,
          '</figure>',
        ].join('');
      }

      case 'linkReference':
      case 'imageReference': {
        const ref = refs.get(node.identifier);

        if (!ref) {
          throw new Error(`Unresolved reference: ${node.identifier}`);
        }

        if (node.type === 'linkReference') {
          return renderLink(renderChildren(node), ref.url, ref.title);
        }

        const caption = node.alt || text.uncaptionedImage;

        return [
          '<figure class="document-figure">',
          `<img src="${escapeHtml(ref.url)}" alt="${escapeHtml(caption)}">`,
          `<figcaption>${escapeHtml(caption)}</figcaption>`,
          '</figure>',
        ].join('');
      }

      case 'definition':
        return '';

      case 'thematicBreak':
        return '<hr>';

      case 'html':
        throw new Error(
          'Raw HTML is not supported in canonical document Markdown; use semantic Markdown instead.',
        );

      default:
        throw new Error(
          `Unsupported document source block: ${node.type}; add a semantic renderer before exporting.`,
        );
    }
  }

  function renderRoot(node: Root): string {
    const children = node.children.filter((child) => child.type !== 'definition');

    if (children[0]?.type !== 'heading' || children[0].depth !== 1) {
      return `<main class="document-body">${children.map(render).join('\n')}</main>`;
    }

    const firstSectionIndex = children.findIndex(
      (child, index) => index > 0 && child.type === 'heading' && child.depth === 2,
    );

    if (firstSectionIndex < 0) {
      return `<main class="document-body">${children.map(render).join('\n')}</main>`;
    }

    const cover = children.slice(0, firstSectionIndex);

    const body = children.slice(firstSectionIndex);

    const sections: Array<typeof body> = [];

    let currentSection: typeof body = [];

    for (const child of body) {
      if (child.type === 'heading' && child.depth === 2 && currentSection.length > 0) {
        sections.push(currentSection);

        currentSection = [];
      }

      currentSection.push(child);
    }

    if (currentSection.length > 0) {
      sections.push(currentSection);
    }

    const renderedSections = sections
      .map((section, index) => {
        const terminal = index === sections.length - 1 ? ' document-section--terminal' : '';

        return [
          `<section class="document-section${terminal}">`,
          section.map(render).join('\n'),
          '</section>',
        ].join('\n');
      })
      .join('\n');

    return [
      '<main class="document-body">',
      '<section class="document-cover">',
      cover.map(render).join('\n'),
      '</section>',
      '<section class="document-content">',
      renderedSections,
      '</section>',
      '</main>',
    ].join('\n');
  }

  const titleNode = root.children.find(
    (node): node is Extract<Nodes, { type: 'heading' }> =>
      node.type === 'heading' && node.depth === 1,
  );

  const title = titleNode ? plainText(titleNode) : 'Document';

  const base = options.baseHref ? `<base href="${escapeHtml(options.baseHref)}">` : '';

  return [
    '<!doctype html>',
    `<html lang="${options.language}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    base,
    `<title>${escapeHtml(title)}</title>`,
    `<style>${options.stylesheet}</style>`,
    '</head>',
    '<body>',
    render(root),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
