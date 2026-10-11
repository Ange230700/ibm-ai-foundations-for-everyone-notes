import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import JSZip from 'jszip';

import type { DeckSpec } from '../deck/model.js';

export function teachingNoteParts(markdown: string): {
  label: string;
  takeaway: string;
  cues: string[];
} {
  const normalized = markdown.trim().replaceAll('\r\n', '\n');
  const labelEnd = normalized.startsWith('**') ? normalized.indexOf('**', 2) : -1;
  if (labelEnd < 3) {
    throw new Error('Teaching notes require a bold key takeaway.');
  }
  const label = normalized.slice(2, labelEnd);
  const paragraphs = normalized.slice(labelEnd + 2).split(/\n[ \t]*\n/u);
  const takeaway = paragraphs.shift()!.replace(/\s+/gu, ' ').trim();
  if (!takeaway) throw new Error('Teaching notes require a bold key takeaway.');
  const rest = paragraphs.join(' ').replace(/\s+/gu, ' ').trim();
  // Keep the exact source sentences; visual grouping adds no new claims.
  const cues = rest ? rest.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ])/u).filter(Boolean) : [];
  return { label, takeaway, cues };
}

function appendParagraph(
  document: Document,
  body: Element,
  value: string,
  style: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size: number;
    color?: string;
    bullet?: boolean;
    lang: string;
  },
): void {
  const paragraph = document.createElement('a:p');
  if (style.bullet) {
    const pPr = document.createElement('a:pPr');
    pPr.setAttribute('marL', '290000');
    pPr.setAttribute('indent', '-190000');
    const bullet = document.createElement('a:buChar');
    bullet.setAttribute('char', '•');
    pPr.appendChild(bullet);
    paragraph.appendChild(pPr);
  }
  const run = document.createElement('a:r');
  const properties = document.createElement('a:rPr');
  properties.setAttribute('lang', style.lang);
  properties.setAttribute('sz', String(style.size * 100));
  if (style.bold) properties.setAttribute('b', '1');
  if (style.italic) properties.setAttribute('i', '1');
  if (style.underline) properties.setAttribute('u', 'sng');
  if (style.color) {
    const fill = document.createElement('a:solidFill');
    const rgb = document.createElement('a:srgbClr');
    rgb.setAttribute('val', style.color);
    fill.appendChild(rgb);
    properties.appendChild(fill);
  }
  run.appendChild(properties);
  const text = document.createElement('a:t');
  text.appendChild(document.createTextNode(value));
  run.appendChild(text);
  paragraph.appendChild(run);
  body.appendChild(paragraph);
}

function notesBody(document: Document, part: string): Element {
  const shapes = Array.from(document.getElementsByTagName('p:sp'));
  const shape = shapes.find((candidate) =>
    Array.from(candidate.getElementsByTagName('p:ph')).some(
      (placeholder) => placeholder.getAttribute('type') === 'body',
    ),
  );
  const body = shape?.getElementsByTagName('p:txBody').item(0);
  if (!body) throw new Error(`Missing body notes placeholder: ${part}`);
  const preserved = Array.from(body.childNodes)
    .filter((child) => child.nodeName !== 'a:p')
    .map((child) => child.cloneNode(true));
  body.textContent = '';
  for (const child of preserved) body.appendChild(child);
  return body;
}

function writeTeachingNote(
  document: Document,
  body: Element,
  slide: DeckSpec['slides'][number],
  language: DeckSpec['language'],
): void {
  const { label, takeaway, cues } = teachingNoteParts(slide.teachingNotes!);
  const append = (
    value: string,
    style: Omit<Parameters<typeof appendParagraph>[3], 'lang'>,
  ): void =>
    appendParagraph(document, body, value, {
      ...style,
      lang: language === 'fr' ? 'fr-FR' : 'en-US',
    });
  const tag = language === 'fr' ? 'Notes pédagogiques' : 'Teaching Notes';
  append(`[${tag}]`, { size: 8, color: '66758A' });
  append(`${slide.slideId}  ·  ${slide.durationMinutes} min`, {
    size: 16,
    bold: true,
    color: '122B4A',
  });
  append(label, { size: 12, bold: true, underline: true, color: '007DA0' });
  append(takeaway, { size: 15, bold: true, color: '122B4A' });
  if (cues.length) {
    append(language === 'fr' ? 'À DIRE / À FAIRE' : 'SAY / DO', {
      size: 12,
      bold: true,
      underline: true,
      color: '007DA0',
    });
  }
  for (const cue of cues) append(cue, { size: 12, bullet: true });
  append(`[/${tag}]`, { size: 8, color: '66758A' });
  append('[Sources]', { size: 8, italic: true, color: '66758A' });
  for (const source of slide.sourceRefs) {
    const heading = source.headingPath.length ? ` — ${source.headingPath.join(' > ')}` : '';
    append(`- ${source.path}:${source.startLine}-${source.endLine}${heading}`, {
      size: 8,
      italic: true,
      color: '66758A',
    });
  }
  append('[/Sources]', { size: 8, italic: true, color: '66758A' });
}

async function formatSlideNotes(
  zip: JSZip,
  index: number,
  slide: DeckSpec['slides'][number],
  language: DeckSpec['language'],
): Promise<void> {
  if (!slide.teachingNotes) return;
  const part = `ppt/notesSlides/notesSlide${index + 1}.xml`;
  const entry = zip.file(part);
  if (!entry) throw new Error(`Missing notes part: ${part}`);
  const document = new DOMParser().parseFromString(await entry.async('string'), 'application/xml');
  writeTeachingNote(document, notesBody(document, part), slide, language);
  zip.file(part, new XMLSerializer().serializeToString(document));
}

export async function formatTeachingNotes(bytes: Uint8Array, spec: DeckSpec): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(bytes);
  await Promise.all(
    spec.slides.map((slide, index) => formatSlideNotes(zip, index, slide, spec.language)),
  );
  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
