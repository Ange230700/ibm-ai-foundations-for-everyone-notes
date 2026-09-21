import { relative, resolve } from 'node:path';

import {
  atomicWrite,
  repositoryRoot as defaultRepositoryRoot,
  toPosixPath,
} from '@coursera-notes/core';
import {
  createPdfContactSheets,
  extractCanonicalModule,
  renderNativePptxVisualQa,
  renderPdfPages,
  serializeNativePptxVisualQaManifest,
  serializePdfContactSheetManifest,
  serializePdfPageRenderManifest,
  synthesizeDeckSpec,
  type NativePptxVisualQaManifest,
  type PdfContactSheetManifest,
  type PdfPageRenderManifest,
} from '@coursera-notes/presentations';

import type { ResolvedArtifactTarget } from './artifact-target.js';

export type VisualQaFormat = 'pdf' | 'pptx';

export interface ExecuteVisualQaTargetOptions {
  repositoryRoot?: string;
  dpi?: number;
  columns?: number;
  pagesPerSheet?: number;
  thumbnailWidth?: number;
  libreOfficePath?: string;
}

export interface PdfVisualQaResult {
  format: 'pdf';
  targetKey: string;
  artifactPath: string;
  pageRenderManifestPath: string;
  contactSheetManifestPath: string;
  pageRender: PdfPageRenderManifest;
  contactSheets: PdfContactSheetManifest;
}

export interface PptxVisualQaResult {
  format: 'pptx';
  targetKey: string;
  artifactPath: string;
  manifestPath: string;
  manifest: NativePptxVisualQaManifest;
}

export type VisualQaResult = PdfVisualQaResult | PptxVisualQaResult;

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(`Visual-QA path must remain inside the repository: ${absolutePath}`);
  }

  return value;
}

function sourceAbsolutePath(repositoryRoot: string, sourcePath: string): string {
  const absolute = resolve(repositoryRoot, ...sourcePath.split('/'));

  repositoryRelativePath(repositoryRoot, absolute);

  return absolute;
}

function artifactRoot(
  repositoryRoot: string,
  target: ResolvedArtifactTarget,
  format: VisualQaFormat,
): string {
  return resolve(
    repositoryRoot,
    '.artifacts',
    format === 'pdf' ? 'document-pdf' : 'native-pptx',
    target.course.id,
    target.module.id,
    target.language,
  );
}

export async function executeVisualQaTarget(
  target: ResolvedArtifactTarget,
  format: VisualQaFormat,
  options: ExecuteVisualQaTargetOptions = {},
): Promise<VisualQaResult> {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot());

  const root = artifactRoot(repositoryRoot, target, format);

  repositoryRelativePath(repositoryRoot, root);

  const visualQaRoot = resolve(root, 'visual-qa');

  const dpi = options.dpi ?? 200;

  const columns = options.columns ?? 2;

  const pagesPerSheet = options.pagesPerSheet ?? 10;

  const thumbnailWidth = options.thumbnailWidth ?? 520;

  if (format === 'pdf') {
    const pdfPath = resolve(root, 'module.pdf');

    const pageRoot = resolve(visualQaRoot, 'pages');

    const contactSheetRoot = resolve(visualQaRoot, 'contact-sheets');

    const pageRenderManifestPath = resolve(visualQaRoot, 'page-render.json');

    const contactSheetManifestPath = resolve(visualQaRoot, 'contact-sheets.json');

    const pageRender = await renderPdfPages({
      repositoryRoot,
      pdfPath,
      outputRoot: pageRoot,
      dpi,
    });

    const contactSheets = await createPdfContactSheets(pageRender, {
      repositoryRoot,
      outputRoot: contactSheetRoot,
      documentId: target.key,
      columns,
      pagesPerSheet,
      thumbnailWidth,
    });

    if (contactSheets.pdfSha256 !== pageRender.pdfSha256) {
      throw new Error(
        [
          'PDF visual-QA checksum mismatch.',
          `pages=${pageRender.pdfSha256}`,
          `contact-sheets=${contactSheets.pdfSha256}`,
        ].join(' '),
      );
    }

    await Promise.all([
      atomicWrite(pageRenderManifestPath, serializePdfPageRenderManifest(pageRender)),
      atomicWrite(contactSheetManifestPath, serializePdfContactSheetManifest(contactSheets)),
    ]);

    return {
      format: 'pdf',
      targetKey: target.key,
      artifactPath: repositoryRelativePath(repositoryRoot, pdfPath),
      pageRenderManifestPath: repositoryRelativePath(repositoryRoot, pageRenderManifestPath),
      contactSheetManifestPath: repositoryRelativePath(repositoryRoot, contactSheetManifestPath),
      pageRender,
      contactSheets,
    };
  }

  const sourcePath = sourceAbsolutePath(repositoryRoot, target.sourcePath);

  const content = await extractCanonicalModule({
    courseId: target.course.id,
    moduleId: target.module.id,
    language: target.language,
    sourcePath,
    repositoryRoot,
  });

  const spec = synthesizeDeckSpec(content);

  const pptxPath = resolve(root, 'module.pptx');

  const manifestPath = resolve(visualQaRoot, 'manifest.json');

  const manifest = await renderNativePptxVisualQa(spec, {
    repositoryRoot,
    pptxPath,
    outputRoot: visualQaRoot,
    documentId: target.key,
    dpi,
    columns,
    pagesPerSheet,
    thumbnailWidth,
    ...(options.libreOfficePath === undefined
      ? {}
      : {
          libreOfficePath: options.libreOfficePath,
        }),
  });

  await atomicWrite(manifestPath, serializeNativePptxVisualQaManifest(manifest));

  return {
    format: 'pptx',
    targetKey: target.key,
    artifactPath: repositoryRelativePath(repositoryRoot, pptxPath),
    manifestPath: repositoryRelativePath(repositoryRoot, manifestPath),
    manifest,
  };
}
