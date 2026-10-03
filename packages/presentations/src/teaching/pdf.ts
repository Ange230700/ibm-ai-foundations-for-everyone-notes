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

const TEACHING_VISUAL_PATH =
  /^teaching\/visuals\/(?:s01|s02|s03)\/(?:en|fr)\/[a-z-]+\.(?:svg|png)$/u;

export async function resolveTeachingPdfVisuals(
  content: TeachingSessionContent,
  repositoryRootInput: string,
): Promise<Map<string, TeachingPdfVisual>> {
  const repositoryRoot = resolve(repositoryRootInput);
  const spec = teachingDeckSpec(content);
  const visuals = new Map<string, TeachingPdfVisual>();

  for (const slide of spec.slides) {
    if (!slide.visual) continue;

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

    visuals.set(slide.slideId, {
      slideId: slide.slideId,
      kind,
      path,
      caption,
      dataUrl: `data:${mime};base64,${bytes.toString('base64')}`,
      sha256: sha256(bytes),
    });
  }

  return visuals;
}

function slideHtml(
  slide: TeachingSlide,
  index: number,
  content: TeachingSessionContent,
  visual?: TeachingPdfVisual,
): string {
  const title = escapeHtml(slide.title);
  const body = slide.table
    ? `<table><thead><tr>${slide.table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${slide.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : `<ul>${slide.items
        .map((item, itemIndex) => {
          const kind = slide.itemKinds[itemIndex];
          const label = kind === 'ordered' ? `${itemIndex + 1}.` : kind === 'bullet' ? '•' : '';
          return `<li><span class="marker">${label}</span>${escapeHtml(item)}</li>`;
        })
        .join('')}</ul>`;
  const figure = visual
    ? `<figure class="teaching-visual"><div class="visual-frame"><img src="${visual.dataUrl}" alt="${escapeHtml(visual.caption)}"></div><figcaption>${escapeHtml(visual.caption)}</figcaption></figure>`
    : '';

  const projected = visual
    ? visual.kind === 'simulation'
      ? `<div class="slide-content split-visual">${body}${figure}</div>`
      : `<div class="slide-content wide-visual">${figure}${body}</div>`
    : body;

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
    th, td { padding: .15in .18in; text-align: left; border: 1px solid #4CC3D9 }
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
  </style></head><body>${slides.replaceAll('<div class="topline">', `${logoDataUrl ? `<img class="brand-logo" src="${logoDataUrl}" alt="KRAAK Consulting">` : ''}<div class="topline">`)}</body></html>`;
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
    for (let index = 0; index < content.slides.length; index += 1) {
      const slide = content.slides[index];
      if (!slide) throw new Error(`Missing teaching slide ${index + 1}.`);
      const page = await document.getPage(index + 1);
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
          throw new Error(`Teaching PDF page ${index + 1} is missing projected text: ${value}.`);
        }
      }
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
