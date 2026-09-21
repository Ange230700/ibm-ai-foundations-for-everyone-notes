import { sha256 } from '@coursera-notes/core';

export interface DocumentThemeTokens {
  fontFamily: string;
  monoFontFamily: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  alternateSurface: string;
  border: string;
  accent: string;
  accentSurface: string;
  link: string;
}

export interface DocumentStylesheetResult {
  stylesheet: string;
  stylesheetSha256: string;
}

export const DEFAULT_DOCUMENT_THEME: DocumentThemeTokens = {
  fontFamily: 'Inter, Arial, sans-serif',
  monoFontFamily: 'Consolas, "Courier New", monospace',
  background: '#FFFFFF',
  foreground: '#111111',
  muted: '#5F6368',
  surface: '#F5F5F5',
  alternateSurface: '#FAFAFA',
  border: '#D4D4D4',
  accent: '#333333',
  accentSurface: '#EEEEEE',
  link: '#333333',
};

export function createDocumentStylesheet(
  theme: DocumentThemeTokens = DEFAULT_DOCUMENT_THEME,
): DocumentStylesheetResult {
  const stylesheet = `
@page {
  size: A4;
  margin: 18mm 18mm 20mm;

  @bottom-center {
    content: "Page " counter(page) " / " counter(pages);
    color: ${theme.muted};
    font-family: ${theme.fontFamily};
    font-size: 8pt;
  }
}

@page :first {
  @bottom-center {
    content: "";
  }
}

:root {
  color-scheme: light;
  font-family: ${theme.fontFamily};
  color: ${theme.foreground};
  background: ${theme.background};
  font-size: 11pt;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: ${theme.fontFamily};
  color: ${theme.foreground};
  background: ${theme.background};
  font-size: 11pt;
  line-height: 1.5;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.document-body {
  width: 100%;
}

.document-cover {
  min-height: 245mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  break-after: page;
}

.document-cover h1 {
  max-width: 155mm;
  margin: 0 0 8mm;
  color: ${theme.foreground};
  font-size: 34pt;
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.document-cover p {
  max-width: 145mm;
  margin: 0 0 3mm;
  font-size: 12pt;
  line-height: 1.5;
}

.document-cover p:first-of-type {
  color: ${theme.accent};
  font-size: 17pt;
  font-weight: 600;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: ${theme.foreground};
  font-weight: 700;
  break-after: avoid-page;
  page-break-after: avoid;
}

h2 {
  margin: 11mm 0 4mm;
  padding-bottom: 2mm;
  border-bottom: 1.5pt solid ${theme.accent};
  font-size: 20pt;
  line-height: 1.18;
}

h3 {
  margin: 7mm 0 3mm;
  color: ${theme.accent};
  font-size: 14.5pt;
  line-height: 1.25;
}

h4 {
  margin: 5mm 0 2mm;
  font-size: 12pt;
  line-height: 1.3;
}

h5,
h6 {
  margin: 4mm 0 2mm;
  font-size: 11pt;
}

p {
  margin: 0 0 3.2mm;
  orphans: 3;
  widows: 3;
}

a {
  color: ${theme.link};
  text-decoration: none;
}

ul,
ol {
  margin: 2mm 0 4mm;
  padding-left: 7mm;
}

li {
  margin: 0 0 1.8mm;
  padding-left: 1mm;
  break-inside: avoid;
}

li > p {
  margin: 0;
}

li > ul,
li > ol {
  margin-top: 1.5mm;
  margin-bottom: 1mm;
}

.literal-bullet {
  position: relative;
  padding-left: 6mm;
}

blockquote {
  margin: 5mm 0;
  padding: 3.5mm 5mm;
  border-left: 3pt solid ${theme.accent};
  background: ${theme.surface};
  color: ${theme.foreground};
  break-inside: avoid;
}

.inline-code {
  padding: 0.2mm 1mm;
  border-radius: 1mm;
  background: ${theme.surface};
  font-family: ${theme.monoFontFamily};
  font-size: 0.92em;
}

.code-block {
  margin: 5mm 0;
  break-inside: avoid;
}

.code-block figcaption {
  margin-bottom: 1.5mm;
  color: ${theme.accent};
  font-size: 9pt;
  font-weight: 700;
}

pre {
  margin: 0;
  padding: 4mm;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  border: 0.75pt solid ${theme.border};
  border-radius: 2mm;
  background: ${theme.surface};
  color: ${theme.foreground};
  font-family: ${theme.monoFontFamily};
  font-size: 9pt;
  line-height: 1.45;
}

.table-wrap {
  margin: 5mm 0;
  break-inside: avoid;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5pt;
  line-height: 1.4;
}

th,
td {
  padding: 2.5mm 3mm;
  border: 0.75pt solid ${theme.border};
  vertical-align: middle;
}

th {
  background: ${theme.accentSurface};
  color: ${theme.foreground};
  font-weight: 700;
}

tbody tr:nth-child(even) {
  background: ${theme.alternateSurface};
}

.document-figure {
  margin: 6mm auto;
  text-align: center;
  break-inside: avoid;
}

.document-figure img {
  max-width: 100%;
  max-height: 215mm;
  object-fit: contain;
}

.document-figure figcaption {
  margin-top: 2mm;
  color: ${theme.muted};
  font-size: 9pt;
}

.task-marker {
  font-family: "Segoe UI Symbol", ${theme.fontFamily};
}

hr {
  margin: 7mm 0;
  border: 0;
  border-top: 1pt solid ${theme.border};
}

h2 + p,
h3 + p,
h4 + p,
h2 + ul,
h2 + ol,
h3 + ul,
h3 + ol,
h4 + ul,
h4 + ol {
  break-before: avoid-page;
}

h2 + p {
  break-after: avoid-page;
  page-break-after: avoid;
}

.document-section--terminal {
  break-inside: avoid-page;
  page-break-inside: avoid;
}
`.trimStart();

  return {
    stylesheet,
    stylesheetSha256: sha256(stylesheet),
  };
}
