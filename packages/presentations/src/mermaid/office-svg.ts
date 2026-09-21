import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

import { DEFAULT_MERMAID_THEME, type MermaidThemeTokens } from './config.js';

function localName(element: Element): string {
  return element.localName ?? element.nodeName.split(':').at(-1) ?? '';
}

function classNames(element: Element): Set<string> {
  return new Set((element.getAttribute('class') ?? '').split(/\s+/u).filter(Boolean));
}

function hasAncestorClass(element: Element, className: string): boolean {
  let current = element.parentNode;

  while (current?.nodeType === 1) {
    const parent = current as Element;

    if (classNames(parent).has(className)) {
      return true;
    }

    current = parent.parentNode;
  }

  return false;
}

function allElements(document: Document): Element[] {
  const values: Element[] = [];
  const nodes = document.getElementsByTagName('*');

  for (let index = 0; index < nodes.length; index += 1) {
    const element = nodes.item(index);

    if (element) {
      values.push(element);
    }
  }

  return values;
}

function descendantElements(element: Element): Element[] {
  const values: Element[] = [];
  const nodes = element.getElementsByTagName('*');

  for (let index = 0; index < nodes.length; index += 1) {
    const child = nodes.item(index);

    if (child) {
      values.push(child);
    }
  }

  return values;
}

function normalizedText(value: string | null): string {
  return (value ?? '').replace(/\s+/gu, ' ').trim();
}

function labelLines(element: Element): string[] {
  const rows = descendantElements(element)
    .filter((child) => classNames(child).has('row'))
    .map((child) => normalizedText(child.textContent))
    .filter(Boolean);

  if (rows.length > 0) {
    return rows;
  }

  const value = normalizedText(element.textContent);

  return value ? [value] : [];
}

function estimatedTextWidth(value: string, fontSize = 16): number {
  let ems = 0;

  for (const character of value) {
    if (/\s/u.test(character)) {
      ems += 0.28;
    } else if (/[ijlI1.,:;!'|]/u.test(character)) {
      ems += 0.28;
    } else if (/[MW@#%&]/u.test(character)) {
      ems += 0.85;
    } else if (/[A-Z0-9]/u.test(character)) {
      ems += 0.6;
    } else if (/[-_/\\]/u.test(character)) {
      ems += 0.38;
    } else {
      ems += 0.52;
    }
  }

  return ems * fontSize;
}

function removeChildren(element: Element): void {
  element.textContent = '';
}

function createTextLine(
  document: Document,
  value: string,
  x: number,
  y: number,
  fontSize: number,
  theme: MermaidThemeTokens,
): Element {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  text.setAttribute('x', x.toFixed(3));
  text.setAttribute('y', y.toFixed(3));
  text.setAttribute('text-anchor', 'start');
  text.setAttribute('font-family', theme.fontFamily);
  text.setAttribute('font-size', String(fontSize));
  text.setAttribute('font-weight', 'normal');
  text.setAttribute('fill', theme.foreground);

  text.textContent = value;

  return text;
}

function flattenFlowchartLabels(document: Document, theme: MermaidThemeTokens): void {
  const snapshot = allElements(document);

  for (const node of snapshot.filter(
    (element) => localName(element) === 'g' && classNames(element).has('node'),
  )) {
    const label = descendantElements(node).find((element) => classNames(element).has('label'));

    if (!label) {
      continue;
    }

    const lines = labelLines(label);
    const parent = label.parentNode;

    if (!parent || parent !== node || lines.length === 0) {
      continue;
    }

    node.replaceChild(document.createDocumentFragment(), label);

    const lineHeight = 18;
    const firstBaseline = 5.5 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      node.appendChild(
        createTextLine(
          document,
          line,
          -estimatedTextWidth(line) / 2,
          firstBaseline + index * lineHeight,
          16,
          theme,
        ),
      );
    });
  }

  for (const edgeLabel of snapshot.filter(
    (element) => localName(element) === 'g' && classNames(element).has('edgeLabel'),
  )) {
    const lines = labelLines(edgeLabel);

    if (lines.length === 0) {
      removeChildren(edgeLabel);
      continue;
    }

    removeChildren(edgeLabel);

    const fontSize = 14;
    const lineHeight = 16;

    const maxWidth = Math.max(...lines.map((line) => estimatedTextWidth(line, fontSize)));

    const height = lines.length * lineHeight + 8;

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    background.setAttribute('x', (-maxWidth / 2 - 5).toFixed(3));
    background.setAttribute('y', (-height / 2).toFixed(3));
    background.setAttribute('width', (maxWidth + 10).toFixed(3));
    background.setAttribute('height', height.toFixed(3));
    background.setAttribute('fill', theme.background);
    background.setAttribute('stroke', 'none');

    edgeLabel.appendChild(background);

    const firstBaseline = 5 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      edgeLabel.appendChild(
        createTextLine(
          document,
          line,
          -estimatedTextWidth(line, fontSize) / 2,
          firstBaseline + index * lineHeight,
          fontSize,
          theme,
        ),
      );
    });
  }
}

