import assert from 'node:assert/strict';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { canonicalJson } from '@coursera-notes/core';
import * as verifier from '../src/pptx/verify.js';
import * as pageApi from '../src/document/render-pdf-pages.js';
import * as sheetApi from '../src/document/contact-sheet.js';
import { createDeckSpec, createSourceRef } from './pptx-fixture.js';

test('PPTX visual QA probes converter candidates and reports conversion and pagination failures', async (t) => {
  const root = process.cwd();
  const sourceRef = createSourceRef({ title: 'Test', heading: 'Test', endLine: 2 });
  const spec = createDeckSpec({
    deckId: 'test',
    title: 'Test',
    purpose: 'Verify',
    hashCharacter: 'a',
    sourceRef,
    slides: [
      {
        kind: 'title',
        slideId: 'title',
        title: 'Test',
        subtitle: 'Subtitle',
        sourceRefs: [sourceRef],
      },
    ],
  });
  let available = 'converter';
  let version = { stdout: 'LibreOffice test\n', stderr: '' };
  let conversionFailure: unknown;
  let missingPdf = false;
  let pageCount = 1;
  let profileRemovals = 0;
  const probes: string[] = [];
  const envNames = [
    'LIBREOFFICE_PATH',
    'SOFFICE_PATH',
    'ProgramFiles',
    'ProgramFiles(x86)',
  ] as const;
  const original = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const execute = async (command: string, args: string[]) => {
    if (args[0] === '--version') {
      probes.push(command);
      if (command !== available) throw new Error('unavailable');
      return version;
    }
    assert.ok(args.includes('--headless'));
    assert.ok(args.includes('pdf:impress_pdf_Export'));
    if (conversionFailure !== undefined) throw conversionFailure;
    return { stdout: 'conversion output', stderr: 'conversion error output' };
  };
  t.mock.module('node:child_process', {
    namedExports: {
      ...childProcess,
      execFile: Object.assign(() => undefined, { [promisify.custom]: execute }),
    },
  });
  t.mock.module('node:fs/promises', {
    namedExports: {
      ...fs,
      mkdir: async () => undefined,
      mkdtemp: async () => resolve(root, '.artifacts/lo-profile'),
      readFile: async () => {
        if (missingPdf) throw new Error('missing PDF');
        return Buffer.from('converted PDF');
      },
      rm: async (path: string) => {
        if (path.endsWith('lo-profile')) profileRemovals++;
      },
    },
  });
  t.mock.module('../src/pptx/verify.js', {
    namedExports: {
      ...verifier,
      verifyNativePptx: async () => ({ deckSpecSha256: 'deck', pptxSha256: 'pptx' }),
      serializeNativePptxVerification: canonicalJson,
    },
  });
  t.mock.module('../src/document/render-pdf-pages.js', {
    namedExports: { ...pageApi, renderPdfPages: async () => ({ pageCount }) },
  });
  t.mock.module('../src/document/contact-sheet.js', {
    namedExports: { ...sheetApi, createPdfContactSheets: async () => ({ sheets: [] }) },
  });
  const {
    resolveLibreOfficeExecutable,
    renderNativePptxVisualQa,
    serializeNativePptxVisualQaManifest,
  } = await import('../src/pptx/visual-qa.js?failures');
  const options = {
    repositoryRoot: root,
    pptxPath: resolve(root, 'source.pptx'),
    outputRoot: resolve(root, '.artifacts/qa'),
    libreOfficePath: 'converter',
  };
  try {
    assert.equal((await resolveLibreOfficeExecutable('converter')).version, 'LibreOffice test');
    version = { stdout: '', stderr: 'stderr version' };
    assert.equal((await resolveLibreOfficeExecutable('converter')).version, 'stderr version');
    version = { stdout: '\n', stderr: '' };
    assert.equal((await resolveLibreOfficeExecutable('converter')).version, 'unknown');
    await assert.rejects(
      resolveLibreOfficeExecutable('bad'),
      /Configured LibreOffice executable is unavailable/,
    );
    for (const name of envNames) delete process.env[name];
    available = '/usr/bin/libreoffice';
    assert.equal((await resolveLibreOfficeExecutable()).executable, available);
    process.env.LIBREOFFICE_PATH = 'bad';
    process.env.SOFFICE_PATH = 'bad';
    process.env.ProgramFiles = 'program';
    process.env['ProgramFiles(x86)'] = 'program-x86';
    available = 'soffice';
    assert.equal((await resolveLibreOfficeExecutable()).executable, 'soffice');
    assert.ok(probes.some((path) => path.endsWith('soffice.com')));
    assert.ok(probes.some((path) => path.endsWith('soffice.exe')));
    available = 'absent';
    await assert.rejects(resolveLibreOfficeExecutable(), /LibreOffice was not found/);
    available = 'converter';
    for (const path of [resolve(root, '..'), resolve(root, '../outside')])
      for (const field of ['pptxPath', 'outputRoot'])
        await assert.rejects(
          renderNativePptxVisualQa(spec, { ...options, [field]: path }),
          /inside the repository/,
        );
    for (const outputRoot of [options.pptxPath, root])
      await assert.rejects(
        renderNativePptxVisualQa(spec, { ...options, outputRoot }),
        /must not contain/,
      );
    await assert.rejects(
      renderNativePptxVisualQa(spec, { ...options, documentId: '../invalid' }),
      /Invalid PPTX visual-QA document id/,
    );
    const result = await renderNativePptxVisualQa(spec, options);
    assert.equal(result.converter.name, 'libreoffice');
    assert.match(serializeNativePptxVisualQaManifest(result), /qaInputSha256/);
    await renderNativePptxVisualQa(spec, {
      ...options,
      documentId: 'custom',
      dpi: 100,
      columns: 1,
      pagesPerSheet: 1,
      thumbnailWidth: 100,
    });
    for (const error of [new Error('convert failed'), 'plain failure']) {
      conversionFailure = error;
      await assert.rejects(renderNativePptxVisualQa(spec, options), /conversion failed/);
    }
    conversionFailure = undefined;
    missingPdf = true;
    await assert.rejects(
      renderNativePptxVisualQa(spec, options),
      /did not create the expected PDF.*conversion output.*conversion error output/,
    );
    missingPdf = false;
    pageCount = 2;
    await assert.rejects(renderNativePptxVisualQa(spec, options), /page count mismatch/);
    assert.equal(profileRemovals, 6);
  } finally {
    for (const name of envNames) {
      const value = original[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
