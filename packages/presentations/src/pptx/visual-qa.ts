import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { canonicalJson, sha256, toPosixPath } from '@coursera-notes/core';

import { createPdfContactSheets, type PdfContactSheetManifest } from '../document/contact-sheet.js';
import { renderPdfPages, type PdfPageRenderManifest } from '../document/render-pdf-pages.js';
import type { DeckSpec } from '../deck/model.js';
import {
  serializeNativePptxVerification,
  verifyNativePptx,
  type NativePptxVerification,
} from './verify.js';

const execFileAsync = promisify(execFile);

export const PPTX_VISUAL_QA_VERSION = 1;

export interface LibreOfficeIdentity {
  executable: string;
  version: string;
}

export interface NativePptxVisualQaOptions {
  repositoryRoot: string;
  pptxPath: string;
  outputRoot: string;
  documentId?: string;
  libreOfficePath?: string;
  dpi?: number;
  columns?: number;
  pagesPerSheet?: number;
  thumbnailWidth?: number;
}

export interface NativePptxVisualQaManifest {
  schemaVersion: 1;
  visualQaVersion: number;
  deckId: string;
  deckSpecSha256: string;
  pptxPath: string;
  pptxSha256: string;
  qaInputSha256: string;
  converter: {
    name: 'libreoffice';
    version: string;
  };
  convertedPdf: {
    path: string;
    sha256: string;
    bytes: number;
  };
  structuralVerificationSha256: string;
  structuralVerification: NativePptxVerification;
  pageRender: PdfPageRenderManifest;
  contactSheets: PdfContactSheetManifest;
}

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`PPTX visual-QA artifact must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

function isWithin(root: string, candidate: string): boolean {
  const value = relative(root, candidate);

  return value === '' || (value !== '..' && !value.startsWith(`..${sep}`) && !isAbsolute(value));
}

function executableCandidates(): string[] {
  const values = [
    process.env.LIBREOFFICE_PATH,
    process.env.SOFFICE_PATH,
    process.env.ProgramFiles
      ? join(process.env.ProgramFiles, 'LibreOffice', 'program', 'soffice.exe')
      : undefined,
    process.env['ProgramFiles(x86)']
      ? join(process.env['ProgramFiles(x86)'], 'LibreOffice', 'program', 'soffice.exe')
      : undefined,
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/bin/libreoffice',
    '/usr/bin/soffice',
    'soffice',
    'libreoffice',
  ].filter((value): value is string => Boolean(value));

  return [...new Set(values)];
}

function versionLine(stdout: string, stderr: string): string {
  const value = [stdout, stderr]
    .join('\n')
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find(Boolean);

  return value ?? 'unknown';
}

async function probeLibreOffice(executable: string): Promise<LibreOfficeIdentity | undefined> {
  try {
    const result = await execFileAsync(executable, ['--version'], {
      windowsHide: true,
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
    });

    return {
      executable,
      version: versionLine(result.stdout, result.stderr),
    };
  } catch {
    return undefined;
  }
}

export async function resolveLibreOfficeExecutable(
  explicitPath?: string,
): Promise<LibreOfficeIdentity> {
  if (explicitPath) {
    const result = await probeLibreOffice(explicitPath);

    if (!result) {
      throw new Error(`Configured LibreOffice executable is unavailable: ${explicitPath}`);
    }

    return result;
  }

  for (const candidate of executableCandidates()) {
    const result = await probeLibreOffice(candidate);

    if (result) {
      return result;
    }
  }

  throw new Error(
    [
      'LibreOffice was not found.',
      'Install LibreOffice or set LIBREOFFICE_PATH/SOFFICE_PATH to the soffice executable.',
      'PPTX visual QA is optional and is not required by pnpm check.',
    ].join(' '),
  );
}

async function convertPptxToPdf(
  pptxPath: string,
  pdfRoot: string,
  converter: LibreOfficeIdentity,
): Promise<string> {
  await mkdir(pdfRoot, {
    recursive: true,
  });

  const profileRoot = await mkdtemp(join(tmpdir(), 'coursera-pptx-lo-'));

  const outputName = `${basename(pptxPath, extname(pptxPath))}.pdf`;

  const pdfPath = resolve(pdfRoot, outputName);

  try {
    let stdout = '';
    let stderr = '';

    try {
      const result = await execFileAsync(
        converter.executable,
        [
          `-env:UserInstallation=${pathToFileURL(profileRoot).href}`,
          '--headless',
          '--nologo',
          '--nodefault',
          '--nolockcheck',
          '--nofirststartwizard',
          '--convert-to',
          'pdf:impress_pdf_Export',
          '--outdir',
          pdfRoot,
          pptxPath,
        ],
        {
          windowsHide: true,
          timeout: 120_000,
          maxBuffer: 4 * 1024 * 1024,
        },
      );

      stdout = result.stdout;

      stderr = result.stderr;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`LibreOffice PPTX-to-PDF conversion failed: ${message}`, {
        cause: error,
      });
    }

    try {
      await readFile(pdfPath);
    } catch {
      throw new Error(
        [`LibreOffice did not create the expected PDF: ${pdfPath}.`, stdout.trim(), stderr.trim()]
          .filter(Boolean)
          .join(' '),
      );
    }

    return pdfPath;
  } finally {
    await rm(profileRoot, {
      recursive: true,
      force: true,
    });
  }
}

export async function renderNativePptxVisualQa(
  spec: DeckSpec,
  options: NativePptxVisualQaOptions,
): Promise<NativePptxVisualQaManifest> {
  const repositoryRoot = resolve(options.repositoryRoot);

  const pptxPath = resolve(options.pptxPath);

  const outputRoot = resolve(options.outputRoot);

  const relativePptxPath = repositoryRelativePath(repositoryRoot, pptxPath);

  repositoryRelativePath(repositoryRoot, outputRoot);

  if (isWithin(outputRoot, pptxPath)) {
    throw new Error(
      'PPTX visual-QA output root must not contain the source PPTX because the QA directory is cleaned before rendering.',
    );
  }

  const documentId = options.documentId ?? spec.deckId;

  if (!/^[A-Za-z0-9._-]+$/u.test(documentId)) {
    throw new Error(`Invalid PPTX visual-QA document id: ${documentId}`);
  }

  const dpi = options.dpi ?? 200;

  const columns = options.columns ?? 2;

  const pagesPerSheet = options.pagesPerSheet ?? 10;

  const thumbnailWidth = options.thumbnailWidth ?? 520;

  const structuralVerification = await verifyNativePptx(spec, repositoryRoot, pptxPath);

  const converter = await resolveLibreOfficeExecutable(options.libreOfficePath);

  await rm(outputRoot, {
    recursive: true,
    force: true,
  });

  await mkdir(outputRoot, {
    recursive: true,
  });

  const pdfRoot = resolve(outputRoot, 'pdf');

  const pageRoot = resolve(outputRoot, 'pages');

  const contactSheetRoot = resolve(outputRoot, 'contact-sheets');

  const convertedPdfPath = await convertPptxToPdf(pptxPath, pdfRoot, converter);

  const pageRender = await renderPdfPages({
    repositoryRoot,
    pdfPath: convertedPdfPath,
    outputRoot: pageRoot,
    dpi,
  });

  if (pageRender.pageCount !== spec.slides.length) {
    throw new Error(
      `LibreOffice-converted PPTX page count mismatch: expected ${spec.slides.length}, found ${pageRender.pageCount}.`,
    );
  }

  const contactSheets = await createPdfContactSheets(pageRender, {
    repositoryRoot,
    outputRoot: contactSheetRoot,
    documentId,
    columns,
    pagesPerSheet,
    thumbnailWidth,
  });

  const convertedPdfBytes = await readFile(convertedPdfPath);

  const structuralVerificationSha256 = sha256(
    serializeNativePptxVerification(structuralVerification),
  );

  const qaInputSha256 = sha256(
    canonicalJson({
      visualQaVersion: PPTX_VISUAL_QA_VERSION,
      deckSpecSha256: structuralVerification.deckSpecSha256,
      pptxSha256: structuralVerification.pptxSha256,
      converter: {
        name: 'libreoffice',
        version: converter.version,
      },
      render: {
        dpi,
        columns,
        pagesPerSheet,
        thumbnailWidth,
      },
    }),
  );

  return {
    schemaVersion: 1,
    visualQaVersion: PPTX_VISUAL_QA_VERSION,
    deckId: spec.deckId,
    deckSpecSha256: structuralVerification.deckSpecSha256,
    pptxPath: relativePptxPath,
    pptxSha256: structuralVerification.pptxSha256,
    qaInputSha256,
    converter: {
      name: 'libreoffice',
      version: converter.version,
    },
    convertedPdf: {
      path: repositoryRelativePath(repositoryRoot, convertedPdfPath),
      sha256: sha256(convertedPdfBytes),
      bytes: convertedPdfBytes.byteLength,
    },
    structuralVerificationSha256,
    structuralVerification,
    pageRender,
    contactSheets,
  };
}

export function serializeNativePptxVisualQaManifest(manifest: NativePptxVisualQaManifest): string {
  return canonicalJson(manifest);
}