function parseSvgDocument(svg: string, diagramId: string): Document {
  const errors: string[] = [];
  const document = new DOMParser({
    errorHandler: {
      warning: (message) => errors.push(String(message)),
      error: (message) => errors.push(String(message)),
      fatalError: (message) => errors.push(String(message)),
    },
  }).parseFromString(svg, 'image/svg+xml');

  if (errors.length > 0) {
    throw new Error(`Cannot postprocess ${diagramId}: ${errors.join(' ')}`);
  }

  if (localName(document.documentElement) !== 'svg') {
    throw new Error(`Cannot postprocess ${diagramId}: document root is not SVG.`);
  }

  return document;
}

function expandViewBox(root: Element): void {
  const viewBox = (root.getAttribute('viewBox') ?? '').trim().split(/\s+/u).map(Number);

  if (viewBox.length !== 4 || !viewBox.every(Number.isFinite)) {
    return;
  }

  const [x = 0, y = 0, width = 0, height = 0] = viewBox;
  const margin = 12;

  root.setAttribute(
    'viewBox',
    `${x - margin} ${y - margin} ${width + margin * 2} ${height + margin * 2}`,
  );
}

function applyOfficeTheme(element: Element, theme: MermaidThemeTokens): void {
  const name = localName(element);
  const classes = classNames(element);

  if (name === 'text' || name === 'tspan') {
    element.setAttribute('fill', theme.foreground);
    element.setAttribute('font-family', theme.fontFamily);
  }

  if (classes.has('flowchart-link')) {
    element.setAttribute('fill', 'none');
    element.setAttribute('stroke', theme.foreground);
    element.setAttribute('stroke-width', '1');
  }

  if (classes.has('arrowMarkerPath') || hasAncestorClass(element, 'marker')) {
    element.setAttribute('fill', theme.foreground);
    element.setAttribute('stroke', theme.foreground);
  }

  if (
    ['rect', 'circle', 'ellipse', 'polygon', 'path'].includes(name) &&
    hasAncestorClass(element, 'node') &&
    !hasAncestorClass(element, 'label')
  ) {
    element.setAttribute('fill', theme.surface);
    element.setAttribute('stroke', theme.accent);
    element.setAttribute('stroke-width', '1');
  }

  if (classes.has('label-container')) {
    element.setAttribute('fill', theme.surface);
    element.setAttribute('stroke', theme.accent);
  }

  if (name === 'rect' && hasAncestorClass(element, 'cluster')) {
    element.setAttribute('fill', theme.background);
    element.setAttribute('stroke', theme.mutedBorder);
    element.setAttribute('stroke-width', '1');
  }
}

export function normalizeMermaidSvgForOffice(
  svg: string,
  diagramId = '<unknown>',
  theme: MermaidThemeTokens = DEFAULT_MERMAID_THEME,
): string {
  const document = parseSvgDocument(svg, diagramId);
  const root = document.documentElement;

  expandViewBox(root);
  root.setAttribute('font-family', theme.fontFamily);
  root.setAttribute('font-size', '16px');
  root.setAttribute('fill', theme.foreground);

  flattenFlowchartLabels(document, theme);

  for (const element of allElements(document)) {
    applyOfficeTheme(element, theme);
  }

  return new XMLSerializer().serializeToString(document);
}
