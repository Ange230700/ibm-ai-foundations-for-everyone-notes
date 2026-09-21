import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { DOMParser } from '@xmldom/xmldom';
import JSZip from 'jszip';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import type { DeckSpec, SlideSpec } from '../deck/model.js';

export const PPTX_VERIFIER_VERSION = 1;

const EMU_PER_INCH = 914_400;

const WIDE_SLIDE = {
  width: (7.5 / 9) * 16 * EMU_PER_INCH,
  height: 7.5 * EMU_PER_INCH,
} as const;

export interface PptxSlideVerification {
  index: number;
  slideId: string;
  kind: SlideSpec['kind'];
  textSha256: string;
  textItems: number;
  tables: number;
  pictures: number;
  sourceNotesPresent: boolean;
  outOfBoundsObjects: number;
}

export interface NativePptxVerification {
  schemaVersion: 1;
  verifierVersion: number;
  deckId: string;
  courseId: string;
  moduleId: string;
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  moduleContentSha256: string;
  deckSpecSha256: string;
  pptxPath: string;
  pptxSha256: string;
  slideCount: number;
  slides: PptxSlideVerification[];
}

interface Relationship {
  id: string;
  target: string;
  type: string;
}

interface Bounds {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PPTX verification input must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

function localName(node: Node): string {
  const name = node.nodeName;

  const separator = name.indexOf(':');

  return separator === -1 ? name : name.slice(separator + 1);
}

function elements(root: Node, name: string): Element[] {
  const result: Element[] = [];

  const visit = (node: Node): void => {
    if (node.nodeType === 1 && localName(node) === name) {
      result.push(node as Element);
    }

    const childNodes = (
      node as Node & {
        childNodes: {
          length: number;
          item(index: number): Node | null;
        } | null;
      }
    ).childNodes;

    if (!childNodes) {
      return;
    }

    for (let index = 0; index < childNodes.length; index += 1) {
      const child = childNodes.item(index);

      if (child) {
        visit(child);
      }
    }
  };

  visit(root);

  return result;
}

function parseXml(xml: string, label: string): Document {
  const document = new DOMParser().parseFromString(xml, 'application/xml');

  const errors = elements(document, 'parsererror');

  if (errors.length > 0) {
    throw new Error(`Invalid OOXML XML in ${label}.`);
  }

  return document;
}

async function requiredText(zip: JSZip, path: string): Promise<string> {
  const entry = zip.file(path);

  if (!entry) {
    throw new Error(`PPTX is missing required OOXML part: ${path}`);
  }

  return entry.async('string');
}

function relationshipMap(document: Document): Map<string, Relationship> {
  const result = new Map<string, Relationship>();

  for (const relationship of elements(document, 'Relationship')) {
    const id = relationship.getAttribute('Id');

    const target = relationship.getAttribute('Target');

    const type = relationship.getAttribute('Type');

    if (id && target && type) {
      result.set(id, {
        id,
        target,
        type,
      });
    }
  }

  return result;
}

function normalizePartPath(ownerPart: string, target: string): string {
  if (target.startsWith('/')) {
    return target.slice(1);
  }

  const ownerSegments = ownerPart.split('/').slice(0, -1);

  const targetSegments = target.split('/');

  const result = [...ownerSegments];

  for (const segment of targetSegments) {
    if (segment === '.' || segment === '') {
      continue;
    }

    if (segment === '..') {
      result.pop();
      continue;
    }

    result.push(segment);
  }

  return result.join('/');
}

function slideText(document: Document): string[] {
  return elements(document, 't')
    .map((node) => node.textContent ?? '')
    .map((value) => value.normalize('NFKC').replace(/\s+/gu, ' ').trim())
    .filter(Boolean);
}

function normalizedText(values: readonly string[]): string {
  return values.join(' ').normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

function expectedText(slide: SlideSpec): string[] {
  switch (slide.kind) {
    case 'title':
      return [slide.title, slide.subtitle];

    case 'objectives':
    case 'overview':
    case 'summary':
      return [slide.title, ...slide.items];

    case 'concepts':
      return [
        slide.title,
        ...slide.concepts.flatMap((concept) => [concept.title, concept.explanation]),
      ];

    case 'diagram':
      return [slide.title, slide.explanation];

    case 'table':
      return [slide.title, slide.explanation, ...slide.headers, ...slide.rows.flat()];

    case 'code':
      return [slide.title, slide.explanation, slide.language.toUpperCase(), slide.code];
  }
}

function assertExpectedText(slide: SlideSpec, actualItems: string[]): void {
  const actual = normalizedText(actualItems);

  for (const value of expectedText(slide)) {
    const expected = normalizedText([value]);

    if (expected && !actual.includes(expected)) {
      throw new Error(
        `PPTX slide ${slide.slideId} is missing canonical text: ${JSON.stringify(value)}.`,
      );
    }
  }
}

function parseCoordinate(element: Element, name: string): number | undefined {
  const value = element.getAttribute(name);

  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function objectBounds(document: Document): Bounds[] {
  const result: Bounds[] = [];

  for (const transform of elements(document, 'xfrm')) {
    const offsets = elements(transform, 'off');

    const extents = elements(transform, 'ext');

    const offset = offsets[0];

    const extent = extents[0];

    if (!offset || !extent) {
      continue;
    }

    const x = parseCoordinate(offset, 'x');

    const y = parseCoordinate(offset, 'y');

    const cx = parseCoordinate(extent, 'cx');

    const cy = parseCoordinate(extent, 'cy');

    if (x === undefined || y === undefined || cx === undefined || cy === undefined) {
      continue;
    }

    result.push({
      x,
      y,
      cx,
      cy,
    });
  }

  return result;
}

function isOutOfBounds(bounds: Bounds): boolean {
  return (
    bounds.x < 0 ||
    bounds.y < 0 ||
    bounds.cx < 0 ||
    bounds.cy < 0 ||
    bounds.x + bounds.cx > WIDE_SLIDE.width ||
    bounds.y + bounds.cy > WIDE_SLIDE.height
  );
}

function relationshipId(element: Element): string | undefined {
  return element.getAttribute('r:id') ?? element.getAttribute('id') ?? undefined;
}

async function orderedSlideParts(zip: JSZip): Promise<string[]> {
  const presentation = parseXml(
    await requiredText(zip, 'ppt/presentation.xml'),
    'ppt/presentation.xml',
  );

  const relationships = relationshipMap(
    parseXml(
      await requiredText(zip, 'ppt/_rels/presentation.xml.rels'),
      'ppt/_rels/presentation.xml.rels',
    ),
  );

  const slideIds = elements(presentation, 'sldId');

  return slideIds.map((slideId) => {
    const id = relationshipId(slideId);

    if (!id) {
      throw new Error('PPTX presentation contains a slide without a relationship id.');
    }

    const relationship = relationships.get(id);

    if (!relationship) {
      throw new Error(`Missing presentation relationship ${id}.`);
    }

    return normalizePartPath('ppt/presentation.xml', relationship.target);
  });
}

async function notesForSlide(zip: JSZip, slidePart: string): Promise<string | undefined> {
  const filename = slidePart.split('/').at(-1);

  if (!filename) {
    return undefined;
  }

  const relationshipPart = `ppt/slides/_rels/${filename}.rels`;

  const entry = zip.file(relationshipPart);

  if (!entry) {
    return undefined;
  }

  const relationships = relationshipMap(parseXml(await entry.async('string'), relationshipPart));

  const notesRelationship = [...relationships.values()].find((relationship) =>
    relationship.type.endsWith('/notesSlide'),
  );

  if (!notesRelationship) {
    return undefined;
  }

  const notesPart = normalizePartPath(slidePart, notesRelationship.target);

  const notesEntry = zip.file(notesPart);

  if (!notesEntry) {
    throw new Error(`PPTX slide references missing notes part: ${notesPart}`);
  }

  const document = parseXml(await notesEntry.async('string'), notesPart);

  return normalizedText(slideText(document));
}

function verifyResourceStructure(slide: SlideSpec, document: Document): void {
  const tables = elements(document, 'tbl').length;

  const pictures = elements(document, 'pic').length;

  if (slide.kind === 'table' && tables !== 1) {
    throw new Error(
      `PPTX slide ${slide.slideId} must contain exactly one native table; found ${tables}.`,
    );
  }

  if (slide.kind === 'diagram' && pictures < 1) {
    throw new Error(`PPTX slide ${slide.slideId} must contain an embedded diagram image.`);
  }
}

export async function verifyNativePptx(
  spec: DeckSpec,
  repositoryRootInput: string,
  pptxPathInput: string,
): Promise<NativePptxVerification> {
  const repositoryRoot = resolve(repositoryRootInput);

  const pptxPath = resolve(pptxPathInput);

  const relativePptxPath = repositoryRelativePath(repositoryRoot, pptxPath);

  const bytes = await readFile(pptxPath);

  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    throw new Error(`PPTX is not an OOXML ZIP package: ${relativePptxPath}`);
  }

  const zip = await JSZip.loadAsync(bytes);

  const slideParts = await orderedSlideParts(zip);

  if (slideParts.length !== spec.slides.length) {
    throw new Error(
      `PPTX slide count mismatch: expected ${spec.slides.length}, found ${slideParts.length}.`,
    );
  }

  const slides: PptxSlideVerification[] = [];

  for (let index = 0; index < slideParts.length; index += 1) {
    const slidePart = slideParts[index];

    const slideSpec = spec.slides[index];

    if (!slidePart || !slideSpec) {
      throw new Error(`PPTX slide order is incomplete at index ${index}.`);
    }

    const document = parseXml(await requiredText(zip, slidePart), slidePart);

    const textItems = slideText(document);

    assertExpectedText(slideSpec, textItems);

    verifyResourceStructure(slideSpec, document);

    const notes = await notesForSlide(zip, slidePart);

    const sourceNotesPresent = Boolean(
      notes?.includes('[Sources]') && notes.includes('[/Sources]'),
    );

    if (!sourceNotesPresent) {
      throw new Error(`PPTX slide ${slideSpec.slideId} is missing source notes.`);
    }

    const bounds = objectBounds(document);

    const outOfBoundsObjects = bounds.filter(isOutOfBounds).length;

    if (outOfBoundsObjects > 0) {
      throw new Error(
        `PPTX slide ${slideSpec.slideId} contains ${outOfBoundsObjects} out-of-bounds object(s).`,
      );
    }

    slides.push({
      index: index + 1,
      slideId: slideSpec.slideId,
      kind: slideSpec.kind,
      textSha256: sha256(normalizedText(textItems)),
      textItems: textItems.length,
      tables: elements(document, 'tbl').length,
      pictures: elements(document, 'pic').length,
      sourceNotesPresent,
      outOfBoundsObjects,
    });
  }

  return {
    schemaVersion: 1,
    verifierVersion: PPTX_VERIFIER_VERSION,
    deckId: spec.deckId,
    courseId: spec.courseId,
    moduleId: spec.moduleId,
    language: spec.language,
    sourcePath: spec.sourcePath,
    sourceSha256: spec.sourceSha256,
    moduleContentSha256: spec.moduleContentSha256,
    deckSpecSha256: sha256(canonicalJson(spec)),
    pptxPath: relativePptxPath,
    pptxSha256: sha256(bytes),
    slideCount: slides.length,
    slides,
  };
}

export function serializeNativePptxVerification(verification: NativePptxVerification): string {
  return canonicalJson(verification);
}
