import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyAuthoredDocumentPdf } from '../src/document/render-authored-document.js';

// A real one-page PDF fixture exercises extraction without requiring Chromium.
function textPdf(): Buffer {
  const stream =
    'BT /F1 12 Tf 50 720 Td (Authored document) Tj 0 -20 Td (Preserve the source.) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = `%PDF-1.4\n%${'fixture '.repeat(100)}\n`;
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

test('authored document verifier reads real PDF text in semantic order', async () => {
  const root = await mkdtemp(join(tmpdir(), 'authored-pdf-'));
  const outputPath = join(root, 'document.pdf');
  try {
    await writeFile(outputPath, textPdf());
    const result = await verifyAuthoredDocumentPdf('# Authored document\n\nPreserve the source.', {
      repositoryRoot: root,
      sourcePath: 'document.md',
      outputPath,
      profile: 'document',
      language: 'en',
    });
    assert.equal(result.pages, 1);
    assert.deepEqual(result.blocks, { expected: 2, matched: 2 });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
