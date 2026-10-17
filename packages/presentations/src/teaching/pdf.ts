import { mkdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';
import puppeteer from 'puppeteer';

import { normalizePdfSemanticText } from '../document/verify-pdf.js';
import { validatePdfBytes } from '../document/render-pdf.js';
import { teachingDeckSpec, type TeachingSessionContent, type TeachingSlide } from './session.js';

export interface TeachingPdfRecord {
  schemaVersion: 2;
  sessionId: string;
  canonicalModuleIds: string[];
  language: 'en' | 'fr';
  sourcePath: string;
  sourceSha256: string;
  contentSha256: string;
  htmlSha256: string;
  brandLogoSha256: string;
  pdfPath: string;
  pdfSha256: string;
  slideCount: number;
  durationMinutes: number;
  renderer: { name: 'chromium-via-puppeteer'; browserVersion: string };
}

export interface TeachingPdfVerification {
  schemaVersion: 2;
  sessionId: string;
  canonicalModuleIds: string[];
  language: 'en' | 'fr';
  sourceSha256: string;
  contentSha256: string;
  pdfSha256: string;
  pages: number;
  slideIds: string[];
  durationMinutes: number;
}

export interface TeachingPdfVisual {
  slideId: string;
  kind: 'mermaid' | 'simulation' | 'capture';
  path: string;
  caption: string;
  dataUrl: string;
  sha256: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function relativePath(root: string, path: string): string {
  const value = toPosixPath(relative(root, path));
  if (value === '..' || value.startsWith('../') || value.startsWith('/')) {
    throw new Error(`Teaching PDF path must remain inside repository: ${path}.`);
  }
  return value;
}

const TEACHING_VISUAL_PATH = /^teaching\/visuals\/s\d{2}\/(?:en|fr)\/[a-z-]+\.(?:svg|png)$/u;

export async function resolveTeachingPdfVisuals(
  content: TeachingSessionContent,
  repositoryRootInput: string,
): Promise<Map<string, TeachingPdfVisual>> {
  const repositoryRoot = resolve(repositoryRootInput);
  const spec = teachingDeckSpec(content);

  const entries = await Promise.all(
    spec.slides.map(async (slide): Promise<[string, TeachingPdfVisual] | undefined> => {
      if (!slide.visual) return undefined;

      const { path, kind, caption } = slide.visual;

      if (!TEACHING_VISUAL_PATH.test(path)) {
        throw new Error(`Unsafe teaching PDF visual path: ${path}`);
      }

      const absolutePath = resolve(repositoryRoot, path);
      relativePath(repositoryRoot, absolutePath);

      const bytes = await readFile(absolutePath);

      if (kind === 'mermaid') {
        if (!bytes.toString('utf8').includes('<svg')) {
          throw new Error(`Invalid teaching PDF SVG: ${path}`);
        }
      } else if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        throw new Error(`Invalid teaching PDF PNG: ${path}`);
      }

      const mime = kind === 'mermaid' ? 'image/svg+xml' : 'image/png';

      return [
        slide.slideId,
        {
          slideId: slide.slideId,
          kind,
          path,
          caption,
          dataUrl: `data:${mime};base64,${bytes.toString('base64')}`,
          sha256: sha256(bytes),
        },
      ];
    }),
  );

  const visuals = new Map<string, TeachingPdfVisual>();
  for (const entry of entries) {
    if (entry) visuals.set(...entry);
  }
  return visuals;
}

function tableHtml(slide: TeachingSlide & { table: NonNullable<TeachingSlide['table']> }): string {
  const headers = slide.table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
  const rows = slide.table.rows
    .map((row) => {
      const cells = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  const caption = slide.items.length
    ? `<caption>${escapeHtml(slide.items.join('\n'))}</caption>`
    : '';
  const tableClass = slide.table.rows.length >= 8 ? 'dense-table' : '';
  return `<table class="${tableClass}">${caption}<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function itemMarker(kinds: TeachingSlide['itemKinds'], index: number): string {
  const kind = kinds[index];
  if (kind !== 'ordered') return kind === 'bullet' ? '•' : '';
  let start = index;
  while (start > 0 && kinds[start - 1] === 'ordered') start -= 1;
  const position = index - start + 1;
  return `${position}.`;
}

function listHtml(slide: TeachingSlide): string {
  const items = slide.items
    .map((item, index) => {
      const label = itemMarker(slide.itemKinds, index);
      return `<li><span class="marker">${label}</span>${escapeHtml(item)}</li>`;
    })
    .join('');
  return `<ul>${items}</ul>`;
}

function projectedHtml(body: string, visual?: TeachingPdfVisual): string {
  if (!visual) return body;
  const caption = escapeHtml(visual.caption);
  const figure = `<figure class="teaching-visual"><div class="visual-frame"><img src="${visual.dataUrl}" alt="${caption}"></div><figcaption>${caption}</figcaption></figure>`;
  if (visual.kind === 'simulation') {
    return `<div class="slide-content split-visual">${body}${figure}</div>`;
  }
  return `<div class="slide-content wide-visual">${figure}${body}</div>`;
}

function slideHtml(
  slide: TeachingSlide,
  index: number,
  content: TeachingSessionContent,
  visual?: TeachingPdfVisual,
): string {
  const title = escapeHtml(slide.title);
  const body = slide.table ? tableHtml({ ...slide, table: slide.table }) : listHtml(slide);
  const projected = projectedHtml(body, visual);

  return `<section class="slide${slide.role === 'course-title' ? ' cover' : ''}">
    <div class="topline">${escapeHtml(content.id.toUpperCase())} · ${String(index + 1).padStart(2, '0')}/${content.slides.length}</div>
    <h1>${title}</h1>${projected}
    <footer>${escapeHtml(slide.id)} · ${slide.durationMinutes} min · KRAAK CONSULTING</footer>
  </section>`;
}

export function renderTeachingPdfHtml(
  content: TeachingSessionContent,
  logoDataUrl?: string,
  visuals: ReadonlyMap<string, TeachingPdfVisual> = new Map(),
): string {
  const slides = content.slides
    .map((slide, index) => slideHtml(slide, index, content, visuals.get(slide.id)))
    .join('\n');
  const logo = logoDataUrl
    ? `<img class="brand-logo" src="${logoDataUrl}" alt="KRAAK Consulting">`
    : '';
  const body = slides.replaceAll('<div class="topline">', `${logo}<div class="topline">`);
  return `<!doctype html><html lang="${content.language}"><head><meta charset="utf-8">
  <title>${escapeHtml(content.title)}</title><style>
    @page { size: 13.333in 7.5in; margin: 0 }
    * { box-sizing: border-box }
    html, body { margin: 0; color: #122B4A; font-family: "Segoe UI", Arial, sans-serif }
    .slide { position: relative; width: 13.333in; height: 7.5in; overflow: hidden;
      page-break-after: always; break-after: page; background: #F3F3F3;
      padding: .49in .72in .7in }
    .slide:last-child { page-break-after: auto; break-after: auto }
    .topline { font-size: 13pt; font-weight: 700; color: #1673AE; letter-spacing: .03em }
    .brand-logo { position: absolute; right: .72in; top: .25in; width: 2.6in; }
    h1 { font-size: 29pt; line-height: 1.12; margin: .31in 0 .22in; max-height: 1in }
    .cover h1 { font-size: 42pt; margin: 1.25in 0 .6in }
    ul { list-style: none; padding: 0; margin: .15in 0; display: flex; flex-direction: column; gap: .12in }
    li { border-left: .045in solid #1673AE; padding: .13in .21in;
      background: #F4FBFD; font-size: 20pt; line-height: 1.25; }
    .marker { display: inline-block; width: .34in; color: #1673AE; font-weight: 700 }
    .cover li { background: transparent; border-left: 0; font-size: 22pt; padding: .1in 0 }
    table { width: 100%; border-collapse: collapse; margin-top: .3in; font-size: 17pt; }
    caption { caption-side: top; text-align: left; font-size: 17pt; line-height: 1.3; padding-bottom: .18in; color: #122B4A }
    th, td { padding: .15in .18in; text-align: left; border: 1px solid #4CC3D9 }
    table.dense-table th, table.dense-table td { padding: .09in .18in; }
    th { background: #1673AE; color: white }
    tr:nth-child(even) { background: #F4FBFD }
    .slide-content { min-width: 0 }
    .slide-content.wide-visual {
      display: grid;
      grid-template-rows: 3.15in minmax(0, 1fr);
      gap: .14in;
      height: 5.08in;
    }
    .slide-content.wide-visual ul {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .08in .14in;
      margin: 0;
      align-content: start;
    }
    .slide-content.wide-visual li {
      font-size: 15pt;
      line-height: 1.15;
      padding: .07in .1in;
    }
    .slide-content.split-visual {
      display: grid;
      grid-template-columns: minmax(0, 1.22fr) minmax(0, 1fr);
      gap: .22in;
      height: 5.02in;
      align-items: stretch;
    }
    .slide-content.split-visual ul {
      margin: 0;
      gap: .1in;
    }
    .slide-content.split-visual li {
      font-size: 15pt;
      line-height: 1.18;
      padding: .1in .13in;
    }
    .teaching-visual {
      margin: 0;
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: .08in;
      background: white;
      border: 1px solid #4CC3D9;
      border-radius: .1in;
      overflow: hidden;
    }
    .visual-frame {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .visual-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .teaching-visual figcaption {
      flex: 0 0 auto;
      margin-top: .05in;
      text-align: center;
      font-size: 10pt;
      line-height: 1.15;
      color: #445977;
    }
    footer { position: absolute; left: .72in; right: .72in; bottom: .3in;
      border-top: 1px solid #4CC3D9; padding-top: .12in; font-size: 10pt; }
  </style></head><body>${body}</body></html>`;
}

export async function renderTeachingPdf(
  content: TeachingSessionContent,
  repositoryRootInput: string,
  outputPathInput: string,
): Promise<TeachingPdfRecord> {
  const repositoryRoot = resolve(repositoryRootInput);
  const outputPath = resolve(outputPathInput);
  const pdfPath = relativePath(repositoryRoot, outputPath);
  const source = await readFile(resolve(repositoryRoot, content.sourcePath), 'utf8');
  if (sha256(source) !== content.sourceSha256)
    throw new Error('Teaching source changed before PDF rendering.');
  await mkdir(dirname(outputPath), { recursive: true });
  const brandLogo = await readFile(
    resolve(repositoryRoot, 'packages/presentations/assets/brand/kraak/kraak-logo.png'),
  );
  const visuals = await resolveTeachingPdfVisuals(content, repositoryRoot);
  const html = renderTeachingPdfHtml(
    content,
    `data:image/png;base64,${brandLogo.toString('base64')}`,
    visuals,
  );
  const browser = await puppeteer.launch({ headless: 'shell' });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      width: '13.333in',
      height: '7.5in',
    });
    const bytes = await readFile(outputPath);
    validatePdfBytes(bytes, pdfPath);
    return {
      schemaVersion: 2,
      sessionId: content.id,
      canonicalModuleIds: [...content.canonicalModuleIds],
      language: content.language,
      sourcePath: content.sourcePath,
      sourceSha256: content.sourceSha256,
      contentSha256: content.contentSha256,
      htmlSha256: sha256(html),
      brandLogoSha256: sha256(brandLogo),
      pdfPath,
      pdfSha256: sha256(bytes),
      slideCount: content.slides.length,
      durationMinutes: content.durationMinutes,
      renderer: { name: 'chromium-via-puppeteer', browserVersion: await browser.version() },
    };
  } finally {
    await browser.close();
  }
}

export async function verifyTeachingPdf(
  content: TeachingSessionContent,
  pdfPathInput: string,
): Promise<TeachingPdfVerification> {
  const bytes = await readFile(pdfPathInput);
  validatePdfBytes(bytes, pdfPathInput);
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = getDocument({ data: new Uint8Array(bytes).slice(), useSystemFonts: true });
  const document = await loadingTask.promise;
  const spec = teachingDeckSpec(content);
  try {
    if (document.numPages !== content.slides.length) {
      throw new Error(
        `Teaching PDF has ${document.numPages} pages; expected ${content.slides.length}.`,
      );
    }
    const results = await Promise.allSettled(
      Array.from({ length: content.slides.length }, async (_, index) => {
        const slide = content.slides[index];
        if (!slide) throw new Error(`Missing teaching slide ${index + 1}.`);

        const page = await document.getPage(index + 1);
        try {
          const text = await page.getTextContent();
          const actual = normalizePdfSemanticText(
            text.items.map((item) => ('str' in item ? item.str : '')).join(' '),
          );
          const visualCaption = spec.slides[index]?.visual?.caption;
          const expected = [
            slide.id,
            slide.title,
            ...slide.items,
            ...(slide.table ? [...slide.table.headers, ...slide.table.rows.flat()] : []),
            ...(visualCaption ? [visualCaption] : []),
          ];

          for (const value of expected) {
            if (!actual.includes(normalizePdfSemanticText(value))) {
              throw new Error(
                `Teaching PDF page ${index + 1} is missing projected text: ${value}.`,
              );
            }
          }
        } finally {
          page.cleanup();
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'rejected') throw result.reason;
    }
  } finally {
    await loadingTask.destroy();
  }
  return {
    schemaVersion: 2,
    sessionId: content.id,
    canonicalModuleIds: [...content.canonicalModuleIds],
    language: content.language,
    sourceSha256: content.sourceSha256,
    contentSha256: content.contentSha256,
    pdfSha256: sha256(bytes),
    pages: content.slides.length,
    slideIds: content.slides.map((slide) => slide.id),
    durationMinutes: content.durationMinutes,
  };
}

export function serializeTeachingPdfRecord(
  record: TeachingPdfRecord | TeachingPdfVerification,
): string {
  return canonicalJson(record);
}
