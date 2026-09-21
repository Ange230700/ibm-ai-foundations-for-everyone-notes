import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import {
  atomicWrite,
  repositoryRoot as defaultRepositoryRoot,
  toPosixPath,
} from '@coursera-notes/core';
import {
  extractCanonicalModule,
  serializeNativePptxVerification,
  serializePdfSemanticVerification,
  synthesizeDeckSpec,
  verifyModulePdf,
  verifyNativePptx,
  type NativePptxVerification,
  type PdfSemanticVerificationRecord,
} from '@coursera-notes/presentations';

import type { ResolvedArtifactTarget } from './artifact-target.js';

export type VerificationFormat = 'pdf' | 'pptx';

export interface VerifyArtifactTargetOptions {
  repositoryRoot?: string;
}

export interface PdfVerificationResult {
  format: 'pdf';
  targetKey: string;
  artifactPath: string;
  verificationPath: string;
  verification: PdfSemanticVerificationRecord;
}

export interface PptxVerificationResult {
  format: 'pptx';
  targetKey: string;
  artifactPath: string;
  verificationPath: string;
  verification: NativePptxVerification;
}

export type ArtifactVerificationResult = PdfVerificationResult | PptxVerificationResult;

function repositoryRelativePath(repositoryRoot: string, absolutePath: string): string {
  const value = toPosixPath(relative(repositoryRoot, absolutePath));

  if (value === '..' || value.startsWith('../')) {
    throw new Error(
      `Artifact verification path must remain inside the repository: ${absolutePath}`,
    );
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
  format: VerificationFormat,
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

export async function verifyArtifactTarget(
  target: ResolvedArtifactTarget,
  format: VerificationFormat,
  options: VerifyArtifactTargetOptions = {},
): Promise<ArtifactVerificationResult> {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot());

  const sourcePath = sourceAbsolutePath(repositoryRoot, target.sourcePath);

  const markdown = await readFile(sourcePath, 'utf8');

  const content = await extractCanonicalModule({
    courseId: target.course.id,
    moduleId: target.module.id,
    language: target.language,
    sourcePath,
    repositoryRoot,
  });

  const outputRoot = artifactRoot(repositoryRoot, target, format);

  repositoryRelativePath(repositoryRoot, outputRoot);

  const verificationPath = resolve(outputRoot, 'verification.json');

  if (format === 'pdf') {
    const pdfPath = resolve(outputRoot, 'module.pdf');

    const verification = await verifyModulePdf(markdown, content, {
      repositoryRoot,
      pdfPath,
    });

    await atomicWrite(verificationPath, serializePdfSemanticVerification(verification));

    return {
      format: 'pdf',
      targetKey: target.key,
      artifactPath: repositoryRelativePath(repositoryRoot, pdfPath),
      verificationPath: repositoryRelativePath(repositoryRoot, verificationPath),
      verification,
    };
  }

  const pptxPath = resolve(outputRoot, 'module.pptx');

  const spec = synthesizeDeckSpec(content);

  const verification = await verifyNativePptx(spec, repositoryRoot, pptxPath);

  await atomicWrite(verificationPath, serializeNativePptxVerification(verification));

  return {
    format: 'pptx',
    targetKey: target.key,
    artifactPath: repositoryRelativePath(repositoryRoot, pptxPath),
    verificationPath: repositoryRelativePath(repositoryRoot, verificationPath),
    verification,
  };
}
